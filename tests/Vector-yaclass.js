 /**
 * Vector represents mathematical/mechanical vector.
 */
var Dimensions = require("./Dimensions");
var yaclass = require("../lib/yaclass");

var Vector = yaclass.defclass({
  'name': 'Vector',
  'public': function (p) {

    return {
      constructor: function (fn) {
        var self = p(this);
        Dimensions.reduce(self, fn);
      },
      add: function(anotherVector) {
        var that = p(this);
        var other = p(anotherVector);
        return new Vector(function (value, key) {
          value[key] = that[key] + other[key];
        });
      },
      substract: function (anotherVector) {
        var that = p(this);
        var other = p(anotherVector);
        return new Vector(function (value, key) {
          value[key] = that[key] - other[key];
        });
      },
      revert: function () {
        var that = p(this);
        return new Vector(function (value, key) {
          value[key] = - that[key];
        });
      },
      multiply: function (scalar) {
        var that = p(this);
        return new Vector(function (value, key) {
          value[key] = scalar * that[key];
        });
      },
      abs: function () {
        var that = p(this);
        return new Vector(function (value, key) {
          value[key] = Math.abs(that[key]);
        });
      },
      revertDim: function (dimension) {
        var that = p(this);
        return new Vector(function (value, key) {
          value[key] = (key === dimension) ? -that[key]: that[key];
        });
      },
      equals: function(anotherVector) {
        if (!anotherVector)
          return false;
        var that = p(this);
        var other = p(anotherVector);
        var result = true;
        Dimensions.each(function (dim) {
          result = result && (that[dim] === other[dim]);
        });
        return result;
      },
      length: function(){
        var that = p(this);
        var result = 0;
        Dimensions.each(function(dim) {
          result += that[dim]*that[dim];
        });
        return Math.sqrt(result);
      },
      unitVector: function(){
        return this.multiply(1/this.length());
      },      
      toString: function () {
        var that = p(this);
        return "Vector(" + 
          Dimensions.map(function (dim) {
            return dim + ": " + that[dim];
          }).join(", ") + 
          ")";
      }
    };
  }
});

/**
 * Vectors are immutable, create is the only way to se their value
 * var v = Vector.create({x: 5, y: 10})
 */ 
Vector.create = function (xy) {
  xy = xy || {};
  return new Vector(function (value, key) {
    value[key] = xy[key] || 0;
  });
};

module.exports = Vector;