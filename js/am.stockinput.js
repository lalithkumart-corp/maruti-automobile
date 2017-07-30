/**
 * @desc: Stock input and invoice input maintainence 
 */

var am = am || {};
am.stock = am.stock || {};
am.stock.input = (function(){
    var dataObj = {
        ac:{
            brands:[],
            itemNames:[],
            partNos:[]
        },
        itemIdColl: []
    };

    var map = {
        itemId: 'iid',
        isNewItem: 'n',
        itemBrand: 'ib',
        itemName: 'in',
        itemPartNo: 'ip',
        itemPrice: 'ir',
        itemCount: 'ic',
        itemGSTTax: 'it'
    };

    var cls = {
        needACBrand: 'need-ac-brand',
        needACItem: 'need-ac-item',
        needACPartno: 'need-ac-partno',
        addRow: 'add-row',
        needFocus: 'need-focus'
    };

    var sel = {
        needACBrand: '.' + cls.needACBrand,
        needACItem: '.' + cls.needACItem,
        needACPartno: '.' + cls.needACPartno,
        tableBody: '.input-invoice-main .table-container tbody',
        itemNameField: '.item-name-field',
        brandNameField: '.brand-name-field',
        partNoField: '.part-no-field',
        priceField: '.price-field',
        taxField: '.tax-field',
        countField: '.count-field',
        valueField: '.value-field',
        itemIdCell: '.item-id-cell',
        itemId: '.item-id',
        addRow: '.' + cls.addRow,
        needFocus: '.' + cls.needFocus,
        submitBtn: '.submit-invoice-stock-btn'
    };

    function init(){
        initialSetup();
        fetchAutoCompleterLists();
        bindEvents();
    }
    function initialSetup(){
        moveTabFocus();
    }
    function bindEvents(){
        bindItemBlurEvent();
        bindAddRowEvent();
        bindSubmitEvent();
    }

    function bindItemBlurEvent(){
        $(sel.brandNameField).off('blur').on('blur', function(e){
            blurListener(this);
        });
        $(sel.itemNameField).off('blur').on('blur', function(e){
            blurListener(this);
        });
        $(sel.partNoField).off('blur').on('blur', function(e){
            blurListener(this);
        });
        $(sel.priceField).off('blur').on('blur', function(e){
            calculateValue(this);
        });
        $(sel.countField).off('blur').on('blur', function(e){
            calculateValue(this);
        });
    }

    function blurListener(thisRefer){        
        var itsParent = $(thisRefer).closest('tr');
        var itemVal = $(itsParent).find(sel.itemNameField).val().trim();
        var brandVal = $(itsParent).find(sel.brandNameField).val().trim();
        var partNoVal = $(itsParent).find(sel.partNoField).val().trim();
        var itemIdObj = getItemId(brandVal, itemVal, partNoVal);    
        $(itsParent).find(sel.itemId).html(itemIdObj.id);        
        if(itemIdObj.isNew){
            $(itsParent).find(sel.itemIdCell).addClass('new');
        }else{
            $(itsParent).find(sel.itemIdCell).removeClass('new');
            autoFillDetails(itsParent, itemIdObj.optionalDetail);
        }
    }

    function calculateValue(thisRefer){
        var itsParent = $(thisRefer).closest('tr');
        var unitPrice = $(itsParent).find(sel.priceField).val();
        unitPrice = parseInt(unitPrice);
        var count = $(itsParent).find(sel.countField).val();
        count = parseInt(count);
        $(itsParent).find(sel.valueField).val(unitPrice * count);
    }

    function bindAddRowEvent(){
        $(sel.addRow).off('keypress').on('keypress', function(e){
            var key = 'which' in e ? e.which : e.keyCode;
            if(key == 13){
                addRow(this, e);
                moveTabFocus();
                bindAddRowEvent();
                bindItemBlurEvent();
                bindAutoCompleterList();
            }
        });
    }

    function bindSubmitEvent(){
        $(sel.submitBtn).off().on('click', function(e){
            var stockDetails = getStockDetails();
            updateStock(stockDetails);
            //var invoiceDetails = getInvoiceDetails();
        });
    }

    function autoFillDetails(row, data){
        $(row).find(sel.priceField).val(data.unit_price);
        $(row).find(sel.taxField).val(data.gst);
    }

    function fetchAutoCompleterLists(){
       var self = am.invoiceList;
       var aCallBackObj = am.core.getCallbackObject();
       aCallBackObj.bind('api_response', function(event, response){            
            parseAutoCompleterResponse();
            bindAutoCompleterList();
        });
        fetchStockListFromDB(aCallBackObj);
    }

    function parseAutoCompleterResponse(){
        dataObj.ac.brands = [];
        dataObj.ac.itemNames = [];
        dataObj.ac.partNos = [];
        dataObj.ac.itemIdColl = [];
        _.each(dataObj.raw_stock, function(anItem, index){
            if(dataObj.ac.brands.indexOf(anItem.item_brand) == -1)
                dataObj.ac.brands.push(anItem.item_brand);
            if(dataObj.ac.brands.indexOf(anItem.item_name) == -1)
                dataObj.ac.itemNames.push(anItem.item_name);
            if(dataObj.ac.brands.indexOf(anItem.item_part_no) == -1)
                dataObj.ac.partNos.push(anItem.item_part_no);
            if(dataObj.itemIdColl.indexOf(anItem.item_id) == -1)
                dataObj.itemIdColl.push(anItem.item_id);
        });        
    }
    function bindAutoCompleterList(){
        bindAutoCompleteFor('brand');
        bindAutoCompleteFor('item');
        bindAutoCompleteFor('partno');
        afterAutoCompleteBinded();
    }
    function bindAutoCompleteFor(elmName){        
        var collections, selector;
        switch(elmName){
            case 'brand':
                collections = $.map(dataObj.ac.brands, function (listItem) { return { value: listItem, data: { category: 'Brands' }}; });
                selector = sel.needACBrand;
                break;
            case 'item':
                collections = $.map(dataObj.ac.itemNames, function (listItem) { return { value: listItem, data: { category: 'Items' }}; });
                selector = sel.needACItem;
                break;
            case 'partno':
                collections = $.map(dataObj.ac.partNos, function (listItem) { return { value: listItem, data: { category: 'PartNo' }}; });
                selector = sel.needACPartno;
                break;
        }
    
        $(selector).devbridgeAutocomplete({
            lookup: collections,
            minChars: 0,
            onSelect: function (suggestion) {
                $('#selection').html('You selected: ' + suggestion.value + ', ' + suggestion.data.category);
            },
            showNoSuggestionNotice: true,
            noSuggestionNotice: 'No results!',
            groupBy: 'category'
        });
    }

    function afterAutoCompleteBinded(){
        $(sel.needACBrand).removeClass(cls.needACBrand);
        $(sel.needACItem).removeClass(cls.needACItem);
        $(sel.needACPartno).removeClass(cls.needACPartno);
    }

    function getItemId(brandVal, itemVal, partNoVal){
        var itemIdObj = {
            id: '',
            isNew: false
        };
        
        var lowBrandVal = brandVal.toLowerCase();
        var lowItemVal = itemVal.toLowerCase(); 
        var lowPartNoVal = partNoVal.toLowerCase();       
        _.each(dataObj.raw_stock, function(anObj, index){
            var thatItemBrand = helper.isValidProp(anObj.item_brand)? anObj.item_brand.toLowerCase() : '';
            var thatItemName = helper.isValidProp(anObj.item_name)?anObj.item_name.toLowerCase() : '';
            var thatItemPartNo = helper.isValidProp(anObj.item_part_no)?anObj.item_part_no.toLowerCase() : '';
            
            if(thatItemBrand == lowBrandVal && thatItemName == lowItemVal && thatItemPartNo == lowPartNoVal){
                itemIdObj.id = anObj.item_id;        
                itemIdObj.optionalDetail = anObj;
            }
        });
        
        if(_.isEmpty(itemIdObj.id)){
            var itemIdObj = getNewItemId();
            itemIdObj.id = itemIdObj.id;
            itemIdObj.isNew = itemIdObj.isNew;
        }
        return itemIdObj;
    }

    function getNewItemId(){
        var newItemId = '1';
        var localColl = JSON.parse(JSON.stringify(dataObj.itemIdColl)); //maintain localcollection -> since the items in the current form might have new item id. So, generating another new item itd, should also consider ID's which aer already created.
        _.each($(sel.itemIdCell), function(aCell, index){
            localColl.push($(aCell).text());
        });
        var verfiedUniqueId = verifyExistence(newItemId);
        var isNew;
        
        function isAlreadyExist(newItemId){
            if(localColl.indexOf(newItemId) != -1)
                return true;
            // for(i=0; i < localColl.length; i++){
            //     var anItemId = localColl[i];
            //     if(anItemId == newItemId)
            //         return true;                
            // }
            return false;
        }
        function verifyExistence(newItemId){
            var uniqueItemId;
            if(isAlreadyExist(newItemId) == true){                
                newItemId = parseInt(newItemId) + 1 + '';//last concatination is just to convert to string.
                uniqueItemId = verifyExistence(newItemId);
            }else{
                uniqueItemId = newItemId;
                isNew = true;
            }
            return uniqueItemId;
        }
        return {
            id: verfiedUniqueId,
            isNew: isNew || false
        };
    }
    function getRowData(currRow){
        var currSNo;
        if(!_.isUndefined(currRow)){
            currSNo = $(currRow).find('.s-no').val().trim();
            currSNo = parseInt(currSNo);
        }else
            currSNo = 0;
        var newRowHtmlstr = '<tr>';
                newRowHtmlstr += '<td><input type="text" class="aw ah only-b-border s-no" value="'+ (currSNo+1) +'" /></td>';
                newRowHtmlstr += '<td class="item-id-cell"><span class="item-id"></span></td>';
                newRowHtmlstr += '<td><input type="text" class="need-ac-brand aw ah only-b-border brand-name-field need-focus"/></td>';
                newRowHtmlstr += '<td><input type="text" class="need-ac-item aw ah only-b-border item-name-field"/></td>';
                newRowHtmlstr += '<td><input type="text" class="need-ac-partno aw ah only-b-border part-no-field"/></td>';
                newRowHtmlstr += '<td><input type="number" class="aw ah only-b-border price-field"/></td>';
                newRowHtmlstr += '<td><input type="number" class="aw ah only-b-border count-field"/></td>';
                newRowHtmlstr += '<td><input type="number" class="aw ah only-b-border add-row tax-field"/></td>';
                newRowHtmlstr += '<td><input type="number" class="aw ah only-b-border value-field"/></td>';              
            newRowHtmlstr += '</tr>';
        return newRowHtmlstr;
    }

    function addRow(that, e){        
        var currRow = $(that).closest('tr');
        var htmlstr = getRowData(currRow);
        $(sel.addRow).removeClass(cls.addRow);
        $(sel.tableBody).append(htmlstr);                    
    }
    function moveTabFocus(){
        $(sel.needFocus).focus();
        $(sel.needFocus).removeClass(cls.needFocus);
    }


    function getStockDetails(){
        var arr = [];
        _.each($(sel.tableBody+' tr'), function(aRow, index){
            var anObj = {
                [map.itemId] : $(aRow).find('td:eq(1)').text(),
                [map.isNewItem] : $(aRow).find('td:eq(1)').hasClass('new'),
                [map.itemBrand] : $(aRow).find('td:eq(2) input').val(),
                [map.itemName] : $(aRow).find('td:eq(3) input').val(),
                [map.itemPartNo] : $(aRow).find('td:eq(4) input').val(),
                [map.itemPrice] : $(aRow).find('td:eq(5) input').val(),
                [map.itemCount] : $(aRow).find('td:eq(6) input').val(),
                [map.itemGSTTax] : $(aRow).find('td:eq(7) input').val(),
            };
            arr.push(anObj);
        });
        
        //do validation for, if same item exists at multiple rows, then combine that item count
        var validateArr = [];
        var idArray = [];        
        _.each(arr, function(anItemDetail, index){
            var theItemId = anItemDetail[map.itemId];
            if(idArray.indexOf(theItemId) == -1){
                validateArr.push(anItemDetail);
                idArray.push(theItemId);
            }else{
                _.each(validateArr, function(anObj, key){
                    if(anObj[map.itemId] == theItemId){
                        var count1 = parseInt(anObj[map.itemCount]);
                        var count2 = parseInt(anItemDetail[map.itemCount]);
                        anObj[map.itemCount] = count1 + count2;
                    }                                                 
                });
            }
        });
        return validateArr;
    }


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

    function updateStock(stockDetails){
        var callBackOb = am.core.getCallbackObject();
        var optional = {
            stockDetails: stockDetails
        }
		callBackOb.bind('api_response', function(event, response){                  
            var obj = {};
            var query = '';
            _.each(stockDetails, function(anItemDetail, index){
                if(anItemDetail[map.isNewItem])
                    query += helper.getInsertItemQuery(anItemDetail);
                else
                    query += helper.getUpdateItemQuery(anItemDetail, optional);
            });
            obj.multiQuery = 'true';
            obj.aQuery = 'SET SQL_SAFE_UPDATES = 0;';
            obj.aQuery += query;
            obj.aQuery += 'SET SQL_SAFE_UPDATES = 1;';
            var callBackObj = am.core.getCallbackObject();
			var request = am.core.getRequestData('../php/executequery.php', obj , 'POST');
			callBackObj.bind('api_response', function(event, response){                
                setTimeout(function(){ //refresh will fetch the stcoklist from DB. But the DB has just now got updated, and so fetching with delay . (To prevent fetching the old list from DB)Making delay, to let the DB to be updated
                    refresh();
                }, 500);                
            });
            am.core.call(request, callBackObj);
        });
        fetchStockListFromDB(callBackOb);
    }

    function refresh(){
        clearTableEntries();
        bindAddRowEvent();
        bindItemBlurEvent();
        fetchAutoCompleterLists();
    }

    function clearTableEntries(){
        $('.autocomplete-suggestions').remove(); //remove autocomplete list
        var rowHtmlstr = getRowData();
        $(sel.tableBody).html(rowHtmlstr);
    }

    var helper = {
        getInsertItemQuery: function(itemDetail){
            var query = 'INSERT into '+ am.database.schema+ '.stock (item_id, item_brand, item_name, item_part_no, count, unit_price, gst) VALUES ("';
            query += itemDetail[map.itemId] +  '", "';
            query += itemDetail[map.itemBrand] + '", "';
            query += itemDetail[map.itemName] + '", "';
            query += itemDetail[map.itemPartNo] + '", "';
            query += itemDetail[map.itemCount] + '", "';
            query += itemDetail[map.itemPrice] + '", "';
            query += itemDetail[map.itemGSTTax];
            query += '");';
            return query;
        },
        getUpdateItemQuery: function(itemDetail, optional){
            var query = 'UPDATE '+ am.database.schema + '.stock SET ';
            query += 'count=' + helper.getUpdatedCount(itemDetail) + ' ';
            query += ' WHERE item_id = '+ itemDetail[map.itemId];
            query += '; ';
            return query;
        },
        getUpdatedCount: function(itemDetail, optional){
            var currentCount = itemDetail[map.itemCount];
            currentCount = parseInt(currentCount);
            var itemDetailInStock = _.filter(dataObj.raw_stock, function(obj){
                return (obj.item_id == itemDetail[map.itemId]);
            });
            var countInDB = parseInt(itemDetailInStock[0].count);            
            var newCount = currentCount + countInDB ;
            return newCount;
        },
        
        isValidProp: function(prop){
            var isValid = true;
            if(_.isUndefined(prop) || _.isEmpty(prop) || _.isNull(prop))
                isValid = false;
            return isValid;
        }
    };

    return {
        init: init,
        refresh: refresh
    }
})();

