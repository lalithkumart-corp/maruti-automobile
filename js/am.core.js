if(typeof am == 'undefined'){
    var am = {};
}
$(document).on('ready',function(){
    am.core.bindInitialEvents();
});
am.core = {
	bindInitialEvents : function(){
		$('#createNewBill').on('click', function(e){
			var property = {};
			var template = _.template(template_htmlstr_addInvoice, property);
			$('.mainContent').html(template);
			am.addinvoice.init();
		});
		//$('#itemManager').on('click', function(e){
			var property = {};
			am.itemManager.init();
		//});
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