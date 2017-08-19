if(typeof am == 'undefined'){
    var am = {};
}
am.utils = {
	setFocus: function(selector){
		$(selector).focus();
	},
	calc: {
		priceCalculator: function(options){
			var result;
			var taxVal = 0;
			taxVal += parseFloat(options.cgst);
			taxVal += parseFloat(options.sgst);
			taxVal += 100;
			var numerator = parseFloat(options.mrp) * 100;
			var price = (numerator/taxVal);
			if(!_.isUndefined(options.requireDetail) && options.requireDetail){				
				result = {
					price: price,
					cgstTaxValue: am.utils.calc.calculateTaxValue(price, options.cgst),
					sgstTaxValue: am.utils.calc.calculateTaxValue(price, options.sgst)
				}
			}else{
				result = price;
			}
			return result;
		},
		mrpCalculator: function(options){
			var taxVal = 0;
			var price = parseFloat(options.price);
			taxVal += parseFloat(options.cgst);
			taxVal += parseFloat(options.sgst);
			var numerator = price * taxVal;
			var mrp = price + (numerator/100);
			return mrp;
		},
		calculateTaxValue: function(amount, tax){
			return taxValue = (amount * tax)/100;
		}
	}
}