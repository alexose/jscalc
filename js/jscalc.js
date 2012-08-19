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
                height: 300,
                width: 300,
                maxchars: 15,
                css : {
                    container : 'jscalc',
                    button: 'button',
                    first: 'first',
                    screen: 'screen',
                    active: 'active'
                },
                buttons : [
                    ['', '', '', '', 'C'],
                    ['7', '8', '9', '/', 'sqrt'],
                    ['4', '5', '6', '*', '%'],
                    ['1', '2', '3', '-', '1/x'],
                    ['0', '+/-', '.', '+', '=']
                ]
            }
            
            var options = $.extend(defaults, options);
            
            return this.each(function() {
                var calculator = new Calculator(this, options);
            });
        }
    });

    // Classes
    Calculator = function(ele, o){
        this.init(ele, o);
    };

    Calculator.prototype = {
        init : function(container, options) {
            this.options = options;
            this.container = $(container)
                .height(options.height)
                .width(options.width)
                .addClass(options.css.container);

            var defaults, calc, operations;
           
            // Determine cell heights and widths
            this.options.cellHeight = Math.floor(options.height / options.buttons.length + 1)
            this.options.cellWidth = Math.floor(options.width / options.buttons[0].length);

            // Create & resize screen
            var screen = this.screen = new Calculator.Screen('screen', options);

            // Append screen element to DOM
            screen.element
                .appendTo(this.container);
 
            // Create buttons
            this.buttons = {};
            for (var i in options.buttons){
                var row = options.buttons[i];
                for (var c in row){

                    var name = row[c];
                    var button = this.buttons[name] = new Calculator.Button(name, screen, options);
                    var cssClass = (c == 0) ? options.css.first : '';
                    
                    // Append element to DOM
                    button.element
                        .addClass(cssClass)
                        .appendTo(this.container);
                }
            }
        }
    };

    // Screen class.  Displays the output. 
    Calculator.Screen = function(name, options){
        this.init(name, options);
    }

    Calculator.Screen.prototype = {
        init : function(name, options){
            this.name = name;
            this.options = options;
            this.span = $('<span>0</span>');
            this.element = $('<div />')
                .height(options.cellHeight)
                .width(options.width)
                .css({'line-height': options.cellHeight + 'px'}) 
                .addClass(options.css.screen)
                .append(this.span);
            return this;
        },

        display : function(value){
            var val = this.span.text()
            val = (val == 0) ? '' : val;
            if (val.length > this.options.maxchars)
                return;
            this.span.text(val + '' + value);
            return;
        }
    }

    // Button class.  Takes user input.
    Calculator.Button = function(name, screen, options){
        this.init(name, screen, options);
    };

    Calculator.Button.prototype = {
        init : function(value, screen, options){
            this.name = value;
            this.screen = screen;
            this.element = $('<div />')
                .height(options.cellHeight)
                .width(options.cellWidth)
                .css({'line-height': options.cellHeight + 'px'}) 
                .addClass(options.css.button)
                .html('<span>' + value + '</span>')
                .mousedown(function(evt){
                    $(evt.target).addClass(options.css.active);
                })
                .bind('mouseleave mouseup', function(evt){
                    $(evt.target).removeClass(options.css.active);
                })
                .click($.proxy(function(){
                    this.run(); 
                }, this));
            return this;
        },
        run : function(){
            console.log(this.name); 
            this.screen.display(this.name);
        }
    };

})(jQuery);
