
if (cluster.isMaster) {
  masterProcess();
} else {
  childProcess();
}

function masterProcess() {
  console.log(`Master ${process.pid} is running`);
  for (let i = 0; i < numCPUs; i++) {
    console.log(`Forking process number ${i}...`);
    cluster.fork();
  }
  cluster.on('fork', function (worker) {
    console.log('worker:' + worker.id + " is forked");
  });
  cluster.on('online', function (worker) {
    console.log('worker:' + worker.id + " is online");
  });
  cluster.on('listening', function (worker) {
    console.log('worker:' + worker.id + " is listening");
  });
  cluster.on('disconnect', function (worker) {
    console.log('worker:' + worker.id + " is disconnected");
  });
  cluster.on('exit', function (worker) {
    console.log('worker:' + worker.id + " is dead");
  });
}

/****** Local Env ************/
var options = {};

/****** Test and Live Env ************/
// var options = {
//     key: fs.readFileSync('/root/cb_konect_node/uploads/SSL/celeb.key'),
//     cert: fs.readFileSync('/root/cb_konect_node/uploads/SSL/8ef3cea8eabae0b1.crt'),
//     ca: fs.readFileSync('/root/cb_konect_node/uploads/SSL/gd_bundle-g2-g1.crt')
// };

/****** Dev Env ************/
// var options = {
//     key: fs.readFileSync('/root/cb_konect_node/uploads/SSL/celeb.key'),
//     cert: fs.readFileSync('/root/cb_konect_node/uploads/SSL/8ef3cea8eabae0b1.crt'),
//     ca: fs.readFileSync('/root/cb_konect_node/uploads/SSL/gd_bundle-g2-g1.crt')
// };

function childProcess() {
  console.log(`Worker/Child process with pid ${process.pid} starting...`);
  let httpsServer = http.createServer(options, app).listen(port, (err, data) => {
    if (!err) {
      console.log('listening on https://localhost:4300');
    }
  });
}

// var credentials = {};
// function childProcess() {
//   console.log(`Worker/Child process with pid ${process.pid} starting...`);
//   let httpsServer = http.createServer(credentials, app).listen(port, (err, data) => {
//     if (!err) {
//       console.log('listening on https://localhost:4300');
//     }
//   })
//   // res.writeHead(200);
//   // res.end(`hello world from worker/child process with id:${cluster.worker.id} & pid:${process.pid}`);
//   // res.end();
//   // });

//   // httpServer.listen(3001);

//   // httpServer.on('listening', () => {
//   //     console.log('server is listening on port 3000');
//   // })


// test ANd Live https server configuration
// var options = {
//     key: fs.readFileSync('/root/cb_konect_node/uploads/SSL/celeb.key'),
//     cert: fs.readFileSync('/root/cb_konect_node/uploads/SSL/8ef3cea8eabae0b1.crt'),
//     ca: fs.readFileSync('/root/cb_konect_node/uploads/SSL/gd_bundle-g2-g1.crt')
// };
// function childProcess() {
//     console.log(`Worker ${process.pid} started...`);
//     var https = require('https').createServer(options, app).listen(4700, function (err, data) {
//         if (!err) {
//             console.log('listening on https://localhost:4700');
//         }
//     });
// }


//dev https server
// var options = {
//     key: fs.readFileSync('/root/cb_konect_node/uploads/SSL/celeb.key'),
//     cert: fs.readFileSync('/root/cb_konect_node/uploads/SSL/8ef3cea8eabae0b1.crt'),
//     ca: fs.readFileSync('/root/cb_konect_node/uploads/SSL/gd_bundle-g2-g1.crt')
// };
// function childProcess() {
//     console.log(`Worker ${process.pid} started...`);
//     var https = require('https').createServer(options, app).listen(4900, function (err, data) {
//         if (!err) {
//             console.log('listening on https://localhost:4900');
//         }
//     });
// }




//   // console.log(`Worker ${process.pid} started...`);
//   // http.createServer((req, res) => {
//   //     const message = `worker ${process.pid}`
//   //     console.log(message);
//   //     // res.end(message);
//   // }).listen(port)
//   // var httpServer = http.createServer(app);
//   // var httpsServer = https.createServer(credentials, app);
//   // For http
//   // httpServer.listen(8080);
//   // For https
//   // httpsServer.listen(port);

//   // http.createServer(app).listen(80)
//   // https.createServer({}, app).listen(port, () => {
//   //     console.log('listening on http://%s:%s : :',  port);
//   // })

//   // https.createServer({}, app).listen(port, function () {
//   //     console.log('listening on http://%s:%s', port);
//   // });

//   // var server = app.listen(4300, function () {
//   //     var host = server.address().address
//   //     // var port = server.address().port
//   //     console.log('listening on http://%s:%s', host, port);
//   // });
// }


let localEnv = () => {

  // if (cluster.isMaster) {
  //   masterProcess();
  // } else {
  //   childProcess();
  // }
  // masterProcess();


}


let setEnv = {
  localEnv: localEnv
}

module.exports = setEnv;































































//research and development
// var https = require('https').createServer(options, app).listen(4900, function (err, data) {
//     if (!err) {
//         console.log('listening on https://localhost:4900');
//     }
// });



// if (cluster.isMaster) {
//     const cpuCount = os.cpus().length
//     for (let i = 0; i < cpuCount; i++) {
//         cluster.fork()
//     }
// } else {
//     // const app = express()
//     // app.get('/', (req, res) => {
//     //     const primes = []
//     //     const max = Number(req.query.max) || 1000
//     //     for (let i = 1; i <= max; i++) {
//     //         if (isPrime(i)) primes.push(i)
//     //     }
//     //     res.json(primes)
//     // })

//     const port = process.env.PORT || 4300

//     app.listen(port)
//     // var host = app.address().address
//     console.log('app is running on port', port)
//     console.log('listening on http://%s:%s', port);
// }

// cluster.on('exit', (worker) => {
//     console.log('mayday! mayday! worker', worker.id, ' is no more!')
//     cluster.fork()
// })
