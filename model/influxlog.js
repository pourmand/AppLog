
function sendToInflux(req, res) {
  //  console.log('Influxlog');
  //  console.log(JSON.stringify(req.body));
    try {
        var request = require('request');
        var db = req.query.db; //('db');   
        var log = req.query.log; //.replace("'","");
        var action = req.query.action;
        log = log.replace(",", ",ad_action=\""+action+"\",");
//        console.log(log);
        request({
            url: 'http://95.156.255.226:8880/write?db='+db,
            method: 'post',
            body: log,
            header: {'Content-Type': 'text/plain'},
            timeout: 600 * 1000
        }, function (error, result, body) {
    //        console.log("send to influx");
            if (error) {
                res.status(400).json({"msg":error});
            } else if (result.statusCode === 500) {
                res.status(500).json({"msg":error});
            } else {
//                console.log("Submit Successfully");
                    request({
                        url: 'http://5.253.27.241:8086/write?db=test',
                        method: 'post',
                        body: log,
                        header: {'Content-Type': 'text/plain'},
                        timeout: 600 * 1000
                    }, function (error, result, body) {
                        console.log("send to new influx");
                    });

                res.status(200).json(JSON.stringify(body));
                return;
            }
        });

        
    }
    catch(err) {
        console.log(err);
        res.status(404).json(err);
    }
}

function submitError(req, res) {
    console.log('Errorlog');
	//get ip
    var forwarded = require('forwarded-for');
    var address = forwarded(req, req.headers);

    try {
    var body = req.body.account+',ip="'+address.ip+'",body="'+req.body.body.replace(" ","_")+'" responce="'+req.body.responce.replace(" ","_")+'" '+(new Date().getTime());
    console.log(body);

        var request = require('request');
        console.log("1");
        request({
            url: 'http://95.156.255.226:8880/write?db=errorlog',
            method: 'post',
            body: body,
            header: {'Content-Type': 'text/plain'},
            timeout: 600 * 1000
        }, function (error, result, body) {
            console.log("send to influx");
            if (error) {
                res.status(400).json({"msg":error});
            } else if (result.statusCode === 500) {
                res.status(500).json({"msg":error});
            } else {
                console.log("Submit Successfully");

                res.status(200).json(JSON.stringify(body));
                return;
            }
        });
    }
    catch(err) {
        res.status(404).json(err);
    }
}

function decrypt(req, res) {

    var aesjs = require('aes-js');

    try {
        var key = [60, 10, 1, 40, 20, 40, 8, 40, 4, 40, 8, 40, 6, 4, 4, 4];
        var  encrypted = req.body.msg;
        var  decrypted = [];
//console.log(JSON.stringify(req.body));       
 for (var i = 0, len = encrypted.length; i < len; i++) {
            encryptedHex = encrypted[i];
//console.log(i+":"+encryptedHex);
            var encryptedBytes = aesjs.utils.hex.toBytes(encryptedHex);
            var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(7));
            var decryptedBytes = aesCtr.decrypt(encryptedBytes);
            var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
console.log(i+":"+decryptedText);
            decrypted.push(decryptedText);
        }
console.log(decrypted);        
        res.status(200).json({"msg" : decrypted});
    }
    catch(err) {
console.log(err); 
      res.status(400).json("");
    }
}
module.exports = { sendToInflux, submitError, decrypt }
