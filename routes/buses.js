"use strict";

var express = require('express');
var router = express.Router();
var redis = require("redis"),
    client = redis.createClient();
// const EventEmitter = require('events');
// const busArrivalChannel = new EventEmitter();

class BusInfo {
    constructor(waveNo, busNo, plateNo, strength, busStatus, timeDeparted, timeArrived) {
        this.waveNo = waveNo;
        this.busNo = busNo;
        this.plateNo = plateNo;
        this.strength = strength;
        this.busStatus = busStatus;
        this.timeDeparted = timeDeparted;
        this.timeArrived = timeArrived;
    }
}

// For submission of new bus
router.put('/newbus/:waveNo/:busNo', function(req, res){
  const waveNo = req.params.waveNo;
  const busNo = req.params.busNo;
  
  const plateNo = req.body.plate;
  const strength = req.body.strength;
  const busStatus = req.body.busStatus;
  const timeDeparted = req.body.timeDeparted;
  const timeArrived = req.body.timeArrived;
  
  var isNew = client.hlen(`wave${waveNo}bus${busNo}`);
  // If there already exists a bus with the above key then return a reply of no go
  if (isNew != 0) {
      return res.end(400)
  }

    // Add the wave to the wave set on redis
    client.sadd("wavesActive", `$(waveNo`);
    client.expire("wavesActive");
    
    // Add the bus to the bus set for the wave on redis
    client.sadd(`wave$(waveNo)`, `$(busNo`);
    client.expire(`$(waveNo)`);
    
    client.hmset(`wave${waveNo}bus${busNo}`, 
        ['plateNo', plateNo, 'strength', strength, 'busStatus', busStatus,
        'timeDeparted', timeDeparted, 'timeArrived', timeArrived], function(err, result) {
            if (err) {
                console.error(err);
                res.sendStatus(500);
            } else {
                res.sendStatus(201);
            }
        });
        // Expires the key in 12 hours, so it can be reused the next day
        client.expire("buskeys", 43200);
        client.expire(`wave${waveNo}bus${busNo}`, 43200);
});

// To find out the number of waves
router.get('/checkwaves', function(req, res) {
    // smembers replys an array reply
    const wavesArray = client.smembers('wavesActive');
    res.JSON(wavesArray);
});

// To find out the number of buses in the wave
router.get('/checkbuses/:waveNo', function(req, res) {
    const busesArray = client.smembers(`wave$(waveNo)`);
    res.JSON(busesArray);
});

router.get('/:waveNo/:busNo', (req, res) => {
   const waveNo = req.params.waveNo;
   const busNo = req.params.busNo;
   
   const busDetails = client.hgetall(`wave$(waveNo)bus$(busNo)`);
   
   return res.json(busDetails); 
});



router.get('/update', function(req, res) {
    var sub = redis.createClient();
    
    sub.on('message', function(channel, msg) {
        console.log('RECEIVED ' + msg + ' FROM ' + channel);
        
        sub.unsubscribe();
        sub.quit();
        
        // res.end(msg + Date.now());
    });

    sub.subscribe('busesUpdates');
});



module.exports = router;























// // Used to set a new bus/ update its state etc.
// router.put('/:waveNo/:busNo/:putType', function(req, res) {
//   var waveNo = req.params.waveNo;
//   var busNo = req.params.busNo;
//   var putType = req.paras.putType;
   
//   var plateNo = req.body.plate;
//   var strength = req.body.strength;
//   var busStatus = req.body.busStatus;
//   var timeDeparted = req.body.timeDeparted;
//   var timeArrived = req.body.timeArrived;
   
//   console.log(req.body);

//     // If the app wishes to store a new bus, check if the key is avaliable(empty)
//     if (putType == 'newBus') {
//         var isNew = client.hlen(`wave${waveNo}bus${busNo}`);
//     }
    
//     // If the app simply wishes to edit an existing bus or if the key is avaliable
//     if (putType != 'newBus' || isNew == 0) {
//         var busNoDD = ("0" + busNo).slice(-2);
//         client.zadd("buskeys", `${waveNo}${busNoDD}`, `wave${waveNo}bus${busNo}`);
//         // Then set the values to the hashes of the key
//         client.hmset(`wave${waveNo}bus${busNo}`, 
//         ['plateNo', plateNo, 'strength', strength, 'busStatus', busStatus,
//         'timeDeparted', timeDeparted, 'timeArrived', timeArrived], function(err, result) {
//             if (err) {
//                 console.error(err);
//                 res.sendStatus(500);
//             } else {
//                 res.sendStatus(201);
//             }
//         });
//         // Expires the key in 12 hours, so it can be reused the next day
//         client.expire("buskeys", 43200);
//         client.expire(`wave${waveNo}bus${busNo}`, 43200);
//     }

//   // todo: error handling
//   // Sends a response to the long polling request
   
// });


// router.get('/:waveNo/:busNo', function(req, res) {
//   var waveNo = req.params.waveNo;
//   var busNo = req.params.busNo;
   
//   // todo: return 404 if no bus
   
//   client.hgetall(`wave${waveNo}bus${busNo}`, function(err, result) {
//         if (err) {
//             console.error(err);
//             res.sendStatus(500);
//         } else {
//             res.json(result);
//         }
//   });
// });

/*
router.post('/publish/:busNo', function(req, res) {
    console.log(req.params.busNo);
    client.publish('busUpdates', `BUS ${req.params.busNo} ARRIVED`);
    
    res.end('ACCEPTED ' + req.params.busNo);
});

router.get('/test', function(req, res) {
   res.end('hello, world'); 
});
*/










// router.get('/update2', (req, res) => {
//     return busArrivalChannel.once('busArrived', () => {
//         res.end('A BUS ARRIVED');
//     });
// });

// router.post('/busArrived', (req, res) => {
//   busArrivalChannel.emit('busArrived'); 
   
//   return res.end('THANKS');
// });