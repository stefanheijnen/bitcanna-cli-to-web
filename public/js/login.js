$("#startCahllenge").click( function(){
	/*$.post('/challenge',{
        name: 'test',
        pass: 'test'
    }, function(data) {
        alert(data);
	});*/
	$.post("/challenge",{user: $("#user").val(), password: $("#pass").val()}, function(data){
		if(data.login) {
			//alert(data.login +' & '+ data.token);
			$(location).attr("href", "/?token="+data.token);
		} else
			$("#badLogin").show();
	});	
});
