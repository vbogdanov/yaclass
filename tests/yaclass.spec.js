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