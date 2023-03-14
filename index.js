const express = require("express");
const app = express();
require('dotenv').config()
const cors = require('cors');
const HOST = process.env.SERVER_URL;
const PORT = process.env.PORT;
const { PrismaClient } = require('@prisma/client');
const cookieParser = require('cookie-parser');
global.prisma = new PrismaClient();
 

var bodyParser = require('body-parser');
const mainRouter = require('./router/mainRouter')
const authRouter = require('./router/authRouter')
const adminRouter = require('./router/adminRouter')

//uses
app.use(express.static(__dirname));
app.use(cookieParser());
app.use(cors({
  credentials: true,
  origin: process.env.CLIENT_URL
}));


app.use(bodyParser.urlencoded({ 
    extended: true
}));
app.use(bodyParser.json());

//routes
app.use('/', mainRouter);
app.use('/auth', authRouter)
app.use('/admin', adminRouter)
//start
const start = async () => {
  try {
    app.listen(PORT, HOST, () => {
      console.log(`Server started on port ${PORT} URL ${HOST}`) 
      /* connect(); */
    });
  }
  catch (e) {
    console.log(e)
  }
}
start();

//connect db
async function connect(){
  const puls = await prisma.monitoring_ton.findUnique({
    where: {
      id: 63503,
    },
  })
  console.log(puls)
}


  