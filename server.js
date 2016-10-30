//
// # TAASPE test server
//
// A simple express server using taaspe as a bdd
//

var Taaspe = require("./libs/taaspe.js");
// To complete with your own //
var t = new Taaspe("TrelloAPIKEY", "Application Token", "Board Name");

var http = require('http');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/tmp/taaspe');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
var upload = multer({ storage: storage });
var app = express();
var server = http.createServer(app);


app.use(express.static(path.resolve(__dirname, 'client')));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


var apiRoutes = express.Router()
app.use('/api', apiRoutes);

apiRoutes.get('/:collection_name', function (req, res){
  t.collection(req.params.collection_name)
  .then((collection) => collection.find())
  .then((documents, err) => res.send(documents));
});

apiRoutes.post('/:collection_name', upload.any(), function (req, res){
  t.collection(req.params.collection_name)
  .then((collection) => collection.create(req.body, req.files))
  .then((doc, err) => res.send(doc));
});

apiRoutes.get('/:collection_name/:doc_id', function (req, res){
  t.collection(req.params.collection_name)
  .then((collection) => collection.findOne(req.params.doc_id))
  .then((document) => res.send(document));
});


apiRoutes.put('/:collection_name/:doc_id', upload.any(), function (req, res){
  console.log("req files", req.files);
  console.log("req.body", req.body);
  t.collection(req.params.collection_name)
  .then((collection) => collection.update(req.params.doc_id, req.body, req.files))
  .then((updated_document) => res.send(updated_document));
});

apiRoutes.delete('/:collection_name/:doc_id', function (req, res){
  t.collection(req.params.collection_name)
  .then((collection) => collection.delete(req.params.doc_id))
  .then((deleted) => res.send(deleted));
});


server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("TAASPE server listening at", addr.address + ":" + addr.port);
});
