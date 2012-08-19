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
                    ['(', ')', '', '', 'C'],
                    ['7', '8', '9', '/', 'sqrt'],
                    ['4', '5', '6', '*', '%'],
                    ['1', '2', '3', '-', '1/x'],
                    ['0', '+/-', '.', '+', '=']
                ],
                operators : [
                    { '=' : 'solve' },
                    { '1/x' : 'inverse' },
                    { '%' : 'percentage' },
                    { 'squareroot' : 'squareroot' },
                    { 'C' : 'clear' },
                    { '+/-' : 'signflip' }
                ]
            }
            
            var options = $.extend(defaults, options);
            
            return this.each(function() {
                var calculator = new Calculator(this, options);
            });
        }
    });

    Calculator = function(ele, o){
        this.init(ele, o);
    };

    Calculator.prototype = {
        init : function(container, options) {
            this.options = options;
            this.calculator = this;
            this.container = $(container)
                .height(options.height)
                .width(options.width)
                .addClass(options.css.container);

            var defaults, calc, operations;
           
            // Determine cell heights and widths
            this.options.cellHeight = Math.floor(options.height / (options.buttons.length + 1))
            this.options.cellWidth = Math.floor(options.width / options.buttons[0].length);

            // Create & resize screen
            var screen = this.screen = new Calculator.Screen('screen', options);
            // Append screen element to DOM
            screen.element.appendTo(this.container);
 
            // Create buttons
            this.buttons = {};
            for (var i in options.buttons){
                var row = options.buttons[i];
                for (var c in row){
                    var name = row[c];
                    var button = this.buttons[name] = new Calculator.Button(name, this, options);
                    var cssClass = (c == 0) ? options.css.first : '';
                    
                    // Append element to DOM
                    button.element
                        .addClass(cssClass)
                        .appendTo(this.container);
                }
            }
        },

        clear : function(){
            this.screen.setExpression('');
            return;
        },
        
        percentage : function(){
            return;
        },

        inverse : function(){
            return;
        },

        signflip: function(){
            return;
        },

        validate : function(expression){
            // Match parentheses
            if (expression.split('(').length !== expression.split(')').length)
                return false;
            
            // Prevent divide by zero
            if (expression == 0)
                return false;

            return true;
        },

        solve : function(){
            var expression = this.screen.getExpression();
            try{
                if (!this.validate(expression))
                    throw new Error("Validation failed.");
            } catch (e){
                console.log(e.name + " " + e.message);
            }

            // Recursive function to break apart parenthetical statements
            var breakApart = function(expression){
                if (expression.indexOf('(') !== -1)
                    breakApart(expression.match(/\((.*?)\)/));    
                else
                    calculate(expression)
            };

            var calculate = function(expression){
                console.log(expression)
            };
            breakApart(expression);
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
        },

        getExpression : function(){
            return this.span.text();
        },

        setExpression : function(value){
            return this.span.text(value);
        }
    }

    // Button class.  Takes user input.
    Calculator.Button = function(name, calculator){
        this.init(name, calculator);
    };

    Calculator.Button.prototype = {
        init : function(value, calculator){
            this.name = value;
            this.calculator = calculator;
            var options = this.options = calculator.options;

            // Match this button against available operators
            // TODO: avoid these nested for loops
            for (var i in options.operators){
                var obj = options.operators[i];
                for (var name in obj){ 
                    if (this.name == name){
                        var method = obj[name];
                        if (typeof(this.calculator[method] == 'function'))
                            this.run = $.proxy(this.calculator[method], this.calculator);
                        else
                            throw new Error('Invalid operator.');
                    }
                }
            }

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
        
        // Default action.  This will be overridden during init in some cases.
        run : function(){
            this.calculator.screen.display(this.name);
        }
    };

})(jQuery);
