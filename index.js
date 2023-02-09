const express = require("express");
const app = express();
const fs = require("fs");
var bodyParser = require('body-parser');
const urlencodedParser = express.urlencoded({extended: false});
const mainRouter = require('./router/mainRouter')
var path = require('path')
const db = require('./database')
const MonitoringTon = require('./models/MonitoringTon')
const { QueryTypes } = require('sequelize')
//app.use('/assets', express.static(path.join(__dirname, "../assets")));
app.use(express.static(__dirname + '/client'));

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use('/', mainRouter);

try {
    db.authenticate();
    console.log('Connection has been established successfully.');
    
    
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }

  
  app.listen(3000)

  db.sync({force: false}).then(result=>{}) 
  .catch(err=> console.log(err));
  MonitoringTon.findAll({ where: { upper_pressure: 126 }, limit: 1, raw: true })
  .then((result) => {
    result.forEach((el) => {
      console.log(el)
    })
  });
  