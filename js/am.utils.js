if(typeof am == 'undefined'){
    var am = {};
}
am.utils = {
	setFocus: function(selector){
		$(selector).focus();
	},
	calc: {
		priceCalculator: function(options){
			var taxVal = 0;
			taxVal += parseFloat(options.cgst);
			taxVal += parseFloat(options.sgst);
			taxVal += 100;
			var numerator = parseFloat(options.mrp) * 100;
			var price = (numerator/taxVal);
			return price;
		},
		mrpCalculator: function(options){
			var taxVal = 0;
			var price = parseFloat(options.price);
			taxVal += parseFloat(options.cgst);
			taxVal += parseFloat(options.sgst);
			var numerator = price * taxVal;
			var mrp = price + (numerator/100);
			return mrp;
		}
	}
}