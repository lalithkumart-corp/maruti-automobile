if(typeof am == 'undefined'){
    var am = {};
}
am.addinvoice = {
	init: function(){
		am.addinvoice.bindEvents();
	},
	bindEvents: function(){
		$('#date').datepicker().datepicker("setDate", new Date());
	}
}