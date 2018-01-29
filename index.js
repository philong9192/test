var http = require('http');
var querystring = require('querystring');
var URL = require("url");
var admin = require('firebase-admin');
var serviceAccount = require("./key/msmobile-3d65e-firebase-adminsdk-nomzy-a30724da5c.json");
var async = require('async');
var schedule = require('node-schedule');
//var ip = "192.168.1.24";
var ip = "thegioididongso.com";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://msmobile-3d65e.firebaseio.com"
});

var db = admin.database();
var ref = db.ref("price");
ref.once("value", function(snapshot) {
  //console.log(snapshot.val());
});

var countDone = 0;
var countFaild = 0;
var count = 0;

getAllUrl();
var intMail = schedule.scheduleJob('45 * * * *', function(){
	getAllUrl();
});

//testUrl('http://www.techone.vn/iphone-6s-16gb-lock-5917.html', 1);

function readJsonUrl(data) {
	countDone = 0;
	countFaild = 0;
    var arrData = JSON.parse(data);
    count = getCountUrl(arrData);
    var arr = [];
    for (i in arrData) {
		var id = arrData[i][0];
		var name = arrData[i][1];
		var usersRef = ref.child(id + '/name');
		usersRef.set(name);
		for (j = 2; j < arrData[i].length; j++) {
			var url = arrData[i][j];
			if (url == "" || url === null)
				continue;
			//console.log(url);
			//getPrice(url, id);
			var obj = {id: id, url: url};
			arr.push(obj);
		}
    }

    var requestCount = 0;

	async.whilst(
	    function () { 
	        return requestCount < arr.length; 
	    },
	    function (firstCallback) {

	        const postData = querystring.stringify({
				id: arr[requestCount].id,
		        url: arr[requestCount].url
			});

			var agent = new http.Agent({
			  keepAlive: true,
			  keepAliveMsecs: 10000
			});

			var options = {
			    host: ip,
			    path: '/getprice/get_price.php',
			    method: 'POST',
			    headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Content-Length': Buffer.byteLength(postData)
				},
				agent: agent
			};

			const req = http.request(options, (res) => {
				requestCount++;
                firstCallback();
				var data = '';
				res.setEncoding('utf8');
				res.on('data', (chunk) => {
					data += chunk;
				});
				res.on('end', () => {
					//console.log(data);
					countDone++;
					console.log(countDone + "/" + count);
					if (countDone === count) {
						var date = new Date();
						var usersRef = ref.child("last_update");
				       	usersRef.set(date.getTime());
						console.log("Done!");
						console.log(countFaild + " Failed");
					}
					try {
						var json = JSON.parse(data);
						var hostname = URL.parse(json.url).hostname.replace("www.", "");
						var res = hostname.split('.');
						var host = res[0].toLowerCase();
						var usersRef = ref.child(json.id + '/' + host);
				       	usersRef.set(data);

				       	//sleep(1000);
				       	
					} catch (e) {
						//console.log(e);
					}
				});
			});

			req.on('error', (e) => {
				console.log(e.message);
				//console.log(url);
				countDone++;
				countFaild++;
				console.log(countDone + "/" + count);
				if (countDone === count) {
					var date = new Date();
					var usersRef = ref.child("last_update");
				    usersRef.set(date.getTime());
					console.log("Done!");
					console.log(countFaild + " Failed");
				}

				requestCount++;
                firstCallback();
			});

			// write data to request body
			req.write(postData);
			req.end();
	    },
	    function (err) {
	        //all requests done
	    }
	);
}

function getPrice(url, id) {
	const postData = querystring.stringify({
		id: id,
        url: url
	});

	var agent = new http.Agent({
	  keepAlive: true,
	  keepAliveMsecs: 10000
	});

	var options = {
	    host: ip,
	    path: '/getprice/get_price.php',
	    method: 'POST',
	    headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': Buffer.byteLength(postData)
		},
		agent: agent
	};

	const req = http.request(options, (res) => {
		var data = '';
		res.setEncoding('utf8');
		res.on('data', (chunk) => {
			data += chunk;
		});
		res.on('end', () => {
			console.log(data);
			countDone++;
			console.log(countDone + "/" + count);
			if (countDone === count) {
				var date = new Date();
				var usersRef = ref.child("last_update");
		       	usersRef.set(date.getTime());
				console.log("Done!");
				console.log(countFaild + " Failed");
			}
			try {
				var json = JSON.parse(data);
				var hostname = URL.parse(json.url).hostname.replace("www.", "");
				var res = hostname.split('.');
				var host = res[0].toLowerCase();
				var usersRef = ref.child(json.id + '/' + host);
		       	usersRef.set(data);

		       	//sleep(1000);
		       	
			} catch (e) {
				//console.log(e);
			}
		});
	});

	req.on('error', (e) => {
		console.log(e.message);
		//console.log(url);
		countDone++;
		countFaild++;
		console.log(countDone + "/" + count);
		if (countDone === count) {
			var date = new Date();
			var usersRef = ref.child("last_update");
		    usersRef.set(date.getTime());
			console.log("Done!");
			console.log(countFaild + " Failed");
		}
	});

	// write data to request body
	req.write(postData);
	req.end();
}

function getAllUrl() {
	var options = {
	    host: ip,
	    path: '/getprice/get_all_url.php'
	}
	var request = http.request(options, function (res) {
	    var data = '';
	    res.on('data', function (chunk) {
	        data += chunk;
	    });
	    res.on('end', function () {
	    	readJsonUrl(data);
	        //console.log(data);
	    });
	});
	request.on('error', function (e) {
	    console.log(e.message);
	});
	request.end();
}

function testUrl(url, id) {
	const postData = querystring.stringify({
		id: id,
        url: url
	});

	var agent = new http.Agent({
	  keepAlive: true,
	  keepAliveMsecs: 10000
	});

	var options = {
	    host: ip,
	    path: '/getprice/get_price.php',
	    method: 'POST',
	    headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': Buffer.byteLength(postData)
		},
		agent: agent
	};

	const req = http.request(options, (res) => {
		var data = '';
		res.setEncoding('utf8');
		res.on('data', (chunk) => {
			data += chunk;
		});
		res.on('end', () => {
			console.log(data);
			
		});
	});

	req.on('error', (e) => {
		console.log(e.message);
		//console.log(url);
		
	});

	// write data to request body
	req.write(postData);
	req.end();
}

function getCountUrl(arrData) {
	var count = 0;
	for (i in arrData) {
		for (j = 2; j < arrData[i].length; j++) {
		    var url = arrData[i][j];
		    if (url == "" || url === null)
		    	continue;
		    count++;
	  	}
	}
	return count;
}

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}
