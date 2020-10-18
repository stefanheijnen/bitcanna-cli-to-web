// TODO afficher les erreur 401 du client non connecter sur tous les endpoint (comme /adresse)
// ./bitcannad -server -rest
const express = require('express')
var cookieParser = require('cookie-parser');
const bodyParser = require("body-parser")
var session = require('express-session')
const app = express()
var path = require('path');
var uniqid = require('uniqid');
var bitCanna = require('node-bitcoin-rpc')
const fs = require('fs');
const moment = require('moment');

var tokenCsrf = ''

// TO DO add https://github.com/sehrope/node-simple-encryptor
let rawdata = fs.readFileSync('config.json');
let authentification = JSON.parse(rawdata);

// Init bitcanna 
bitCanna.init(authentification.rpcHost, authentification.rpcPort, authentification.rpcUser, authentification.rpcPass)

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); 
app.use(session({
	secret: authentification.secretSession,
	resave: false,
	saveUninitialized: true
}));

function antiCsrf(res, getToken, session, page) {
	if (getToken != session) {
		res.send('Detect Csrf')					
	} else 
		res.sendFile(path.join(__dirname+'/'+page));
}
function checkIp(req) {
	// Network interfaces
	if(authentification.ip === 'false') 
		return true

	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	ip = ip.toString().replace('::ffff:', '');
	console.log(ip)
 
	if (ip != authentification.ip) {
		return false
	} else
		return true
}
// Routing
app.get('/', function (req, res) {

	var getToken = req.query.token 
	if (req.session.name) { 
		if (checkIp(req)) {
			antiCsrf(res,getToken,req.session.name,'index.html')
		} else
			res.send('Hmmm bad ip :/')	
	} else
		return res.redirect('/login'); 
})

app.get('/login', function (req, res) {
	if (req.session.name) return res.redirect('/?token='+req.session.name);
	res.sendFile(path.join(__dirname+'/login.html')); 
})
app.get('/logout', function (req, res) {
	req.session.destroy();
	return res.redirect('/login'); 
})
app.post('/challenge', function (req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	if (authentification.user === req.body.user && authentification.pass === req.body.password){
		console.log('Login True')
		tokenCsrf = uniqid()
		req.session.name = tokenCsrf;
		req.session.save();
		res.send({login:true, token:tokenCsrf})
	} else {
		console.log('Login False')		
		res.send({login:false})
	}
})

// API
app.get('/stats', function (req, res) {
	res.setHeader('Content-Type', 'application/json');
	if (req.session.name) { 
		try {
			bitCanna.call('getinfo', [], function (err, resB) {
				if (err !== null) {
					console.log('I have an error :( ' + err )
				} else {
					res.send(resB.result)	
				}
			})	
		}
		catch (err) {
			console.log(err);
		}	
	} else
		return res.send({error:'unauthorized'})	
})
app.get('/listtransactions', function (req, res) {
	res.setHeader('Content-Type', 'application/json');
	if (req.session.name) { 
		try {
			bitCanna.call('listtransactions', ['*', 500], function (err, resB) {
				if (err !== null) {
					console.log(err )
				} else {
					var tempArray = []
					resB.result.forEach(function(item){
						const dateTimereceived = moment.unix(item.timereceived - 10 ).format("DD-MM-YYYY HH:mm:ss");
						function check(array, key, value) {
							if (!array.some(object => object[key] === value))
								tempArray.push({txid:item.txid, date:dateTimereceived, unixTime:item.timereceived, amout:'2.6'});
						}					
						check(tempArray, 'txid', item.txid);					 
					}); 
					//console.log(tempArray) 
					res.send(tempArray)
				}
			})	
		}
		catch (err) {
			console.log(err);
		}			
	} else
		return res.send({error:'unauthorized'})	
})
app.get('/listreceivedbyaccount', function (req, res) {
	res.setHeader('Content-Type', 'application/json');
	if (req.session.name) { 
		try {
			bitCanna.call('listreceivedbyaccount', [], function (err, resB) {
				if (err !== null) {
					console.log('I have an error :( ' + err )
				} else {
					res.send(resB.result)	
				}
			})	
		}
		catch (err) {
			console.log(err);
		}		
	} else
		return res.send({error:'unauthorized'})	
})
app.get('/wallet', function (req, res) {
	res.setHeader('Content-Type', 'application/json');
	if (req.session.name) { 
		try {
			bitCanna.call('getwalletinfo', [], function (err, resB) {
				if (err !== null) {
					console.log('I have an error :( ' + err )
				} else {
					res.send(resB.result)
				}
			})	
		}
		catch (err) {
			console.log(err);
		}		
	} else
		return res.send({error:'unauthorized'})
})
app.get('/stakingstatus', function (req, res) {
	res.setHeader('Content-Type', 'application/json');
	if (req.session.name) { 
		try {
			bitCanna.call('getstakingstatus', [], function (err, resB) {
				if (err !== null) {
					console.log('I have an error :( ' + err )
				} else {
					res.send(resB.result)
				}
			})	
		}
		catch (err) {
			console.log(err);
		}			
	} else
		return res.send({error:'unauthorized'})
})

app.get('/adresse', function (req, res) {
	res.setHeader('Content-Type', 'application/json');
	if (req.session.name) { 
		try {
			bitCanna.call('listaddressgroupings', ['atmo'], function (err, resB) {
				if (err !== null) {
					res.send({error:err})
				} else {
					res.send(resB.result[0])
				}
			})	
		}
		catch (err) { 
			console.log(err);
		}		
	} else
		return res.send({error:'unauthorized'})	
})

app.get('/getstakesplitthreshold', function (req, res) {
	res.setHeader('Content-Type', 'application/json');
	if (req.session.name) { 
		try {
			bitCanna.call('getstakesplitthreshold', [], function (err, resB) {
				if (err !== null) {
					res.send({error:err})
				} else {
					res.send(resB.result)
					
				}
			})	
		}
		catch (err) { 
			console.log(err);
		}		
	} else
		return res.send({error:'unauthorized'})	
})
app.post('/setstakesplitthreshold', function (req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	console.log(req.body.thresholdValue)
	if (req.session.name) { 
		try {
			bitCanna.call('setstakesplitthreshold', [parseInt( req.body.thresholdValue )], function (err, resB) {
				if (err !== null) {
					res.send({error:err})
				} else {
					res.send(resB)
					console.log(resB)
					
				}
			})	
		}
		catch (err) { 
			console.log(err);
		}		
	} else
		return res.send({error:'unauthorized'})	
})

app.listen(authentification.portBitcannaWeb, function () {
	console.log('***********************************************')
	console.log('* Welcome on Bitcanna-web')	
	console.log('* Bitcanna-web app listening on port ' + authentification.portBitcannaWeb)
	console.log('**********************************************')
})


