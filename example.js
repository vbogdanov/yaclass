/* global Person: false */
/* global PersonUtil: false */
/* global PupilUtil: false */
/* *global Person: false */

'use strict';

var yaclass = require('yaclass');

var Pupil = yaclass({
  name: 'Pupil',
  extends: Person,
  mixin: [PersonUtil, PupilUtil],
  private: {
    courses:[]
  },
  public: function (priv) {

    return {
      constructor: function () {

      },
      go: function () {
        console.log('go');
      },
      getCources: function () {
        return priv(this).courses;
      },
      checked: yaclass.defn('string', ['string', 'number'], function (str, num) {
        return str + num;
      })
    };
  }
});

/*
function (types, returnType, argumentTypes, unsafeFn) {
  return function (%{ARGS}) {
    typecheck.args(....)
    var result = unsafeFn(%{ARGS})
    typecheck.assert(returnType, result);
  };
}


*/