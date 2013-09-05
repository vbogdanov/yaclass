if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(['node-uuid', 'constraints', 'extend'], function (uuid, TypeCheck, extend) {
  'use strict';

  var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

  function getParamString(func) {
     var funStr = func.toString();
      funStr = funStr.replace(STRIP_COMMENTS, '');
      return funStr.slice(funStr.indexOf('(')+1, funStr.indexOf(')'));
  }

  var tc = new TypeCheck();

  tc.define('void', function (item) {
    return typeof item === 'undefined';
  });

  tc.define('class', function (item) {
    return tc.check('function', item) &&
    tc.check({
      'isCompatable': 'function',
      'name': 'string',
      'create': 'function'
    }, item);
  });

  tc.define('classdef', {
    name: tc.noneOr('string'),
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
    extend.apply(null, t);
    return base;
  }

  function applyDefaultPrivateState(state, classdef) {
    if (classdef.private)
      extend(state, classdef.private);
  }

  function DefaultConstructorFn () {
    this.super();
  }

  var yaclass = function (classdef) {
    yaclass.defclass(classdef);
  };

  yaclass.types = tc;

  yaclass.defclass = function (classdef) {
    tc.assert('classdef', classdef);

    var privKey = '1' + uuid.v4();
    var priv = function (self) {
      return self[privKey];
    };

    var supertype = getSuperType(classdef);
    var myPrototype = makePrototype(supertype, classdef, priv);
    var constructor = myPrototype.constructor || DefaultConstructorFn;
    
    var Class = function () {
      //make calls without new valid
      if (tc.none(this))
        return Class.apply({}, arguments);
      //supertype constructor call preparation: start constructor with this.super();
      this.super = supertype;
      //self state:
      Object.defineProperty(this, privKey, {
        configurable: false,
        enumerable: false,
        writable:false,
        value: Object.create(null)
      });

      applyDefaultPrivateState(this[privKey], classdef);
      //self constructor:
      constructor.apply(this, arguments);
    };
    //attach public methods/fields
    Class.prototype = Object.freeze(myPrototype);
    //set name
    Class.name = classdef.name;
    //make Class.create valid call
    Class.create = DefaultCreate;
    //define a checking function function(item):boolean
    Class.isCompatable = tc.describe(myPrototype);
    var className = classdef.name || uuid.v4();
    
    Class.toString = function () {
      return className;
    };

    return Class;
  };

  yaclass.defn = function (returnType, argumentTypes, untypedFn) {
    var params = getParamString(untypedFn);
    var types = tc.copy();
    
    types.define('returnType', returnType);
    
    for (var i = 0; i < argumentTypes.length; i ++) {
      types.define('argument' + i, argumentTypes[i]);
    }
    
    types.define('arguments', function (args) {
      for (var i = 0; i < argumentTypes.length; i ++) {
        if (! types.check('argument' + i, args[i])) {
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
    return (new Function('types, untypedFn', body))(types, untypedFn);
  };

  return yaclass;
});