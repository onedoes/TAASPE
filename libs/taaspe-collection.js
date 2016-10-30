'use strict';

var debug = require('debug')('TAASPE:Collection')
var rp = require("request-promise");
var fs = require("fs")
var Promise = require("bluebird")

var Collection = module.exports = function (list, t) {
  this.name = list.name;
  this.id = list.id;
  this.id_board = list.idBoard; 
  this.t = t;
};

Collection.prototype.find = function (query) {
  return this.t.getAsync(`/1/list/${this.id}/cards`)
  .then((documents, err) => {
    if (err) {
      throw new Error(err);
    }
    if (query) {
      debug('Query', query);
    
      for (var key in query) {
        documents = documents.filter((e) => {
          e.name = JSON.parse(e.name);
          e.name.id = e.id;
          if (e.name[key] === query[key] ) {
            return e.name;
          }
        });
      }
      return documents;
    }
    else {
      return documents.map((e) => { 
        var n = JSON.parse(e.name);
        n.id = e.id;
        return n;
      });
    }
  });
};


Collection.prototype.findOne = function (id) {
  return this.t.getAsync(`/1/cards/${id}`)
  .then((document, err) => {
    if (err) {
      throw new Error(err);
    }
    //debug("Document", document);
    document.name = JSON.parse(document.name);
    document.name.id = document.id;
    return document.name;
  });
};



Collection.prototype.update = function (id, query = {}, files = []){
  return upload_files(id, files, this.t)
  .then((files_urls) => {
    query = files_urls_to_query(query, files, files_urls);
    debug("query", query)
    return this.findOne(id);
  })
  .then((document) => {
    //debug('Document', id, query, files, document);
    Object.assign(document, query);
    document = JSON.stringify(document);
    return this.t.putAsync(`/1/cards/${id}/name`, {value : document});
  })
  .then((updated_document, err) => {
    if (err) {
      throw err;
    }
    //debug('Update document', updated_document);
    var d = JSON.parse(updated_document.name);
    console.log('Parsed docuement', d);
    d.id = updated_document.id;
    return d;
  });
};

function files_urls_to_query(query = {}, files, files_urls){
  files = files.map((f) => {
    let file_url = files_urls.find((f_u) => {
      f_u = JSON.parse(f_u);
      return f.originalname === f_u.name;
    });
    let new_f = {};
    new_f[f.fieldname] = (JSON.parse(file_url)).url;
    return f = new_f;
  });
  return files.reduce((query, value) => {
    Object.assign(query, value);
    return query;
  }, query);
}

function upload_files(card_id, files, t){
  if(files == []){ return}
  var url = `${t.host}/1/cards/${card_id}/attachments?key=${t.key}&token=${t.token}`;
  return Promise.map(files, (f) => {
    //debug('file', f);
    let formData = {
      file : fs.createReadStream(f.path),
      name : f.originalname,
      mimeType : f.mimetype
    }; 
    //debug('formData', formData);
    return rp.post(url , {formData: formData});
  });
}

Collection.prototype.delete = function (id){
  return this.t.delAsync(`/1/cards/${id}`)
  .then((document, err) => {
    if (err) {
      throw err;
    }
    debug('Deleted document', document, err);
    return ("Deletion successful");
  });
};


Collection.prototype.create = function (document, files){
  document = JSON.stringify(document);
  return this.t.postAsync('/1/cards/', {name: document, idList: this.id})
  .then((new_document, err) => {
    if (err) {
      throw err;
    }
    var d = JSON.parse(new_document.name);
    d.id = new_document.id;
    debug('Document', d);
    return this.update(d.id, {}, files);
  })
  .then((final_doc) => {
    return final_doc;
  });
};