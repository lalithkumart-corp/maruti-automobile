var am = am || {};
am.invoicelist = (function(){
    var dataObj = {};   

    var sel = {
        tableContainer: '#invoice_list_main_page .invoice_list_data_table_container',
        table: '#invoice_list_main_page .invoice-list-data-table',
        tableInvoiceCell: '#invoice_list_main_page .invoice-list-data-table .invoiceNo'
    };

    function init(){
        fetchTableData();
        bindEvents();
    }
    
    function fetchTableData(){
        var self = am.invoiceList;
        var query = {            
            aQuery: 'SELECT * FROM '+am.database.schema+'.invoice_list_new;'
        };
        var callBackObj = am.core.getCallbackObject();
		var request = am.core.getRequestData('../php/executequery.php', query, 'POST');
		callBackObj.bind('api_response', function(event, response){
            var data = JSON.parse(response);            
            data = parseResponse(data);
            dataObj.rawLists = data;
            renderTable(data);
        });
        am.core.call(request, callBackObj);
    }

    function parseResponse(data){
        _.each(data, function(anObj, index){            
            if(anObj.invoice_no == "")             
                anObj.invoice_no = '-';
            
        });
        return data;
    }

    function renderTable(data){        
        var property = {
            tableData: data
        };
        var template = _.template(template_invoice_list_data_table, property);
        $(sel.tableContainer).html(template);
        renderAsDataTable();
    }

    function renderAsDataTable(){
        
        $(sel.table+ ' thead tr#filterInvoice th').not(":eq(0), :eq(1), :eq(3), :eq(5), :eq(6), :eq(7), :eq(8)").each( function () {
        	var title = $(sel.table+ ' thead tr#filterInvoice th').eq( $(this).index() ).text();
        	var className = title.replace(/\./g, '');
        	className = className.replace(/\s/g, '');
        	$(this).html( '<input type="text" class="'+className+' filterInput" onclick="event.stopPropagation();" placeholder="'+title+'" />' );
    	});

    	$(sel.table+ " thead input[type='text']").on( 'keyup change', function () {
	        table
	            .column( $(this).parent().index()+':visible' )
	            .search( this.value )
	            .draw();
	    });

        var table = $(sel.table).on( 'init.dt', function () {
               //self.tableComplete();
            }).DataTable({  
                paging: false,
                scrollY: 400,
                scrollCollapse: true,
                     aoColumns : [
                        { "sWidth": "3%"},
                        { "sWidth": "3%"},
                        { "sWidth": "10%"},
                        { "sWidth": "10%"},
                        { "sWidth": "20%"},
                        { "sWidth": "5%"},
                        { "sWidth": "5%"},
                        { "sWidth": "5%"},
                        { "sWidth": "5%"}
                    ],
                    drawCallback: function( settings ) { //for updating serial number
                         
                    }
        	});
            tableComplete();
    }

    function tableComplete(){
        bindTableEvents();
    }

    function bindTableEvents(){
        $(sel.tableInvoiceCell).off().on('click', function(e){
            e.stopPropagation();
            var uniqueNo = $(this).data('unique-no');
            dataObj.currentUniqueIdentifier = uniqueNo;
            var myInvoiceData = getInvoiceData(uniqueNo);
            function afterPopupShown(){
                onEditInvoicePopupShown(myInvoiceData);
            }
            function onHiddenCallback(){
                rerenderTable();
            }
            var options = {};
                options.title= "Edit Invoice...";
                options.body = _.template(template_input_stock_main, {});
                options.buttons = ['Edit', 'Update'];
                options.onShownCallback = afterPopupShown;
                options.onHiddenCallback = onHiddenCallback;
                options.className = "editing-invoice-popup"
            am.commonPopup.init(options);
        });
    }

    function bindEvents(){

    }

    function getInvoiceData(uniqueNo){
        var myInvoiceData = null;``
        var allInvoiceLists = dataObj.rawLists;
        if(allInvoiceLists !== null){
            _.each(allInvoiceLists, function(anInvoice, index){
                if(anInvoice.unique_identifier == uniqueNo){
                    myInvoiceData = anInvoice;
                    return false;
                }
            });
        }
        return myInvoiceData;
    }

    function onEditInvoicePopupShown(theInvoiceData){ 
         $('.editing-invoice-popup .commonModalBodyDiv').prepend('<div class="edit-msg-container-stock"><p class="msg-string"></p></div>'); 
         $('.editing-invoice-popup .commonModalBodyDiv').prepend('<div class="edit-msg-container-invoice"><p class="msg-string"></p></div>');
         $('.editing-invoice-popup .commonModalBodyDiv').prepend('<div class="overlay-elm"></div>');    
        am.invoicelist.edit.init(theInvoiceData);
    }

    function rerenderTable(){
        if(!_.isUndefined(dataObj.rerender) && dataObj.rerender == true)
            fetchTableData();
    }

    function getValue(prop){
        var returnVal;
        switch(prop){
            case 'currentUniqueIdentifier':
                returnVal = dataObj.currentUniqueIdentifier;
                break;
        }
        return returnVal;
    }

     

    return {
        init: init,
        getValue: getValue,
        getInvoiceData: getInvoiceData,
        dataObj: dataObj
    }

})();

am.invoicelist.edit = (function(){
    var map = {
        itemId: 'iid',
        isNewItem: 'n',
        itemBrand: 'ib',
        itemName: 'in',
        itemPartNo: 'ip',
        itemMrp: 'im',
        itemPrice: 'ir',
        itemSellingPrice: 'is',
        itemCount: 'ic',
        itemCGSTTax: 'ict',
        itemSGSTTax: 'ist',
        itemValue: 'iv'
    };

    var temp = {

    };

    var sel = {
        //editinvoice selectors
        editInvoicePopup: '.editing-invoice-popup',
        editInvoiceTableBody: '.editing-invoice-popup .input-invoice-main .table-container tbody',
        invoiceNo: '.editing-invoice-popup .invoice-no',
        dealerName: '.editing-invoice-popup .delaer-name',
        invoiceDate: '.editing-invoice-popup .invoice-date',  
        textArea: '.editing-invoice-popup .bottom-container .notes-textarea',
        paymentRow: '.editing-invoice-popup .paymentRow',
        actualAmt: '.editing-invoice-popup .bottom-container .actual-amt',
        dueAmt: '.editing-invoice-popup .bottom-container .due-amt',
        invoiceMsgContainer: '.edit-msg-container-invoice',
        stockMsgContainer: '.edit-msg-container-stock'
    }
    function init(theInvoiceData){
        fillEntries(theInvoiceData);
        am.stock.input.editInvoicePopupController();
        bindEvents();
    }
    function bindEvents(){
        var self = am.editInvoice, invoiceSel = self.sel;
        $('#btn0Edit').on('click', function(e){
            //self.enableElements();
            $(this).hide();
            $('#btn1Update').show();
        });
        $('#btn1Update').on('click', function(e){
            var unique_no = am.invoicelist.getValue('currentUniqueIdentifier');
            var stockData = getUpdatedStockDetails(unique_no);            
            am.stock.input.updateStock(stockData, afterStockUpdate);
            var invoiceData = am.stock.input.getInvoiceDetails();            
            updateInvoice(invoiceData, unique_no);
        });
    }
    function afterStockUpdate(response){
        response = JSON.parse(response);
        if(response[0].status == true)
            am.stock.input.helper.showSuccessAlert('stock', 'Stock has been updated Successfully !');
        else
            am.stock.input.helper.showDangerAlert('stock', 'Error! Could not able to update the stock details ');            
    }
    function fillEntries(theInvoiceData){
        fillValue('invoiceNo', theInvoiceData.invoice_no);
        fillValue('dealerName', theInvoiceData.dealer_name);
        fillValue('date', theInvoiceData.date);
        fillValue('notes', theInvoiceData.invoice_note);
        fillValue('principalAmt', theInvoiceData.amount);
        fillValue('dueAmt', theInvoiceData.due_amount);
        fillTable(theInvoiceData.invoice_details);
        fillPaymentDetails(theInvoiceData.payment_data);  
    }

    /* START: Edit Popup fillers */
    function fillValue(elmIdentifier, val){
        switch(elmIdentifier){
            case 'invoiceNo':
                $(sel.invoiceNo).val(val);
                break;
            case 'dealerName':
                $(sel.dealerName).val(val);
                break;
            case 'date':
                $(sel.invoiceDate).val(val);
                break;
            case 'notes':
                $(sel.textArea).val(val);
                break;
            case 'principalAmt':
                $(sel.actualAmt).val(val);
                break;
            case 'dueAmt':
                $(sel.dueAmt).html(val);
                break;
        }
    }

    function fillTable(tableData){        
        var jsonData = JSON.parse(tableData);        
        $(sel.editInvoiceTableBody).html('');
        _.each(jsonData, function(aRowData, index){            
            var newRowHtmlstr = '<tr>';
                newRowHtmlstr += '<td><input type="text" class="aw ah only-b-border s-no" value="'+ (index+1) +'" /></td>';
                newRowHtmlstr += '<td class="item-id-cell"><span class="item-id">'+ aRowData[map.itemId]  +'</span></td>';
                newRowHtmlstr += '<td><input type="text" class="need-ac-brand aw ah only-b-border brand-name-field need-focus" value="'+ aRowData[map.itemBrand] +'"/></td>';
                newRowHtmlstr += '<td><input type="text" class="need-ac-item aw ah only-b-border item-name-field" value="'+ aRowData[map.itemName] +'"/></td>';
                newRowHtmlstr += '<td><input type="text" class="need-ac-partno aw ah only-b-border part-no-field" value="'+ aRowData[map.itemPartNo] +'"/></td>';
                newRowHtmlstr += '<td><input type="number" class="aw ah only-b-border count-field" value="'+ aRowData[map.itemCount] +'"/></td>';
                newRowHtmlstr += '<td><input type="number" class="aw ah only-b-border mrp-field" value="'+ aRowData[map.itemMrp] +'"/></td>';
                newRowHtmlstr += '<td><input type="number" class="aw ah only-b-border discount-field" value="'+ aRowData[map.itemDiscount] +'"/></td>';
                newRowHtmlstr += '<td><input type="number" class="aw ah only-b-border price-field" value="'+ aRowData[map.itemPrice] +'"/></td>';                
                newRowHtmlstr += '<td><input type="number" class="aw ah only-b-border cgst-tax-field" value="'+ aRowData[map.itemCGSTTax] +'"/></td>';
                newRowHtmlstr += '<td><input type="number" class="aw ah only-b-border sgst-tax-field" value="'+ aRowData[map.itemSGSTTax] +'"/></td>';
                newRowHtmlstr += '<td><input type="number" class="aw ah only-b-border value-field" value="'+ aRowData[map.itemValue] +'"/></td>';
                newRowHtmlstr += '<td><input type="number" class="aw ah only-b-border selling-price-field" value="'+ aRowData[map.itemSellingPrice] +'"/></td>';              
            newRowHtmlstr += '</tr>';
            $(sel.editInvoiceTableBody).append(newRowHtmlstr);
        });
        $(sel.editInvoiceTableBody).find('tr:last').find('.selling-price-field').addClass('add-row');
        
    }

    function fillPaymentDetails(paymentDetails){        
        paymentDetails = JSON.parse(paymentDetails);
        var i = 1;
        while(i < paymentDetails.length){
            am.stock.input.appendPaymentRow();
            i++;
        }
        _.each(paymentDetails, function(aPaymentDetail, index){
            var elm = $(sel.paymentRow)[index];
            $(elm).find('.paidAmt').val(aPaymentDetail.pv);
            $(elm).find('.paymentMode').val(aPaymentDetail.pm);
            $(elm).find('.hasDatepicker').val(aPaymentDetail.pd);
        });
    }

    /* END: Edit Popup fillers */

    function getUpdatedStockDetails(unique_no){
        temp.stockDetails = am.stock.input.getStockDetails();        
        var finalisedStockUpdates = tallyStockDetails(unique_no);
        return finalisedStockUpdates;        
    }

    function getUpdatedInvoiceDetails(){
        
    }

    function tallyStockDetails(unique_no){
        var currInvoiceData = am.invoicelist.getInvoiceData(unique_no);
        var existingItemDetail = JSON.parse(currInvoiceData.invoice_details)
        _.each(existingItemDetail, function(anItemDetail, index){
            var id = anItemDetail[map.itemId];
            var updatedItemDetail = getItemById(id);
            if(!_.isUndefined(updatedItemDetail))
                anItemDetail = adjustCount(anItemDetail, updatedItemDetail);
            else
                anItemDetail = reverseCount(anItemDetail);
        });
        var final = _.union(existingItemDetail, temp.stockDetails)
        return final;      
    }

    function getItemById(id){
        var returnVal;
        _.each(temp.stockDetails, function(datum, index){
            if(datum[map.itemId] == id){
                returnVal = datum;
                temp.stockDetails.splice(index, 1);
            }
        });
        return returnVal;
    }

    function adjustCount(obj1, obj2){
        var count1 = parseInt(obj1[map.itemCount]);
        var count2 = parseInt(obj2[map.itemCount]);
        var newCount;
        if(count1 !== count2)
            newCount = count2 - count1;
        else
            newCount = count2;
        obj1[map.itemCount] = newCount;
        return obj1;
    }

    function reverseCount(data){
        data[map.itemCount] = -Math.abs(data[map.itemCount]);
        return data;
    }

    function updateInvoice(data, unique_no){
        var updated = false;
        var msg = 'Error in Update the invoice.';
        var msgClassName = 'error';
        var obj = {};
        obj.multiQuery = 'true';
    	obj.aQuery = 'SET SQL_SAFE_UPDATES = 0;';
        obj.aQuery += "UPDATE "+am.database.schema+".invoice_list_new SET invoice_no='"+data.invoiceNo+"', dealer_name='"+ data.delearName +"', date='"+ data.invoiceDate +"', invoice_details='"+ data.itemJson +"', invoice_note='"+ data.notes +"', amount='"+ data.amount +"', paid_amount='"+ data.paidAmt +"', payment_data='"+ data.paymentDetails +"', due_amount='"+ data.dueAmount +"' WHERE unique_identifier='"+ unique_no +"';";
        obj.aQuery += 'SET SQL_SAFE_UPDATES = 1;';
        var callBackObj = am.core.getCallbackObject();
        var request = am.core.getRequestData('../php/executequery.php', obj , 'POST');
        callBackObj.bind('api_response', function(event, response){                            
            var data = JSON.parse(response);
            if(data[0].status == true)
                am.stock.input.helper.showSuccessAlert('invoice', 'Invoice has been updated Successfully!');
            else
                am.stock.input.helper.showDangerAlert('invoice', 'Error! Could not able to update the invoice');                    
            // if(data[0].status == true){
            //     updated = true;
            //     msg = 'Invoice updated successfully!';
            //     msgClassName = 'success';
            // }
            // $(sel.invoiceMsgContainer +' .msg-string').addClass(msgClassName);
            // $(sel.editInvoicePopup).scrollTop(0);
            // $(sel.invoiceMsgContainer +' .msg-string').html(msg).fadeIn(500).delay(4000).fadeOut(1000);
            am.invoicelist.dataObj.rerender = true;
        });
        am.core.call(request, callBackObj);         
    }

    return {
        init: init
    }
})();