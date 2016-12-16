/*!
 * jQuery Dynamic Select plugin
 * https://github.com/sorites/dynamic-select
 * Copyright (c) 2013 Peter Jezik (twitter.com/peterjezik)
 * Licensed under the MIT License (http://www.opensource.org/licenses/mit-license.php)
 */

/*!
 * based on
 */

/*!
 * jQuery lightweight plugin boilerplate
 * Original author: @ajpiano
 * Further changes, comments: @addyosmani
 * Licensed under the MIT license
 */

;(function ( $, window, document, undefined ) {

    // Create the defaults once
    var pluginName = 'dynamicSelect',
        defaults = {
            noSelectValue : "",
            optionValues : {}
        };

    // The actual plugin constructor
    function Plugin( element, options ) {
        this.element = element;

        this.options = $.extend( {}, defaults, options) ;

        this._defaults = defaults;
        this._name = pluginName;

        this.selectors = this.options.selectors;
        this.structure = this.options.structure;
        this.captions = this.options.captions;
        this.noSelectValue = this.options.noSelectValue;
        this.existingOptionValues = this.options.optionValues;
        this.context = this.element;

        this.createKeysMethodIfNecessary();
        this.selectors = this.createSelectorsIfNecessary();
        this.captions = this.createCaptionsIfNecessary();

        this.init();
    }

    Plugin.prototype = {

        init: function() {

            this.populateSelect({true: this.structure}, -1, true);
            this.disableNextSelects(-1);

            for (var i = 0; i < this.selectors.length - 1; i++) {
                var selector = this.selectors[i];
                $(this.context).on("change", selector, {"level": i, "plugin": this}, function(event){
                    var val = $("option:selected", $(this)).text();
                    var level = event.data.level;
                    var plugin = event.data.plugin;
                    var substructure = plugin.calculateSubstructure(level);
                    plugin.populateSelect(substructure, level, val);
                    plugin.disableNextSelects(level);
               });
            }
        },

        getOptionValue: function(key){
            return (key in this.existingOptionValues) ? this.existingOptionValues[key] : key;
        },

        populateSelect: function(substructure, level, optionValue) {
            if (optionValue === this.captions[level]) {
                return false;
            }
            var currentSelect = this.selectors[level];
            var nextSelect = this.selectors[level + 1];
            var optionsObject = substructure[optionValue];
            if (typeof optionsObject === "undefined") {
                return false;
            }

            var optionsToPopulate = $.isArray(optionsObject) ? optionsObject : Object.keys(substructure[optionValue]);

            var options = "<option class='dynamic-select-option' value=" + this.noSelectValue +">" + this.captions[level+1] + "</option>";
            for (key in optionsToPopulate){
                var optionText = optionsToPopulate[key];
                var optionValue = this.getOptionValue(optionText);
                options += "<option class='dynamic-select-option' value='" + optionValue + "'>" + optionText + "</option>";
            }

            $(currentSelect, this.context).removeClass("dynamic-select-active");
            $(nextSelect, this.context).html(options)
                                   .addClass("dynamic-select-active dynamic-select-enabled")
                                   .removeAttr("disabled");
        },

        calculateSubstructure: function(level){
            if (level === 0) {
                return this.structure;
            }
            else{
                var substructure = this.structure;
                for (var i = 0; i < level; i++) {
                    var mainSelector = this.selectors[i];
                    var mainValue = $(mainSelector + " option:selected", this.context).text();
                    substructure = substructure[mainValue];
                }

                return substructure;

            }
        },

        disableNextSelects: function(level){
            for (var i = level + 2; i <= this.selectors.length; i++) {
                var selector = this.selectors[i];
                $(selector, this.context).prop("disabled", "disabled")
                    .removeClass("dynamic-select-enabled dynamic-select-active")
                    .html("<option class='dynamic-select-option' value=" + this.noSelectValue +">" + this.captions[i] + "</option>");
            }
        },

        createKeysMethodIfNecessary: function(){
            if (typeof Object.keys !== "function") {
                (function() {
                    Object.keys = Object_keys;
                    function Object_keys(obj) {
                        var keys = [], name;
                        for (name in obj) {
                            if (obj.hasOwnProperty(name)) {
                                keys.push(name);
                            }
                        }
                        return keys;
                    }
                })();
            }
        },

        createSelectorsIfNecessary: function(){
            if (typeof this.selectors === "undefined") {
                var numOfSelects = $("select", this.context).length;
                var selectors = new Array(numOfSelects);
                for (var i = 0; i < numOfSelects; i++) {
                    selectors[i] = "select:eq(" + i + ")";
                }
                return selectors;
            }
            else{
                return this.selectors;
            }
        },

        createCaptionsIfNecessary: function(){
            if (typeof this.captions === "undefined") {
                var numOfSelects = this.selectors.length;
                var captions = new Array(numOfSelects);
                for (var i = 0; i < numOfSelects; i++) {
                    captions[i] = "&nbsp;";
                }
                return captions;
            }
            else{
                return this.captions;
            }
        }
    };

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName,
                new Plugin( this, options ));
            }
        });
    }

})( jQuery, window, document );