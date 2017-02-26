if(typeof am == 'undefined'){
    var am = {};
}
$(document).on('ready',function(){
    am.core.bindInitialEvents();
});
am.core = {
	bindInitialEvents : function(){
		//$('#createNewBill').on('click', function(e){
			//aSelf.updatePageName('billCreationPage');
			var property = {};
			var template = _.template(template_htmlstr_addInvoice, property);
			$('.mainContent').html(template);
			am.addinvoice.init();
		//});
	}
}