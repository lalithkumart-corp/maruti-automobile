var am = am || {};
am.stock = am.stock || {};
am.stock.core = (function(){
    var dataObj = {

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
        fetchStockListFromDB: fetchStockListFromDB
    }
})();