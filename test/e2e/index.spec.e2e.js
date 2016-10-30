'use strict';

var Taaspe = require('../../libs/taaspe.js');
var expect = require('chai').expect;

describe("Create card", function () {
  before(function(){
    this.t = new Taaspe("apikey", "token", "Onedoes tests");
  });
  it("Should work", function (){
    return this.t.collection('test').create('Foo Bar')
      .then((document, err) => {
        if (err) {
          throw err;
        }
        expect(document).to.be.ok;
      });
  });
});

