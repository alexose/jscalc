/**
 * jsCalc 0.1.0
 * jsCalc is a lightweight jQuery plugin that allows you to turn an ordinary element into a fully-functional calculator.
 *
 * Copyright 2012, Alexander Ose 
 * Licensed under the MIT license.
 * http://github.com/alexose/jscalc/
 */

/*jslint white: true, browser: true, plusplus: true, indent: 4, maxerr: 50 */

(function($, window, Calculator){
    "use strict";

    Calculator = function (container, settings) {
        this.container = $(container);
        var priv, self = this;
        console.log(container);
    }

    $.fn.extend({ 
        jscalc: function(options) {
            var defaults = {
                height: '300px',
                width: '300px'
            }
            
            var options =  $.extend(defaults, options);
            
            return this.each(function() {
                var o = options;
                var calculator = new Calculator(this); 
            });
        }
    });
})(jQuery);
