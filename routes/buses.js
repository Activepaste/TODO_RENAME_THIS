"use strict";

var express = require('express');
var router = express.Router();
var redis = require("redis"),
    client = redis.createClient();

router.put('/:waveNo/:busNo', function(req, res) {
   var waveNo = req.params.waveNo;
   var busNo = req.params.busNo;
   
   var strength = req.body.strength;
   var plate = req.body.plate;
   var time = req.body.time;
   
   console.log(req.body);
   
   // todo: error handling
   
   // save to redis
   client.hmset(`wave${waveNo}bus${busNo}`, ['strength', strength, 'plate', plate, 'time', time], function(err, result) {
       if (err) {
           console.error(err);
           res.sendStatus(500);
       } else {
           res.sendStatus(201);
       }
   });
});

router.get('/:waveNo/:busNo', function(req, res) {
   var waveNo = req.params.waveNo;
   var busNo = req.params.busNo;
   
   // todo: return 404 if no bus
   
   client.hgetall(`wave${waveNo}bus${busNo}`, function(err, result) {
        if (err) {
            console.error(err);
            res.sendStatus(500);
        } else {
            res.json(result);
        }
   });
});

module.exports = router;
