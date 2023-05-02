const express = require("express");
const app = express();
require('dotenv').config()
const cors = require('cors');
var https = require('https');
var fs = require('fs');
const HOST = process.env.SERVER_URL;
const PORT = process.env.PORT;
const { PrismaClient } = require('@prisma/client');
const cookieParser = require('cookie-parser');
global.prisma = new PrismaClient();
const { Server } = require("socket.io");


var bodyParser = require('body-parser');
const mainRouter = require('./router/mainRouter')
const authRouter = require('./router/authRouter')
const adminRouter = require('./router/adminRouter')


var options = {
  key: fs.readFileSync('keys/key.pem'),
  cert: fs.readFileSync('keys/cert.pem')
};


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


//list of io connections
ioConnections = [];


const start = async () => {
  try {
    const server = https.createServer(options, app);
    const io = new Server(server, {cors: {origin: process.env.CLIENT_URL}});
    server.listen(PORT, () => {
      console.log(`Server started on port ${PORT} URL ${HOST}`) 
    });
    let map = new Map();
    io.on('connection', async (socket) => {
      
      ioConnections.push(socket);
      console.log(`Connections count:`, ioConnections.length) 
      
      var interval;
      socket.on('room:join', async (roomId) => {

        const doctor = await prisma.doctor.findUnique({
          where:{
            id: parseInt(roomId)
          }
        })
        const med_post = await prisma.med_post.findUnique({
          where: {
            id: doctor.med_post_id
          }
        })

        const med_org = await prisma.medical_org.findUnique({
          where: {
            id: med_post.medical_org_id
          }
        })
//- INTERVAL '3 HOURS'
        const measures = await prisma.$queryRawUnsafe(`select mt.*, a.*, p.*
        from monitoring_ton mt 
        join appointment a on mt.appointment_id = a.id 
        join patient p on a.patient_id = p.id 
        left join doctor d on d.id = a.doctor_id
        left join med_post mp on mp.id = d.med_post_id
        left join medical_org mo on mo.id = mp.medical_org_id
        where mt.dt_dimension BETWEEN NOW() + INTERVAL '3 HOURS' - INTERVAL '15 minutes' AND NOW() + INTERVAL '3 HOURS' AND mo.id = ${med_org.id} AND mt.upper_pressure >= 180
        order by mt.dt_dimension desc
        `) 
        const date =await prisma.$queryRawUnsafe(`select NOW() + INTERVAL '3 HOURS' - INTERVAL '15 minutes'`) 
        io.to(socket.id).emit('hello', measures);

        map.set(socket, roomId)
        console.log('joined', roomId)
        socket.emit('room:joined', roomId)

        interval = setInterval(async () => {
          // отправляем данные клиенту
          const measures = await prisma.$queryRawUnsafe(`select mt.*, a.*, p.*
            from monitoring_ton mt 
            join appointment a on mt.appointment_id = a.id 
            join patient p on a.patient_id = p.id 
            left join doctor d on d.id = a.doctor_id
            left join med_post mp on mp.id = d.med_post_id
            left join medical_org mo on mo.id = mp.medical_org_id
            where mt.dt_dimension BETWEEN NOW() + INTERVAL '3 HOURS' - INTERVAL '15 minutes' AND NOW() + INTERVAL '3 HOURS' AND mo.id = ${med_org.id} AND mt.upper_pressure >= 180
            order by mt.dt_dimension desc
              `) 
            
//          socket.emit('rooms', socket.rooms, map)
          io.to(socket.id).emit('hello', measures);
        }, 30000)
        
        /* socket.on("disconnecting", () => {
        
      }); */
        
    })

    socket.on('leave', (roomId) => {
      console.log('leaved', roomId)
      socket.leave(roomId);
      map.delete(socket)
      clearInterval(interval)
      ioConnections.splice(ioConnections.indexOf(socket), 1);
    })
      
    });

    socket.on('disconnect', function(data) { 
      console.log('roomID by socket', map.get(socket))
        socket.leave(map.get(socket));
        map.delete(socket)
        clearInterval(interval)
        ioConnections.splice(ioConnections.indexOf(socket), 1);
      
    });

    /* app.listen(PORT, HOST, () => {
      console.log(`Server started on port ${PORT} URL ${HOST}`) 
      connect();
    }); */
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


  