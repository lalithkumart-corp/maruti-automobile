var am = am || {};
am.stock = am.stock || {};
am.stock.core = (function(){
    var dataObj = {

    };
    var map = {
        itemId: 'iid',
        isNewItem: 'n',
        itemBrand: 'ib',
        itemName: 'in',
        itemPartNo: 'ip',
        itemMrp: 'im',
        itemDiscount: 'id',
        itemPrice: 'ir',
        itemSellingPrice: 'is',
        itemCount: 'ic',
        itemCGSTTax: 'ict',
        itemSGSTTax: 'ist',
        itemValue: 'iv',

        itemDesc: 'de',
        itemQty: 'ic',
        itemCgstTax: 'ict',
        itemCgstTaxVal: 'ctv',
        itemSgstTax: 'ist',
        itemSgstTaxVal: 'stv',
        itemValueField: 'iv'
    };
    function fetchStockListFromDB(callBack){
        var query = {
            aQuery: 'SELECT * FROM '+am.database.schema+'.stock;'
        };
        var callBackObj = am.core.getCallbackObject();
		var request = am.core.getRequestData('../php/executequery.php', query, 'POST');
		callBackObj.bind('api_response', function(event, response){
            var data = JSON.parse(response);
            dataObj.raw_stock = data;            
            if(!_.isUndefined(callBack) && callBack !== '')
                callBack.trigger('api_response', response);
        });
        am.core.call(request, callBackObj);
    }
    return {
        fetchStockListFromDB: fetchStockListFromDB,
        map: map
    }
})();