const express = require("express");
const app = express();
/* global.sequelize = require('./database') */
//const fs = require("fs");
/* global.Models = {}
global.Models.monitoring_ton = require('./models/MonitoringTon') */
const HOST = '127.0.0.1';
const PORT = 3000;
const { PrismaClient } = require('@prisma/client');
global.prisma = new PrismaClient();
//const { prisma } = require('prisma')
var bodyParser = require('body-parser');
const mainRouter = require('./router/mainRouter')

//const MonitoringTon = require('./models/MonitoringTon')


app.use(express.static(__dirname + '/client'));

app.use(bodyParser.urlencoded({ 
    extended: true
}));
app.use(bodyParser.json());


 
//clasterise express
/* app.use((req, res, next) => {
  if (cluster.isWorker)
    console.log(
      `Worker ${cluster.worker.id} handle request`
    );

  next();
}); */
app.listen(PORT, HOST, () => {
  //connect();  
});

//connect db
/* async function connect(){
  const puls = await prisma.monitoring_ton.findUnique({
    where: {
      id: 63503,
    },
  })
  console.log(puls)
} */

//routes
app.use('/', mainRouter);
    
//sync database

  

//some querry
/* MonitoringTon.findAll({ where: { upper_pressure: 126 }, limit: 1, raw: true })
  .then((result) => {
    result.forEach((el) => {
      console.log(el)
     })
}); */