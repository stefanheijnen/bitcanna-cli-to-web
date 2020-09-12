var walletAmout  
let searchParams = new URLSearchParams(window.location.search)
$("#urlConfig").attr("href", "config?token="+searchParams.get('token'))
$("#urlmain").attr("href", "/?token="+searchParams.get('token'))
$("#urllogo").attr("href", "/?token="+searchParams.get('token'))

$.get("/stats", function(data, status){
	var markup = "<tr><td>Blocks</td><td>" + data.blocks + "</td></tr>"+
				 "<tr><td>Difficulty</td><td>" + data.difficulty + "</td></tr>"+
				 "<tr><td>Connections</td><td>" + data.connections + "</td></tr>"+
				 "<tr><td>Staking</td><td>" + data.staking + "</td></tr>";				 
	$("#fullStats tbody").append(markup);
});

$.get("/wallet", function(data, status){
	walletAmout = data.balance
	var markup = "<tr><td>Balance</td><td>" + data.balance + "</td></tr>"+
				 "<tr><td>Tx count</td><td>" + data.txcount + "</td></tr>"+
				 "<tr><td>Pool oldest</td><td>" + data.keypoololdest + "</td></tr>"+
				 "<tr><td>Pool size</td><td>" + data.keypoolsize + "</td></tr>";	
	$("#wallet tbody").append(markup);
});

$.get("/listtransactions", function(data, status){
	const dataReversed = data.slice(-10).reverse();
	
	dataReversed.forEach(function(item){	
		var markup = "<tr><td>" + item.date + "</td><td>" + item.txid + "</td><td>" + item.amout + "</td></tr>"
		$("#tx tbody").append(markup);		 
	});
 
});

$.get("/stakingstatus", function(data, status){
	if (data.haveconnections === true)
		var haveconnections = '<img src="img/Feedbin-Icon-check.svg.png" width="32" height="32">'
	else
		var haveconnections = '<img src="img/1024px-Deletion_icon.svg.png" width="32" height="32">'
		
	if (data.walletunlocked === true)
		var walletunlocked = '<img src="img/Feedbin-Icon-check.svg.png" width="32" height="32">'
	else
		var walletunlocked = '<img src="img/1024px-Deletion_icon.svg.png" width="32" height="32">'		

	if (data.mintablecoins === true)
		var mintablecoins = '<img src="img/Feedbin-Icon-check.svg.png" width="32" height="32">'
	else
		var mintablecoins = '<img src="img/1024px-Deletion_icon.svg.png" width="32" height="32">'	
		
	if (walletAmout > '500')
		var checkAmount = '<img src="img/Feedbin-Icon-check.svg.png" width="32" height="32">'
	else
		var checkAmount = '<img src="img/1024px-Deletion_icon.svg.png" width="32" height="32">'	
		
	var markup = "<tr><td>Have connections</td><td>" + haveconnections + "</td></tr>"+
				 "<tr><td>Wallet unlocked</td><td>" + walletunlocked + "</td></tr>"+
				 "<tr><td>Min table coins</td><td>" + mintablecoins + "</td></tr>"+
				 "<tr><td>Enough coins (min: 500 bcna)</td><td>"+checkAmount+"</td></tr>";	
	$("#stak tbody").append(markup);
});

$.get("/adresse", function(data, status){
	console.log();
	if (data.error) {
		console.log('error!');
	} else {
		data.forEach(function(item){
			var len = item[0].length;
			$("#adresse tbody").append("<tr><td>" + item[0] + "</td><td>" + item[1] + "</td></tr>");
		});
	}
});

var tdate = new Date();
var dd = tdate.getDate();
var MM = tdate.getMonth();
var yyyy = tdate.getFullYear();

$.get("/listtransactions", function(data, status){
	console.log(data)
	
	var arrayData = []
	var dayData = []
	var valueTotal = 0
	var valueDay = 0
	data.forEach(function(item){	
		valueTotal++
		arrayData.push([item.unixTime*1000, valueTotal]);
		
		var num = Date.now() 
		var n = num.toFixed(0);
		console.log(n - 86400 )
		var sinceYesterday = n - 86400000 
		var txDateUnix = item.unixTime*1000
		if (txDateUnix > sinceYesterday) {
			console.log('tx: '+txDateUnix);
			valueDay++
			dayData.push([item.unixTime*1000, valueDay]);
		}	
	});
	
	console.log(arrayData)
	Highcharts.chart('container', {
		title: {
			text: 'Stak by days'
		},
		xAxis: {
			type: 'datetime'
		},
		series: [{
			data: arrayData
		}]
		
	});
	$('#container2').highcharts({
		title: {
			text: 'Stak by last hours'
		},
		xAxis: {
			type: 'datetime',
			dateTimeLabelFormats: {
				day: '%H:%M'
			}
		},
		
		series: [{
			data: dayData,
			pointStart: Date.UTC(1970),
			pointInterval: 3600 * 1000 // one hour
		}]
	});			
});
