if(typeof am == 'undefined'){
    var am = {};
}
am.autocompleter = {
	init: function(){

	},
	bindEvents: function(){
		
	},
	itemManager:{
		itemNosList : [],
		companyNameList: [],
		itemNameList: [],
		selectors: am.sel.getItemManagerSelectors(),
		dbColName: {
			itemNo : 'item_no',
			compName: 'item_brand',
			itemName: 'item_name'
		},
		init: function(){
			var $im = am.autocompleter.itemManager;
			$im.getData($im.dbColName.itemNo);
			$im.getData($im.dbColName.compName);
			$im.getData($im.dbColName.itemName);	
		},
		getData: function(listName, callback){
			var $im = am.autocompleter.itemManager;
			var obj = {
				aQuery: "SELECT distinct "+listName+" FROM "+am.database.schema+".item_lists"
			}
			var callBackObj = am.core.getCallbackObject();
			var request = am.core.getRequestData('../php/executequery.php', obj , 'POST');
			callBackObj.bind('api_response', function(event, response){
				response = JSON.parse(response);
				$im.setData(response, listName);				
			});
			am.core.call(request, callBackObj);
		},
		setData: function(data, listName){
			var $im = am.autocompleter.itemManager;
			switch(listName){
				case $im.dbColName.itemNo: 
					$im.itemNosList = [];
					_.each(data , function(value, key){
						$im.itemNosList.push(value[$im.dbColName.itemNo]);
					});
					break;
				case $im.dbColName.compName:
					$im.companyNameList = [];
					_.each(data , function(value, key){
						$im.companyNameList.push(value[$im.dbColName.compName]);
					});
					break;
				case $im.dbColName.itemName:
					$im.itemNameList = [];
					_.each(data , function(value, key){
						$im.itemNameList.push(value[$im.dbColName.itemName]);
					});
					break;
			}
			$im.fillData(listName);
		},
		fillData: function(listName){
			var $im = am.autocompleter.itemManager;
			var listData = [], elem = '';
			switch(listName){
				case $im.dbColName.itemNo:
					listData = $.map($im.itemNosList, function (listItem) { return { value: listItem, data: { category: 'Item No' }}; });
					elem = $im.selectors.newItemNo;
					break;
				case $im.dbColName.compName:
					listData = $.map($im.companyNameList, function (listItem) { return { value: listItem, data: { category: 'Company' }}; });
					elem = $im.selectors.newCompanyName;
					break;
				case $im.dbColName.itemName:
					listData = $.map($im.itemNameList, function (listItem) { return { value: listItem, data: { category: 'Description' }}; });
					elem = $im.selectors.newItemName;
					break;
			}
			$(elem).devbridgeAutocomplete({
	            lookup: listData,
	            minChars: 0,
	            onSelect: function (suggestion) {
	                $('#selection').html('You selected: ' + suggestion.value + ', ' + suggestion.data.category);
	            },
	            showNoSuggestionNotice: true,
	            noSuggestionNotice: 'Sorry, no matching results',
	            groupBy: 'category'
	        });
		}
	}
}