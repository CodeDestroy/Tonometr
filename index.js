const express = require("express");
const app = express();
const fs = require("fs");
var bodyParser = require('body-parser');
const urlencodedParser = express.urlencoded({extended: false});
const mainRouter = require('./router/mainRouter')
var path = require('path')

//app.use('/assets', express.static(path.join(__dirname, "../assets")));
app.use(express.static(__dirname + '/client'));

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

/* app.get("/", function(request, response){
    response.sendFile(__dirname + "/client/index.html"); 

});

app.post("/getResults", urlencodedParser, function(request, response){
    if(!request.body) return response.sendStatus(400);
    response.send('Успешно')
    // отправляем пришедший ответ обратно
    console.log(request.body)
}); */
app.use('/', mainRouter);

app.listen(3000)

