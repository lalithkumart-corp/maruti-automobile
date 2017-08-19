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
    };

    function init(){
        fetchAutoCompleterList();
        bindEvents();
        moveTabFocus();
    }

     /*START: Binding events block*/
    function bindEvents(){
        bindItemBlurEvent();
        bindAddRowEvent();
    }

    function bindItemBlurEvent(){
        $(sel.itemQtyField).off('blur').on('blur', function(e){            
            var parentRow = $(this).closest('tr');
            var qtyVal = parseInt($(this).val());
            var identifier = $(parentRow).find(sel.itemDescFieldElm).data('identifier');
            var itemDetails = dataObj.raw_stock[identifier];
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
                collections = $.map(dataObj.ac.itemIds, function (listItem) { return { value: listItem, data: { category: 'Brands' }}; });
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
     /*END: Binding events block*/

    function fetchAutoCompleterList(){
       var aCallBackObj = am.core.getCallbackObject();
       aCallBackObj.bind('api_response', function(event, response){           
            dataObj.raw_stock = JSON.parse(response);          
            parseResponse();
            bindAutoCompleterList();
        });
        am.stock.core.fetchStockListFromDB(aCallBackObj);
    }

    function parseResponse(){
        dataObj.ac.itemIds = [];
        dataObj.ac.descObj = {};
        _.each(dataObj.raw_stock, function(anItem, index){
            var aBrand = '', aDesc = '', aPartNo = '';
            if(anItem.item_brand !== '' && dataObj.ac.brands.indexOf(anItem.item_brand) == -1)
                aBrand = anItem.item_brand + '-';
            if(anItem.item_name !== '' && dataObj.ac.brands.indexOf(anItem.item_name) == -1)
                aDesc = anItem.item_name + '-';
            if(anItem.item_part_no !== '' && dataObj.ac.brands.indexOf(anItem.item_part_no) == -1)
                aPartNo = anItem.item_part_no + '-';
            var descVal = aBrand + aDesc + aPartNo;
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

    }
    /*END: Filler methods */

    /* START: getter methods */
    function getPriceDetails(detail){
        var options = {
            cgst: detail.cgst,
            sgst: detail.sgst,
            mrp: detail.new_selling_price || detail.unit_selling_price,
            requireDetail: true
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
                newRowHtmlstr += '<td><input type="text" class="aw ah only-b-border s-no" value="'+ (currSNo+1) +'" /></td>';
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
            total.qty += parseFloat($(aField).val());
        });
        _.each($(sel.itemSellingPriceField), function(aField, index){
            total.price += parseFloat($(aField).val());
        });
        _.each($(sel.itemCgstTaxValField), function(aField, index){
            total.cgst += parseFloat($(aField).val());
        });
        _.each($(sel.itemSgstTaxValField), function(aField, index){
            total.sgst += parseFloat($(aField).val());
        });
        _.each($(sel.itemSellingValueField), function(aField, index){
            total.value += parseFloat($(aField).val());
        });
        return total;
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


    return {
        init: init,
        dataObj: dataObj
    }
})();