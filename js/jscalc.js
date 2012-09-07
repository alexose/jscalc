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
                keyboard: true,
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
                functions : [
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

            var defaults, calc, functions;
           
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
            
            if (this.options.keyboard){
                // Set up keypress events in a somewhat cross-browser way
                // see: http://unixpapa.com/js/key.html
                $(document).keypress($.proxy(function(e) {
                    var key = String.fromCharCode(e.charCode);
                    if (this.isButton(key))
                        this.buttons[key].element.click(); 
                }, this));

                // Special effect: Trigger keypresses
                $(document).keydown($.proxy(function(e) {
                    if (e.shiftKey) return;
                    var key = String.fromCharCode(e.keyCode);
                    if (this.isButton(key))
                        this.buttons[key].element.addClass('active'); 
                }, this));
                $(document).keyup($.proxy(function(e) {
                    if (e.shiftKey) return;
                    var key = String.fromCharCode(e.keyCode);
                    if (this.isButton(key))
                        this.buttons[key].element.removeClass('active'); 
                }, this));
            } 
        },

        isButton : function(value){
            for (var i in this.options.buttons){
                var row = this.options.buttons[i];
                for (var c in row){
                    var button = row[c];
                    if (button == value) return true;
                }
            }
            return false;
        },

        clear : function(){
            this.screen.setExpression('0');
            return;
        },
       
        // TODO: finish following functions
        percentage : function(){
            return;
        },

        inverse : function(){
            return;
        },

        signflip: function(){
            return;
        },

        solve : function(expression){
            expression = expression || this.screen.getExpression();
           
            try{
                if (!this.validate(expression))
                    throw new Error("Validation failed.");
            } catch (e){
                console.log(e.name + " " + e.message);
                return;
            }

            // Add implied * operators
            expression = expression.replace(/(\d)([\(])/g, "$1*$2")
           
            var result = this.calculate(expression);

            // Done!
            this.screen.setExpression(result);
            
        },

        // Calculates the solution
        calculate : function(e){
            var result = e;
            while (this.hasParenthesis(e)){

                var pos = this.innerMostPos(result)
                var string = e.slice(pos.start, pos.end);

                e = e.slice(0, pos.start)
                    + this.crunch(string) 
                    + e.slice(pos.end, e.length);

                result = e;
            }
            
            return this.crunch(result);
        },

        // Returns true if expression contains parenthesis
        hasParenthesis : function(e){
            if (e.indexOf('(') == -1 ) return false;
            else return true;
        },

        // Finds innermost, leftmost parenthesis and returns its position in the string
        innerMostPos : function(e){
            var max = 0;
            var level = 0;
            var arr = [];
            for (var i in e){
                if (e[i] == "(") level++;
                if (e[i] == ")") level--;
                arr.push(level);
                max = Math.max(level, max);
            }

            var result = {};
            var flag = false;
            for (i in arr){
                if (arr[i] == max && !flag){
                    result.start = parseInt(i);
                    flag = true;
                }
                if (arr[i] != max && flag){
                    result.end = parseInt(i) + 1;
                    break;
                }
            }
            return result;
        },
        
        // Calculates non-parenthetical statements
        crunch : function(expression){
            var operators = [
                ['*', function(m, f, s){ return parseFloat(f) * parseFloat(s)}],
                ['/', function(m, f, s){ return parseFloat(f) / parseFloat(s)}],
                ['+', function(m, f, s){ return parseFloat(f) + parseFloat(s)}],
                ['-', function(m, f, s){ return parseFloat(f) - parseFloat(s)}] 
            ];

            // Strip parenthesis, if they exist
            var result = expression.replace(/[()]/g,'');

            for (var i in operators){
                var symbol = operators[i][0];
                var method = operators[i][1];
                var regex = new RegExp('(\\d+)+\\' + symbol + '(\\d+)+', 'g');
                result = result.replace(regex, method);
            }
            return result;
        },
        
        validate : function(string){
            // Balance parentheses
            if (string.split('(').length !== string.split(')').length)
                return false;
            
            if (string == 0)
                return false;

            return true;
        },
        
        // Given a string, returns digits from beginning
        getNum : function(string, reverse){
            if (reverse) string = string.reverse();
            var num = '';
            for (var i in string){
                if (isNaN(parseInt(string[i])))
                    break;
                else 
                    num = num + '' + string[i];
            }
            if (reverse) num = num.reverse();
            return num;
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

            // Match this button against available functions
            // TODO: avoid these nested for loops
            for (var i in options.functions){
                var obj = options.functions[i];
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
