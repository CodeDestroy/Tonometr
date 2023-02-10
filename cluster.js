const os = require('os');
const cluster = require('cluster');

//clusterise
//if master
if (cluster.isMaster) {
    let cpus = os.cpus().length;

    //restart worker if exit
    for (let i = 0; i < cpus - 1; i++) {
        const worker = cluster.fork();
        worker.on('exit', () => {
            console.log(
                `Worker PID: ${worker.process.pid} id: ${worker.id} finished.`
            );
            cluster.fork();
        });
    } 
}  
//if worker
else {
    console.log(`Worker PID: ${cluster.worker.process.pid} id: ${cluster.worker.id} launched`)
    require('./index');
}