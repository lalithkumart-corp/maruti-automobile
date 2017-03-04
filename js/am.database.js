if(typeof am == 'undefined'){
    var am = {};
}
am.database = {
	schema : "automobile"
}
if(am.database.schema == 'dev'){
	setTimeout(function(){
		$('body').append('<h2 class="databaseError" style="text-align: center;color: red;">This is not your workspace. Please change the Database</h2>');
	}, 1000);
}