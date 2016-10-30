# TAASPE [![Build Status][travis-image]][travis-url]

> Trello As A Service Pre-Experiment


Need infinite storage space for free ? Let's exploit Trello !  
Each board is an app, each list is a collection, each card is a document.


## Install

```sh
npm install taaspe
```

## Pre requirement 

Authorize our trello application and create board
taaspe TRELLO-API-KEY APP-NAME

## Method list

```js
var trelloback = taaspe.connect(‘board-id’)
trelloback.collections()                                                      //lists every collection
trelloback.collections(‘todos’)                               //create a collection ?
trelloback.collections(‘todos’).find()                    //retreive every document in collection
trelloback.collections(‘todos’).find(id: “docID”)            //retreive a specific document
trelloback.collections(‘todos’).create(object)               //create a document in collection
trelloback.collections(‘todos’).update(id: “docID”, object) //update a document in collection
trelloback.collections(‘todos’).delete(id: “docID”)           //delete a document in collection
```

## API doc

##  taaspe

###  taaspe#connect(broadId)

broadId : the board Id on trello

Return: TrelloBack Instance

### Example

#### TODO list REST API

```js

app.get(‘/todos, function (req, res, err) {
var todos = trelloback.collections(‘todos’).find();
res.send(todos);
}))

app.post(‘/todos, function (req, res, err) {
    var todo_object = req.body;
    var todo = trelloback.collections(‘todos’).create(todo-object);
    res.send(todo);
}))

app.get(‘/todos/:id, function (req, res, err) {
    var requested_id = req.params.id;
    var todo = trelloback.collections(‘todos’).find({id: requested_id});
    res.send(todo);
}))

app.put(‘/todos/:id, function (req, res, err) {
    var requested_id = req.params.id;
    var todo_object = req.body;
    var todo = trelloback.collections(‘todos’).update({id:requested_id, todo_object});
    res.send(todo);
}))

app.delete(‘/todos/:id, function (req, res, err) {
    var requested_id = req.params.id;
    trelloback.collections(‘todos’).delete({id:requested_id});
    res.send(200);
}))
```


## License

    Copyright © One Does <onedoes.inc@gmail.com> 
    This work is free. You can redistribute it and/or modify it under the
    terms of the Do What The Fuck You Want To Public License, Version 2,
    as published by Sam Hocevar. See the LICENCE file for more details.
    
[travis-url]: http://travis-ci.org/onedoes/TAASPE
[travis-image]: http://travis-ci.org/onedoes/TAASPE.svg?branch=master

