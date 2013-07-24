'use strict';

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(['node-uuid', 'constraints', 'extend'], function (uuid, TC, extend) {

  var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
  function trimArg(str) {
    return str.trim();
  }

  function getParamString(func) {
     var funStr = func.toString();
      funStr = funStr.replace(STRIP_COMMENTS, '');
      return funStr.slice(funStr.indexOf('(')+1, funStr.indexOf(')'));
  }

  function getParamNames(func) {
      getParamString().split(',').map(trimArg);
  }

  var tc = TC();

  tc.define('void', function (item) {
    return typeof item === 'undefined';
  });

  tc.define('class', function (item) {
    return tc.check('function', item) && 
    tc.check({
      'type': 'function',
      'name': 'string',
      'create': 'function'
    }, item);
  });

  tc.define('classdef', {
    name:'string',
    extends: tc.noneOr('object'),
    mixin: tc.noneOr(['', 'object.exists()']),
    private: 'object',
    public:'function.args(1)'
  });

  function getSuperType(classdef) {
    var supertype = classdef.extends;
    if (tc.check('function', supertype)) {
      return supertype;
    } else {
      var F = function () {};
      F.prototype = supertype || null;
      return F;
    }
  }

  function getMixinArray(classdef) {
    return classdef.mixin && tc.check('array', classdef.mixin) ?
        classdef.mixin:
        [];
  }

  function DefaultCreate () {
    return this();
  }

  function makePrototype(supertype, classdef, priv) {
    var mixin = getMixinArray(classdef);
    var selfMethods = classdef.public(priv);
    var base = Object.create(supertype.prototype);
    var t = mixin.slice(0);
    t.unshift(base);
    t.push(selfMethods);
    extend.call(null, t);
    return base;
  }

  function getInitialPrivateState(classdef) {
    var value = Object.create(null);
    return classdef.private? 
        extend(value, classdef.private):
        value;
  }

  function DefaultConstructorFn () {
    this.super();
  }

  return function YAClass() {

    var yaclass = function (classdef) {
      yaclass.defclass(classdef);
    };

    yaclass.classes = Object.create[null];
    yaclass.types =  tc.copy();

    yaclass.defclass = function (classdef) {
      tc.assert('classdef', classdef);

      var privKey = '1' + uuid.v4();
      var priv = function (self) {
        return self[privKey];
      };

      var supertype = getSuperType(classdef);
      var name = classdef.name || '';
      var state = getInitialPrivateState(classdef);
      var myPrototype = makePrototype(supertype, classdef, priv);
      var constructor = myPrototype.constructor || DefaultConstructorFn;
      

      var Class = function () {
        //make calls without new valid
        var self = this || {};
        //supertype constructor call preparation: start constructor with this.super();
        this.super = supertype;
        //self state:
        Object.defineProperty(self, privKey, {
          configurable: false,
          enumerable: false,
          writable:false,
          value:state
        });
        //self constructor:
        constructor.call(self, arguments);
        //make calls without new valid
        return self;
      };

      Class.prototype = Object.freeze(myPrototype);
      Class.name = classdef.name;
      Class.create = DefaultCreate;
      Class.type = tc.describe(myPrototype);

      yaclass.types.define(Class.name, Class.type);

      return Class;
    };

    yaclass.defn = function (returnType, argumentTypes, untypedFn) {
      var params = getParamString(untypedFn);
      var tc = yaclass.types.copy();
      
      tc.define('returnType', returnType);
      
      for (var i = 0; i < argumentTypes.length; i ++) {
        tc.define('argument' + i, argumentTypes[i]);
      }
      
      tc.define('arguments', function (args) {
        for (var i = 0; i < argumentTypes.length; i ++) {
          if (! tc.check('argument' + i, args[i])) {
            return false;
          }
        }
        return true;
      });

      var body = [
        'return function (', params, ') {\n',
        ' types.assert(\'arguments\', arguments);\n',
        ' var result = untypedFn.apply(this, [', params,']);\n',
        ' types.assert(\'returnType\', result);\n',
        ' return result;\n',
        '};\n'
      ].join('');
      return (new Function('types, untypedFn', body))(tc, untypedFn);
    };

    return yaclass;
  };
});