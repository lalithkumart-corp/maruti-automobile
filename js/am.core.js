if(typeof am == 'undefined'){
    var am = {};
}
$(document).on('ready',function(){
    am.core.bindInitialEvents();
});
am.core = {
	bindInitialEvents : function(){
		$('#addInvoice').on('click', function(e){
			am.common.currentPage = 'addInvoice';
			var property = {};
			var template = _.template(template_htmlstr_addInvoice, property);
			$('.mainContent').html(template);
			am.addinvoice.init();
		});
		$('#itemManager').on('click', function(e){
			am.common.currentPage = 'itemManager';
			var property = {};
			var template = _.template(template_htmlstr_item_manager, {});
			$('.mainContent').html(template);
			am.itemManager.init();
		});
		$('#viewAllInvoice').on('click', function(e){
			am.common.currentPage = 'invoiceList';
			var property = {};
			var template = _.template(template_invoice_list_page, property);
			$('.mainContent').html(template);
			am.invoiceList.init();
		});

		$('#stock-input').on('click', function(e){
			am.common.currentPage = 'stockinput';
			var property = {};
			var template = _.template(template_input_stock_main, property);
			$('.mainContent').html(template);			
			am.stock.input.init();				
		});

		$('#sale-item').on('click', function(e){
			am.core.refreshPageState();
			am.common.currentPage = 'salesbill';
			var property = {};
			var template = _.template(template_billing_main, property);
			$('.mainContent').html(template);
			am.billing.init();	
		});

		$('#view-invoice-list').on('click', function(e){
			am.common.currentPage = 'invoiceListNew';
			var property = {};
			var template = _.template(template_invoice_list_main_page, property);
			$('.mainContent').html(template);
			am.invoicelist.init();
		});

		$('#view-stock-table').off().on('click', function(e){
			am.common.currentPage = 'stock-table-display';
			var property = {};
			var template = _.template(template_stock_display_main_page, property);
			$('.mainContent').html(template);
			am.stock.view.init();
		});

		$('#mini-calc').off().on('click', function(e){
			am.common.currentPage = 'mini-calculator';
			var template = _.template(template_mini_calc_main_page, {});
			$('.mainContent').html(template);
			am.minicalc.init();
		});
	},

	refreshPageState: function(){
		am.stock.input.dismiss(); //just to clear the autosuggestion list (to prevent DOM ovrloading)
	},
	
	getCallbackObject : function() {
		callback = $({});

		/**
		 * Event is used to perform pre operations before accessing the API. (Ex Setting flag values for SEO.)
		 */
		callback.bind("api_request", function(){
			console.log('ÁPI REQUEST Clla binded');
		});

		callback.bind("invalid_credentials", function(event, response) {
			//console.log('ÁPI REQUEST Clla binded');
		});

		//Binding API Error Event.
		callback.bind("api_error", function(event, error) {
			//
		});

		callback.bind("server_error", function(event, theErrorThrown) {
			//
		});
		callback.bind("post_response", function(){
			//
		});

	    callback.bind("domain_error", function(){  //Binding the domain error when the user domain mismatched
	     //
	    });

		return callback;
	},
	call: function(request, callBackObj){
		$.ajax({
		       url: request.method.name,
		       type: request.type,
		       data: request.params,
		       success: function(data, textStatus, jqXHR){
		          am.core.apiSuccessCallback(data, textStatus, jqXHR, callBackObj, request);
		       },
		       error: function(jqXHR, textStatus, errorThrown){
		          am.core.apiErrorCallback(data, textStatus, jqXHR, callBackObj, request);
		       }
		   });
	},
	apiSuccessCallback: function(response, textStatus, jqXHR, callBackObj, request){
		callBackObj.trigger("api_response", response, request);
	},
	apiErrorCallback: function(jqXHR, textStatus, errorThrown, callBackObj, request){
		alert('API ERROR, Check console for more Details ');
		console.log('API Error is = ', textStatus);
	},
	getRequestData: function(methName , data , reqType ){
		var request = {
			method:{
				name : methName,
			},
			params: data,
			type : reqType
		};
		return request;
	}
}
var external = {
	insertData: function(colData){
		var obj = {};
		var coldata = colData;
			obj.aQuery= 'INSERT into dev.practice (name) VALUES ("'+coldata+'")';
			var callBackObj = am.core.getCallbackObject();
			var request = am.core.getRequestData('../php/executequery.php', obj , 'POST');
			callBackObj.bind('api_response', function(event, response){
				debugger;
			});
			am.core.call(request, callBackObj);
	}
}