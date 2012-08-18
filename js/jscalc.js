/**
 * jsCalc 0.1.0
 * jsCalc is a lightweight jQuery plugin that allows you to turn an ordinary element into a fully-functional calculator.
 *
 * Copyright 2012, Alexander Ose 
 * Licensed under the MIT license.
 * http://github.com/alexose/jscalc/
 */

/*jslint white: true, browser: true, plusplus: true, indent: 4, maxerr: 50 */

// Wrap everything in an anonymous function in order to avoid potential namespace collisions
(function($, window, Calculator){
    "use strict";
    
    // jQuery plugin declaration
    $.fn.extend({ 
        jscalc: function(options) {
            var defaults = {
                height: '300px',
                width: '300px',
                css : {
                    container : 'js-calc',
                    button: 'button'
                },
                buttons : [
                    ['7', '8', '9', '/', 'sqrt'],
                    ['4', '5', '6', '*', '%'],
                    ['1', '2', '3', '-', '1/x'],
                    ['0', '+/-', '.', '+', '=']
                ]
            }
            
            var options = $.extend(defaults, options);
            
            return this.each(function() {
                var calculator = new Calculator();
                calculator.init(this, options);
            });
        }
    });

    // Classes
    Calculator = function(){}

    Calculator.prototype = {
        init : function(container, settings) {
            this.container = $(container);
            this.buttons = {};
            var defaults, calc, buttons, operations;
            
            for (var i in settings.buttons){
                var row = settings.buttons[i];
                for (var c in row){
                    var name = row[c];
                    this.buttons[name] = new this.Button(name); 
                }
            }
        }
    };

    Calculator.prototype.Button = function(value){
        this.name = value;
        this.element = $('<div />')
            .addClass('button')
            .click(function(){
                console.log('congrats!');
            });
        return this;
    };

})(jQuery);
