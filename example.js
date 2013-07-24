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


//used:
var PersonUtil = {
  myfunction: function () {
    this.go();
  }
};

var PupilUtil = {
  doPupil: function () {
    this.myfunction();
    this.getCources();
  }
};

function Person() {
  this.name = 'Ivan';
  this.age = '22';
}

Person.prototype.test = function () {
  //do something
};
