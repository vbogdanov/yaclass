/* global describe: false */
/* global it: false */
/* global expect: false */
/* global beforeEach: false */
/* global jasmine: false */
/* jshint maxstatements: 30 */
'use strict';

var yaclass = require('../lib/yaclass');

function executionTime (code, times) {
  times = times || 10000;
  var t = process.hrtime();
  for (var i = 0; i < times; i ++) {
    code();
  }
  return process.hrtime(t);
}

describe('yaclass-performance', function () {

  it('checks how fast defineProperty is', function () {
    var defineProp = function () {
      var value = {};
      Object.defineProperty(value, 'long-and-complicated-key', {
        configurable: false,
        enumerable: false,
        writable:false,
        value: Object.create(null)
      });
    };
    console.log('\ndefineProperty\t\t\t', executionTime(function () { defineProp(); }, 1000000));
  });

	it('performs faster than protected functions', function () {
    var Vector1 = function (x, y) {
      this.length = function () {
        return Math.sqrt(x * x + y * y);
      };
      this.angle = function () {
        return Math.atan2(y,x);
      };
      this.a = function () {};
      this.b = function () {};
      this.c = function () {};
      this.d = function () {};
      this.e = function () {};
      this.f = function () {};
    };

    var Vector2 = function (x, y) {
      this.x = x;
      this.y = y;
    };
    Vector2.prototype.length = function () {
      var x = this.x;
      var y = this.y;
      return Math.sqrt(x * x + y * y);
    };
    Vector2.prototype.angle = function () {
      return Math.atan2(this.y,this.x);
    };
    Vector2.prototype.a = function () {};
    Vector2.prototype.b = function () {};
    Vector2.prototype.c = function () {};
    Vector2.prototype.d = function () {};
    Vector2.prototype.e = function () {};
    Vector2.prototype.f = function () {};

    var Vector3 = yaclass.defclass({
      public: function (p) {
        return {
          constructor: function (x, y) {
            var self = p(this);
            self.x = x;
            self.y = y;
          },
          length: function () {
            var self = p(this);
            var x = self.x;
            var y = self.y;
            return Math.sqrt(x * x + y * y);
          },
          angle: function () {
            return Math.atan2(p(this).y,p(this).x);
          },
          a: function () {},
          b: function () {},
          c: function () {},
          d: function () {},
          e: function () {},
          f: function () {}
        };
      }
    });

    console.log('function with yaclass\t\t', executionTime(function () { return new Vector3(); },     1000000));
    console.log('\nfunction with prototype\t\t', executionTime(function () { return new Vector2(); }, 1000000));
    console.log('function with priviledged\t', executionTime(function () { return new Vector1(); },   1000000));
  });

  it('performance with real class', function () {
    var VectorProto = require('./Vector-proto');
    var VectorPriv = require('./Vector-priv');
    var VectorYaclass = require('./Vector-yaclass');

    console.log('VectorYaclass\t', executionTime(function ()  { return VectorYaclass.create({x:3, y: 2, z: -1}); }, 1000000));
    console.log('\nVectorProto\t', executionTime(function ()  { return VectorProto.create(  {x:3, y: 2, z: -1}); }, 1000000));
    console.log('VectorPriv\t', executionTime(function ()     { return VectorPriv.create(   {x:3, y: 2, z: -1}); }, 1000000));
  });

  it('performance with real class', function () {
    var VectorProto = require('./Vector-proto');
    var VectorPriv = require('./Vector-priv');
    var VectorYaclass = require('./Vector-yaclass');

    console.log('VectorYaclass\t', executionTime(function ()  { 
      var v = VectorYaclass.create({x:3, y: 2, z: -1});
      v.revert();
      v.multiply(5);
      v.abs();
      v.length();
      v.unitVector();
    }, 100000));
    console.log('\nVectorProto\t', executionTime(function ()  {
      var v = VectorProto.create(  {x:3, y: 2, z: -1}); 
      v.revert();
      v.multiply(5);
      v.abs();
      v.length();
      v.unitVector();
    }, 100000));
    console.log('VectorPriv\t', executionTime(function ()     {
      var v = VectorPriv.create(   {x:3, y: 2, z: -1}); 
      v.revert();
      v.multiply(5);
      v.abs();
      v.length();
      v.unitVector();
    }, 100000));
  });

});
