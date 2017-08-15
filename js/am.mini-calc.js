var am = am || {};
am.minicalc = (function(){
    var sel = {
        priceCalcContainer: '.mini-calc-main-page .price-calculator-content',
        priceVal: '.mini-calc-main-page .price-calculator-content .price-val',
        cgstTaxVal: '.mini-calc-main-page .price-calculator-content .cgst-tax-val',
        sgstTaxVal: '.mini-calc-main-page .price-calculator-content .sgst-tax-val',
        mrpVal: '.mini-calc-main-page .price-calculator-content .mrp-val',
        calcPrice: '.mini-calc-main-page .price-calculator-content .calc-price-value',
        calcMrp: '.mini-calc-main-page .price-calculator-content .calc-mrp-value'
    };
    function init(){
        loadPriceCalculatorModule();
    }

    function loadPriceCalculatorModule(){
        renderPriceCalculator();
    }
    function renderPriceCalculator(){
        var elm = _.template(template_price_calculator, {});
        $(sel.priceCalcContainer).html(elm);
        bindPriceCalculatorEvents();
    }
    function bindPriceCalculatorEvents(){
        $(sel.calcPrice).off().on('click', function(e){
            var options = getOptions();
            var res = am.utils.calc.priceCalculator(options);
            $(sel.priceVal).val(res);
        });
        $(sel.calcMrp).off().on('click', function(e){
            var options = getOptions();
            var res = am.utils.calc.mrpCalculator(options);
            $(sel.mrpVal).val(res);
        });
    }
    function getOptions(){
        var options = {
            price: $(sel.priceVal).val() || 0,
            cgst: $(sel.cgstTaxVal).val() || 0,
            sgst: $(sel.sgstTaxVal).val() || 0,
            mrp: $(sel.mrpVal).val() || 0
        }
        return options;
    }
    return {
        init: init
    }
})();