var am = am || {};
am.billing = (function(){
    var dataObj = {
        ac:{
            itemIds: [],
            brands: [],
            itemNames: [],
            partNos: []
        }
    };
    
    var map = am.stock.core.map;

    var cls = {
        needACItemId: 'need-ac-itemid',
        needACBrand: 'need-ac-brand',
        needACItem: 'need-ac-item',
        needACPartno: 'need-ac-partno',
        needACDesc: 'need-ac-item-desc',
        addRow: 'add-row',
        needFocus: 'need-focus'
    };

    var sel = {
        needACItemId: '.billing-contentpane .' + cls.needACItemId,
        needACBrand: '.billing-contentpane .' + cls.needACBrand,
        needACItem: '.billing-contentpane .' + cls.needACItem,
        needACPartno: '.billing-contentpane .' + cls.needACPartno,
        needACDesc: '.billing-contentpane .' + cls.needACDesc,           
        addRow: '.billing-contentpane .' + cls.addRow,
        needFocus: '.billing-contentpane .' + cls.needFocus,

        billNoField: '.billing-main-panel .bill-no',
        billDateField: '.billing-main-panel .billing-date',

        tableBody: '.billing-contentpane .billing-table-container table tbody',

        itemIdField: '.billing-contentpane .item-id-field',
        itemIdFieldElm: '.item-id-field',
        itemDescField: '.billing-contentpane .item-desc-field',        
        itemDescFieldElm: '.item-desc-field',
        itemQtyField: '.billing-contentpane .count-field',
        itemQtyFieldElm: '.count-field',
        itemSellingPriceField: '.billing-contentpane .selling-price-field',
        itemSellingPriceFieldElm: '.selling-price-field',
        itemCgstTaxField: '.billing-contentpane .cgst-tax-field',
        itemCgstTaxFieldElm: '.cgst-tax-field',
        itemCgstTaxValField: '.billing-contentpane .cgst-tax-value-field',
        itemCgstTaxValFieldElm: '.cgst-tax-value-field',
        itemSgstTaxField: '.billing-contentpane .sgst-tax-field',
        itemSgstTaxFieldElm: '.sgst-tax-field',
        itemSgstTaxValField: '.billing-contentpane .sgst-tax-value-field',
        itemSgstTaxValFieldElm: '.sgst-tax-value-field',
        itemSellingValueField: '.billing-contentpane .selling-value-field',
        itemSellingValueFieldElm: '.selling-value-field',

        totalQtyField: '.billing-contentpane .total-qty-field',
        totalPriceField: '.billing-contentpane .total-price-field',
        totalCgstField: '.billing-contentpane .total-cgst-field',
        totalSgstField: '.billing-contentpane .total-sgst-field',
        totalValueField: '.billing-contentpane .total-value-field',

        totalInputField: '.billing-main-panel .amount-details .total-amt',
        discountInputfield: '.billing-main-panel .amount-details .discount-amt',
        subTotalAmt: '.billing-main-panel .amount-details .sub-total-amt',
        paidAmt: '.billing-main-panel .amount-details .paidAmt',
        dueAmt: '.billing-main-panel .amount-details .due-amt',
        submitBtn: '.billing-main-panel .billing-panel-submit-btn'
    };

    function init(){                
        fetchAutoCompleterList();
        bindEvents();
        initialSetup();        
    }

    function initialSetup(){
        fetchSettings();
        moveTabFocus();
    }

     /*START: Binding events block*/
    function bindEvents(){
        bindItemBlurEvent();
        bindAddRowEvent();
        bindSubmitEvent();
        bindAmoutCalcEvents();
        bindTraverseEvents();
        $(sel.billDateField).datepicker().datepicker("setDate", new Date());
    }

    function bindItemBlurEvent(){
        $(sel.itemQtyField).off('blur').on('blur', function(e){            
            var parentRow = $(this).closest('tr');
            var qtyVal = parseInt($(this).val());
            var identifier = $(parentRow).find(sel.itemDescFieldElm).data('identifier');
            var itemDetails = dataObj.raw_stock[identifier];
            if(_.isUndefined(itemDetails))
                return;
            newSellingValue = parseInt(itemDetails.unit_selling_price) * qtyVal;
            itemDetails.new_selling_price = newSellingValue;
            fillPriceDetails(itemDetails, parentRow);
            fillTotalDetails();
        });
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

    function bindAmoutCalcEvents(){
        $(sel.discountInputfield).off('keyup').on('keyup', function(e){
            calculateAmountDetails();
        });
        $(sel.paidAmt).off('keyup').on('keyup', function(e){
            calculateAmountDetails();
        });
    }

    function bindAutoCompleterList(){
        bindAutoCompleteFor('itemid');
        bindAutoCompleteFor('desc');
        afterAutoCompleteBinded();
    }

    function bindAutoCompleteFor(elmName){        
        var collections, selector;
        var filterMode;
        switch(elmName){
            case 'itemid':
                collections = $.map(dataObj.ac.itemIds, function (listItem, index) { return { value: listItem, data: { category: 'ID',  identifier: index }}; });
                selector = sel.needACItemId;
                break;
            case 'desc':
                collections = $.map(dataObj.ac.descObj, function (listItem, index) {
                     return { value: listItem, data: { category: 'Description' , identifier: index }}; 
                });
                selector = sel.needACDesc;
                filterMode = 'anywhere';
                break;
        }
        $(selector).devbridgeAutocomplete({
            lookup: collections,
            minChars: 0,
            onSelect: function (suggestion) {                
                $(this).attr('data-identifier', suggestion.data.identifier);
                optionsSelectCallback(suggestion);
            },
            showNoSuggestionNotice: true,
            noSuggestionNotice: 'No results!',
            groupBy: 'category',
            filterMode: filterMode
        });
    }

    function bindTraverseEvents(){
        $(sel.tableBody).on('keydown', 'input:not(.add-row)', function(event){
            var $this = $(event.target);
            if (event.which == 13) {
                event.preventDefault();
                $(this).closest('td').next().find('input').focus();
            }
        });
    }

    function bindSubmitEvent(){
        $(sel.submitBtn).off('click').on('click', function(e){
            makeTableClean();
            var isValid = validateEntries();
            if(isValid){
                var tableData = getCleanTableData();
                var shortenedData = helper.doShorten(tableData);
                updateStock(shortenedData);
                printBill(shortenedData);
            }
        });
    }

     /*END: Binding events block*/

     function fetchSettings(){
        var queryObj = {
            aQuery: "SELECT * from "+am.database.schema+".config;"
        }
        var callBackObj = am.core.getCallbackObject();
		var request = am.core.getRequestData('../php/executequery.php', queryObj, 'POST');
		callBackObj.bind('api_response', function(event, response){            
            var data = JSON.parse(response);
            dataObj.lastBillNumber = parseInt(data[0].last_selling_bill_no);
            dataObj.currentBillNo = dataObj.lastBillNumber + 1;
            setBillNumber();
        });
        am.core.call(request, callBackObj);
     }

    function fetchAutoCompleterList(){
       var aCallBackObj = am.core.getCallbackObject();
       aCallBackObj.bind('api_response', function(event, response){           
            dataObj.raw_stock = JSON.parse(response);          
            parseResponse();
            bindAutoCompleterList();
        });
        am.stock.core.fetchStockListFromDB(aCallBackObj);
    }

    function setBillNumber(){
        $(sel.billNoField).val(dataObj.currentBillNo);
    }

    function parseResponse(){
        dataObj.ac.itemIds = [];
        dataObj.ac.descObj = {};
        _.each(dataObj.raw_stock, function(anItem, index){            
            var descVal = formItemDesc(anItem);
            descVal = descVal.substring(0, (descVal.length-1));
            dataObj.ac.descObj[index] = descVal;
            if(dataObj.ac.itemIds.indexOf(anItem.item_id) == -1)
                dataObj.ac.itemIds.push(anItem.item_id);
        });        
    }
    
    function optionsSelectCallback(suggestion){
        if(_.isUndefined(suggestion.data.identifier))
            return;
        var identifier = suggestion.data.identifier;
        var currItemDetails = dataObj.raw_stock[identifier];
        fillRow(currItemDetails, identifier);        
    }

    function afterAutoCompleteBinded(){
        $(sel.needACItemId).removeClass(cls.needACItemId);
        $(sel.needACDesc).removeClass(cls.needACDesc);
    }

    /*START: Filler methods */
    function fillRow(itemDetails, identifier){        
        var currentRow = $(sel.tableBody + ' [data-identifier="'+identifier+'"]').closest('tr');
        $(currentRow).find(sel.itemIdFieldElm).val(itemDetails.item_id);           
        var descVal = formItemDesc(itemDetails);
        $(currentRow).find(sel.itemDescFieldElm).val(descVal);          
        $(currentRow).find(sel.itemSgstTaxFieldElm).val(itemDetails.sgst);
        $(currentRow).find(sel.itemCgstTaxFieldElm).val(itemDetails.cgst);
        if($(currentRow).find(sel.itemQtyFieldElm).val().trim() == '')
            $(currentRow).find(sel.itemQtyFieldElm).val(1);
        else{
            var qty = parseInt($(currentRow).find(sel.itemQtyFieldElm).val().trim());
            itemDetails.new_selling_price = itemDetails.unit_selling_price * qty;
        }        
        fillPriceDetails(itemDetails, currentRow);
        fillTotalDetails();
    }

    function fillPriceDetails(itemDetails, currentRow){
        var data = getPriceDetails(itemDetails);
        $(currentRow).find(sel.itemSellingValueFieldElm).val(itemDetails.new_selling_price || itemDetails.unit_selling_price);        
        $(currentRow).find(sel.itemCgstTaxValFieldElm).val(data.cgstTaxValue);
        $(currentRow).find(sel.itemSgstTaxValFieldElm).val(data.cgstTaxValue);
        $(currentRow).find(sel.itemSellingPriceFieldElm).val(data.price);
    }

    function fillTotalDetails(){        
        var details = getTotalDetails();
        $(sel.totalQtyField).val(details.qty);
        $(sel.totalPriceField).val(details.price);
        $(sel.totalCgstField).val(details.cgst);
        $(sel.totalSgstField).val(details.sgst);
        $(sel.totalValueField).val(details.value);

        $(sel.totalInputField).val(details.value);
        calculateAmountDetails();

    }   
    /*END: Filler methods */

    /* START: getter methods */
    function getPriceDetails(detail){
        var options = {
            cgst: detail.cgst,
            sgst: detail.sgst,
            mrp: detail.new_selling_price || detail.unit_selling_price,
            requireDetail: true,
            roundOff: 2
        }
        return am.utils.calc.priceCalculator(options);
    }

    function getRowData(currRow){
        var currSNo;
        if(!_.isUndefined(currRow)){
            currSNo = $(currRow).find('.s-no').val().trim();
            currSNo = parseInt(currSNo);
        }else
            currSNo = 0;
        var newRowHtmlstr = '<tr>';
                newRowHtmlstr += '<td><input type="text" class="aw ah only-b-border s-no" value="'+ (currSNo+1) +'" disabled /></td>';
                newRowHtmlstr += '<td><input type="text" class="need-ac-itemid aw ah only-b-border item-id-field"/></span></td>';
                newRowHtmlstr += '<td><input type="text" class="need-ac-item-desc need-focus aw ah only-b-border item-desc-field" data-identifier=""/></td>';
                newRowHtmlstr += '<td><input type="number" class="aw ah only-b-border count-field"/></td>';

                newRowHtmlstr += '<td><input type="number" class="aw ah only-b-border selling-price-field"/></td>';
                newRowHtmlstr += '<td><input type="number" class="aw ah only-b-border cgst-tax-field"/></td>';
                newRowHtmlstr += '<td><input type="number" class="aw ah only-b-border cgst-tax-value-field"/></td>';
                newRowHtmlstr += '<td><input type="number" class="aw ah only-b-border sgst-tax-field"/></td>';

                newRowHtmlstr += '<td><input type="number" class="aw ah only-b-border sgst-tax-value-field"/></td>';
                newRowHtmlstr += '<td><input type="number" class="aw ah only-b-border selling-value-field add-row"/></td> ';
            newRowHtmlstr += '</tr>';
        return newRowHtmlstr;
    }

    function getTotalDetails(){
        return calculateTotals();
    }

    function getItemById(itemId){
        itemId = itemId.trim();
        var itemDetail = _.filter(dataObj.raw_stock, function(obj){
            return (obj.item_id == itemId);
        });
        return itemDetail;
    }

    function getAllQTYFromTable(itemId){

    }

    function getTableData(){
        var tableEntries = [];
        _.each($(sel.tableBody+ ' tr'), function(aRow, index){
            var aRowObj = {
                itemId: $(aRow).find(sel.itemIdFieldElm).val().trim(),
                itemDesc: $(aRow).find(sel.itemDescFieldElm).val().trim(),
                itemQty: $(aRow).find(sel.itemQtyFieldElm).val().trim(),
                itemPrice: $(aRow).find(sel.itemSellingPriceFieldElm).val().trim(),
                itemCgstTax: $(aRow).find(sel.itemCgstTaxFieldElm).val().trim(),
                itemCgstTaxVal: $(aRow).find(sel.itemCgstTaxValFieldElm).val().trim(),
                itemSgstTax: $(aRow).find(sel.itemSgstTaxFieldElm).val().trim(),
                itemSgstTaxVal: $(aRow).find(sel.itemSgstTaxValFieldElm).val().trim(),
                itemValueField: $(aRow).find(sel.itemSellingValueFieldElm).val().trim(),
                rowNumber: [index]
            }
            tableEntries.push(aRowObj);
        });
        return tableEntries;        
    }

    function getCleanTableData(){
        var tableEntries = getTableData();        
        //do validation for, if same item exists at multiple rows, then combine that item count
        var cleanedItemStorage = [];
        var idArray = [];        
        _.each(tableEntries, function(anItemDetail, index){
            var theItemId = anItemDetail.itemId;
            if(idArray.indexOf(theItemId) == -1){
                cleanedItemStorage.push(anItemDetail);
                idArray.push(theItemId);
            }else{
                _.each(cleanedItemStorage, function(validatedItemDetail, key){ 
                    if(validatedItemDetail.itemId == theItemId){
                        var thisItemDetail = getItemById(theItemId)[0];
                        if(!_.isUndefined(thisItemDetail)){
                            var count1 = parseInt(validatedItemDetail.itemQty);
                            var count2 = parseInt(anItemDetail.itemQty);
                            var countSummation = count1 + count2;                        

                            var newSellingValue = parseInt(thisItemDetail.unit_selling_price) * countSummation;
                            thisItemDetail.new_selling_price = newSellingValue;
                            var priceDetails = getPriceDetails(thisItemDetail);

                            validatedItemDetail.itemQty = countSummation;
                            validatedItemDetail.itemPrice = priceDetails.price;
                            validatedItemDetail.itemCgstTaxVal = priceDetails.cgstTaxValue;
                            validatedItemDetail.itemSgstTaxVal = priceDetails.sgstTaxValue;     
                            validatedItemDetail.itemValueField = newSellingValue;                            
                        }
                        validatedItemDetail.rowNumber.push(index);
                    }                                                 
                });
            }
        });
        return cleanedItemStorage;
    }

    function getStockUpdateItemQuery(datum){
        var query = 'UPDATE ' + am.database.schema + '.stock SET ';
        query += 'count=' + getUpdatedCount(datum) + ' ';
        query += 'WHERE item_id=' + datum[map.itemId];
        query += '; ';
        return query;
    }
    function getUpdatedCount(itemDetail){
        var currentCount = itemDetail[map.itemCount];
        currentCount = parseInt(currentCount);
        var itemDetailInStock = _.filter(dataObj.raw_stock, function(obj){
            return (obj.item_id == itemDetail[map.itemId]);
        });
        var countInDB = parseInt(itemDetailInStock[0].count);            
        var newCount = countInDB - currentCount ;
        return newCount;
    }
    /* END: getter methods */

    /*START: Helper's bloak */
    function calculateTotals(){
        var total = {
            qty: 0,
            price: 0,
            cgst: 0,
            sgst: 0,
            value: 0
        };        
        _.each($(sel.itemQtyField), function(aField, index){
            var aValue = $(aField).val() || 0;
            total.qty += parseFloat(aValue);
        });
        _.each($(sel.itemSellingPriceField), function(aField, index){
            var aValue = $(aField).val() || 0;
            total.price += parseFloat(aValue);
        });
        _.each($(sel.itemCgstTaxValField), function(aField, index){
            var aValue = $(aField).val() || 0;
            total.cgst += parseFloat(aValue);
        });
        _.each($(sel.itemSgstTaxValField), function(aField, index){
            var aValue = $(aField).val() || 0;
            total.sgst += parseFloat(aValue);
        });
        _.each($(sel.itemSellingValueField), function(aField, index){
            var aValue = $(aField).val() || 0;
            total.value += parseFloat(aValue);
        });
        return total;
    }

    function calculateAmountDetails(){        
        var total = parseFloat($(sel.totalInputField).val().trim());
        var discountRate = parseFloat($(sel.discountInputfield).val().trim() || 0);
        var subTotalAmt = total - discountRate;
        $(sel.subTotalAmt).val(subTotalAmt);
        var paidAmt = parseFloat($(sel.paidAmt).val().trim() || 0);
        var balance = subTotalAmt - paidAmt;
        $(sel.dueAmt).val(balance);
    }

    /* function validateEntries(){
        var isValid = true;
        var tableRows = $(sel.tableBody + " tr");
        _.each(tableRows, function(aRow, index){
            var itemId = $(aRow).find(sel.itemIdFieldElm).val().trim();
            if(hasMultipleSameEntry(itemId)){
                getAllQTYFromTable(itemId);
            }
            var sellingQty = $(aRow).find(sel.itemQtyFieldElm).val().trim();
            sellingQty = parseInt(sellingQty);
            var itemDetail = getItemById(itemId);
            var qtyInStock = parseInt(itemDetail[0].count);
            if(sellingQty > qtyInStock)
                $(aRow).addClass('has-error');
            else
                $(aRow).removeClass('has-error');
        });
        if($(sel.tableBody).find('.has-error').length > 0)
            isValid = false;
        return isValid;
    } */

    function validateEntries(){
        var isValid = true;
        var tableData = getCleanTableData();
        _.each(tableData, function(datum, index){
            var sellingItemId = datum.itemId;
            var sellingQty = parseInt(datum.itemQty);
            var itemDetail = getItemById(sellingItemId)[0];
            if(!_.isUndefined(itemDetail)){
                var qtyInStock = parseInt(itemDetail.count);
                if(sellingQty > qtyInStock)
                    updateErrorState('has-error', datum);
                else
                    updateErrorState('no-error', datum);
            }else{
                updateErrorState('has-error', datum);
            }
        });
        if($(sel.tableBody).find('.has-error').length > 0)
             isValid = false;
        return isValid;
    }

    function hasMultipleSameEntry(itemId){
        var entryCount = 0
        _.each($(sel.tableBody + ' tr input' + sel.itemIdFieldElm), function(aCell, index){
            if($(aCell).val().trim() == itemId)
                entryCount++;
        });
        if(entryCount > 2)
            return true;
        else
            return false;
    }

    function updateErrorState(action, data){
        _.each(data.rowNumber, function(aRowNumber, index){    
            switch(action){
                case 'has-error':
                    $(sel.tableBody + ' tr:eq('+aRowNumber+')').addClass('has-error');
                    break;
                case 'no-error':
                    $(sel.tableBody + ' tr:eq('+aRowNumber+')').removeClass('has-error');
                    break;
            }
        });
    }

    function formItemDesc(data){
        var aBrand = '', aDesc = '', aPartNo = '';
        if(data.item_brand !== '')
            aBrand = data.item_brand + '-';
        if(data.item_name !== '')
            aDesc = data.item_name + '-';
        if(data.item_part_no !== '')
            aPartNo = data.item_part_no + '-';
        var descVal = aBrand + aDesc + aPartNo;
        return descVal;
    }

    function updateStock(tableData){
        var obj = {}, query = '';
        _.each(tableData, function(datum, index){
            query += getStockUpdateItemQuery(datum);
        });
        obj.multiQuery = 'true';
        obj.aQuery = 'SET SQL_SAFE_UPDATES = 0;';
        obj.aQuery += query;
        obj.aQuery += 'SET SQL_SAFE_UPDATES = 1;';
        var callBackObj = am.core.getCallbackObject();            
        var request = am.core.getRequestData('../php/executequery.php', obj , 'POST');
        callBackObj.bind('api_response', function(event, response){
            handleStockUpdateResponse(response);            
        });
        am.core.call(request, callBackObj);
    }

    function printBill(tableData){

    }

    function updateLastBillNoDB(){
        var currentBillNo = dataObj.currentBillNo;
        var queryObj = {
            aQuery: "UPDATE "+am.database.schema+".config SET last_selling_bill_no='"+currentBillNo+"';"
        }
        var callBackObj = am.core.getCallbackObject();
		var request = am.core.getRequestData('../php/executequery.php', queryObj, 'POST');
		callBackObj.bind('api_response', function(event, response){
            var data = JSON.parse(response);
            dataObj.lastBillNumber = dataObj.currentBillNo;
            dataObj.currentBillNo++;    
        });
        am.core.call(request, callBackObj);
    }

   
    /*END: Helper's bloak */

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

    function makeTableClean(){ //will remove the row if it does not have item description
         _.each($(sel.tableBody+ ' tr input.item-desc-field'), function(aCell, index){
            var itemVal = $(aCell).val().trim();
            if(itemVal == '')
                $(aCell).closest('tr').remove();
        });
        resetSerialNumbers();
        fillTotalDetails();
    }

    function resetSerialNumbers(){
        _.each($(sel.tableBody+ ' tr input.s-no'), function(aCell, index){
            $(aCell).val(index+1);
        });
    }

    function handleStockUpdateResponse(response){
        response = JSON.parse(response);
        if(response[0].status){
            fetchAutoCompleterList();
            clearEntries();
            am.alert.success('Alert updated successfully!');
        }else
            couldNotUpdateStock();
    }

    function couldNotUpdateStock(){
        am.alert.error('Alert could not be updated!');
    }

    function clearEntries(){
        $(sel.tableBody).html(getRowData());
        moveTabFocus();
        bindAddRowEvent();
        bindItemBlurEvent();
    }

    var helper = {
        doShorten: function(data){   
            var shortenedList = [];         
            if(!_.isUndefined(data)){
                _.each(data, function(datum, index){
                    var obj = {};
                    _.each(datum, function(aProp, key){
                        var newKey = map[key] || key;
                        obj[newKey] = aProp;
                    });
                    shortenedList.push(obj);
                });
            }
            return shortenedList;
        }
    }

    return {
        init: init       
    }
})();