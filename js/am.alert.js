var am = am || {};

am.alert = (function() {
	var defaults = {
		container: '.mainContent',
		errorIcon: "",
		errorMsg: "Error..",
		successIcon: "",
		successMsg: "Success!!"
	};
	    	
	function success( input ) {
		var options = getParams( input, "success" );
		var elm = createElem( options );
		appendElem( elm, options );
	}

	function error( input ) {
		var options = getParams( input, "danger" );
		var elm = createElem( options );
		appendElem( elm, options );
	}

	function getParams( input, type ) {
		var options = {};
		options.message = ( type === "success" ) ? defaults.successMsg : defaults.errorMsg;
		options.container = defaults.container;
		options.message = input.message || options.message;
		options.type = type;
		options.autoHide = input.autoHide === false ? false : true;
		return options;
	}

	function createElem( options ) {
		var elm = '<div class="alert-container">\
							<div class="alert alert-' + options.type + ' alert-dismissable" role="alert"\
								style="width:80%; position:fixed; top: 60px; left: 10%; right: 10%;">\
								<button type="button" class="close" data-dismiss="alert" aria-label="Close">\
									<span aria-hidden="true" class="kn-icon-close"></span>\
								</button>';
		
		elm += options.message +
						'</div>\
					</div>';

		return elm;
	}

	function appendElem( elm, options ) {
		$('.alert-container').remove();
		$( options.container ).css("position", "relative").prepend(elm);

		if ( options.autoHide === true ) {
			setTimeout(function() {
				//$('.alert-container').fadeOut(3000);
			}, options.delay);
		}
	}

	return {
		error: error,
		success: success
	} 
}());