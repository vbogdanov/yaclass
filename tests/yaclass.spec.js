/* global describe: false */
/* global it: false */
/* global expect: false */
/* global beforeEach: false */
/* global jasmine: false */
/* jshint maxstatements: 30 */
'use strict';

var createYaclass = require('../index');

describe('yaclass', function () {
  
  var yaclass;
  
  beforeEach(function () {
    yaclass = createYaclass();
  });

  describe('#defclass', function () {
    it('defines a class with methods passed in the object returned from \'public\'', function () {
      var Greeter = yaclass.defclass({
        name: 'Greeter',
        public: function (pass) {
          return {
            hello: function () {
              return 'success';
            }
          };
        }
      });

      var obj = new Greeter();
      console.log(obj);
      expect(obj.hello()).toBe('success');
    });

    it('inherits from simple constructor functions with methods in the prototype', function () {
      var Simple = function () {
        this.value = true;
      };
      Simple.prototype.test = function () {
        return this.value;
      };

      var MyClass = yaclass.defclass({
        name: 'MyClass',
        extends: Simple,
        public: function (pass) {
          return {
            hello: function () {
              return 'success';
            }
          };
        }
      });

      var obj = new MyClass();
      expect(obj.value).toBe(true);
      expect(obj.test()).toBe(true);
      expect(obj.hello()).toBe('success');
    });

    it('adds methods from mixins to the object', function () {
      var utilObj = {
        split: function() {
          var str = this.hello();
          return str.split('r');
        }
      };

      var WithMixin = yaclass.defclass({
        mixin: [utilObj],
        public: function (priv) {
          return {
            hello: function () {
              return 'world';
            }
          };
        }
      });

      var obj = new WithMixin();
      expect(obj.split()).toEqual(['wo','ld']);
    });

    it('makes private state accessible through the priv argument of public', function () {
      var WithPrivate = yaclass.defclass({
        public: function (priv) {
          return {
            getA: function () {
              return priv(this).a;
            },
            setA: function (a) {
              priv(this).a = a;
            },
            setAOn: function (withPrivate) {
              priv(withPrivate).a = priv(this).a;
            }
          };
        }
      });

      var x = new WithPrivate();
      var y = new WithPrivate();
      x.setA(5);
      y.setA(9);
      expect(x.getA()).toBe(5);
      expect(y.getA()).toBe(9);
      
      x.setA(7);
      expect(x.getA()).toBe(7);
      expect(y.getA()).toBe(9);

      x.setAOn(y);
      expect(x.getA()).toBe(7);
      expect(y.getA()).toBe(7);
    });

    it('sets intial private state using the private option', function () {
      var WithPrivate = yaclass.defclass({
        private: {
          a:3
        },
        public: function (priv) {
          return {
            getA: function () {
              return priv(this).a;
            }
          };
        }
      });

      var obj = new WithPrivate();
      expect(obj.getA()).toBe(3);
      expect(obj.a).toBeFalsy();
    });

    it('inherits from classes defined with defclass', function () {
      var Human = yaclass.defclass({
        private:{
          name: 'Ivan'
        },
        public: function (p) {
          return {
            greet:function () {
              return 'Hello, ' + p(this).name;
            }
          };
        }
      });

      var Student = yaclass.defclass({
        extends: Human,
        private:{
          fn: '123456'
        },
        public: function (p) {
          return {
            congrat:function (mark) {
              expect(typeof p(this).name).toBe('undefined');
              return this.greet() + ' with fn:[' + p(this).fn + '], your mark is ' + mark;
            }
          };
        }
      });

      var student = new Student();
      var str = 'Hello, Ivan with fn:[123456], your mark is 6';
      expect(student.congrat(6)).toBe(str);
    });
  });

  describe('#defn', function () {
    it('defines typesafe functions', function () {
      var spy = jasmine.createSpy();
      var fn = yaclass.defn('', [], spy);

      expect(function () {
        var r = fn();
        expect(typeof r).toBe('undefined');
      }).not.toThrow();
      expect(spy.calls.length).toBe(1);
    });


    it('defines typesafe functions for 2 arguments and return type', function () {
      var fn = yaclass.defn('string', ['string', 'number'], function (str, num) {
        return str + num;
      });

      expect(function () {
        var r = fn('hello', 5);
        expect(r).toEqual('hello5');
      }).not.toThrow();
    });

    it('throws exception on invalid return type', function () {
      var fn = yaclass.defn('number', ['string', 'number'], function (str, num) {
        return str + num;
      });

      expect(function () {
        var r = fn('hello', 5);
      }).toThrow();
    });

    it('throws exception on invalid arguments', function () {
      var fn = yaclass.defn('string', ['string', 'number'], function (str, num) {
        return str + num;
      });

      expect(function () {
        var r = fn('hello', '5');
      }).toThrow();
    });
  });
  
});