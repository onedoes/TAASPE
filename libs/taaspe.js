'use strict';

var debug = require('debug')('TAASPE');
var Promise = require("bluebird");
var Trello = require("node-trello");
var Collection = require("./taaspe-collection.js");


var Taaspe = module.exports = function (key, token, board_name) {
  this.t = Promise.promisifyAll(new Trello(key,token));
  this.board_id;
  this.status = "disconnected";
  this.connect(board_name);
};

Taaspe.prototype.connect = function (board_name) {
  console.log('connecting to ', board_name);
  this.status = "connecting";
  //Get boards
  return this.t.getAsync('/1/members/me/boards')
  .then((boards, err) => {
    if (err) {
      throw err;
    }
    //Get corresponding board
    var board = boards.filter((e) => { if (e.name === board_name) { return e }});
    this.board_id = board[0].id;
    
    //If this board exists get lists inside
    if (board[0]) {
      this.t.getAsync(`/1/boards/${board[0].id}/lists`)
      .then((board_detail, err) => {
        if (err) {
          throw err;
        }
        var collections = [];
        board_detail.forEach((e) => {collections.push(new Collection(e, this.t)) });
        this.collections = collections;
        console.log('Connected to board and collections retrieved');
        this.status = "connected";
      }
    )}
    // Else create the board with empty lists
    else{
      throw "No Board exists with that name";
      //TODO Create Board and returns list of collections (empty)
    }
  });
};

Taaspe.prototype.collection = function (collection_name, retries = 3) {
  if (this.status === "connected") {
    if (!collection_name) {
      return this.collections;
    }
    else{
      var c = this.collections.find(e => e.name === collection_name);

      if (c) {
        console.log("found collection", c.name);
        return Promise.resolve(c);
      }
      else{
        return this.t.postAsync('/1/list', {name: collection_name, idBoard: this.board_id})
        .then((new_collection, err) => {
          debug('New collection', new_collection);
          var c = new Collection(new_collection, this.t);
          this.collections.push (c);
          return c;
        });
      }
    }
  }
  else {
    if (retries) {
  		setTimeout(() => {
  			this.collection(collection_name, retries-1);
  		}, 200);
    }
    else {
      this.status = "disconnected";
      throw "Cannot connect to Trello and load collections";
    }
  }
};

