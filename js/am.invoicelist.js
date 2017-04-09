if(typeof am == 'undefined'){
    var am = {};
}
am.invoiceList = {
    sel: am.sel.getInvoiceListSelectors(),
    rerender: false,
    dataModel:{
        rawLists: null
    },
    init: function(){
        am.invoiceList.fetchTableData();
        am.invoiceList.bindEvents();
    },
    bindEvents: function(){
        var self = am.invoiceList, sel = self.sel;
        $(sel.deleteBtn).on('click', function(e){
            if($(this).hasClass('disabled'))
				return;
			am.deleteInvoice.showConfirmation();
        });
    },
    fetchTableData: function(){
        var self = am.invoiceList;
        var query = {
            //aQuery: 'Select * from '+am.database.schema+'.invoive_list;'
            aQuery: 'SELECT * FROM '+am.database.schema+'.invoive_list where moved_to_trash != "trashed" OR isnull(moved_to_trash);'
        };
        var callBackObj = am.core.getCallbackObject();
		var request = am.core.getRequestData('../php/executequery.php', query, 'POST');
		callBackObj.bind('api_response', function(event, response){
            var data = JSON.parse(response);
            self.dataModel.rawLists = data;
            self.renderTable(data);
        });
        am.core.call(request, callBackObj);
    },
    renderTable: function(tableData){
        var self = am.invoiceList, sel = self.sel;
        var property = {
            tableData: tableData
        };
        var template = _.template(template_invoice_list_table, property);
        $(sel.tableContainer).html(template);
        self.renderAsDataTable();
    },
    renderAsDataTable: function(){
        var self = am.invoiceList, sel = self.sel;
        $(sel.table+ ' thead tr#filterData th').not(":eq(0), :eq(2), :eq(4), :eq(5), :eq(6), :eq(7)").each( function () {
        	var title = $(sel.table+ ' thead tr#filterData th').eq( $(this).index() ).text();
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
               self.tableComplete();
            }).DataTable({
                paging: false,
                scrollY: 400,
                scrollCollapse: true,
                     aoColumns : [
                        { "sWidth": "3%"},
                        { "sWidth": "10%"},
                        { "sWidth": "10%"},
                        { "sWidth": "20%"},
                        { "sWidth": "5%"},
                        { "sWidth": "5%"},
                        { "sWidth": "5%"},
                        { "sWidth": "5%"}
                    ]
        	});
        self.table = table;
    },
    tableComplete: function(){
		var self = am.invoiceList, sel = self.sel;
		if(typeof self.table != 'undefined' && !_.isEmpty(self.table)){
            self.table.draw();
            self.bindTableEvents();
        }else{
            setTimeout(function(){
                self.tableComplete();
            },200);
        }
	},
    bindTableEvents: function(){
        var self = am.invoiceList, sel = self.sel;        
        $(sel.tableInvoiceCell).off().on('click', function(e){
            e.stopPropagation();
            var uniqueNo = $(this).data('unique-no');
            var myInvoiceData = self.getInvoiceData(uniqueNo);
            function onEditInvoicePopupShown(){
                self.onEditInvoicePopupShown(myInvoiceData);
            }
            var options = {};
                options.title= "Edit Invoice...";
                options.body = _.template(template_htmlstr_addInvoice, {});
                options.buttons = ['Edit', 'Update'];
                options.onShownCallback = onEditInvoicePopupShown;
                options.onHiddenCallback = self.onHiddenCallback;
                options.className = "editInvoicePopup"
            am.commonPopup.init(options);
        });
        $(sel.tableRow).off().on('click', function(e){
            if($(this).hasClass('anItemSelected')){
        		$(this).removeClass('anItemSelected');				
        	}else{
	            $(this).addClass('anItemSelected');
	        }
			if($('.anItemSelected').length == 0)
				$(sel.deleteBtn).addClass('disabled');				
			else
				$(sel.deleteBtn).removeClass('disabled');			
        });
    },
    getInvoiceData: function(uniqueNo){
        var self = am.invoiceList, sel = self.sel, myInvoiceData = null;
        var allInvoiceLists = self.dataModel.rawLists;
        if(allInvoiceLists !== null){
            _.each(allInvoiceLists, function(anInvoice, index){
                if(anInvoice.unique_no == uniqueNo){
                    myInvoiceData = anInvoice;
                    return false;
                }
            });
        }
        return myInvoiceData;
    },
    onEditInvoicePopupShown: function(myInvoiceData){
        var self = am.invoiceList;
        am.editInvoice.init(myInvoiceData);        
    },
    onHiddenCallback: function(){
        var self = am.invoiceList;
        if(self.rerender){
            am.invoiceList.fetchTableData();
            self.rerender = false;
        }
    }
}

am.editInvoice = {
    sel : am.sel.getAddInvoiceSelectors(),
    myInvoiceData: null,
    currentUniqueIdentifier: null,
    init: function(myInvoiceData){
        var self = am.editInvoice;
        self.myInvoiceData = myInvoiceData;
        self.currentUniqueIdentifier = myInvoiceData.unique_no;
        self.hideRightPanel();
        self.adjustPanelDimensions();
        self.fillEntries(self.myInvoiceData);
        self.disableElements();
        self.updateUIElements();
        am.addinvoice.bindEvents();
        am.editInvoice.bindEvents();
    },
    bindEvents: function(){
        var self = am.editInvoice, invoiceSel = self.sel;
        $('#btn0Edit').on('click', function(e){
            self.enableElements();
            $(this).hide();
            $('#btn1Update').show();
        });
        $('#btn1Update').on('click', function(e){
            var data = am.addinvoice.getEntries();
            data.unique_no = self.currentUniqueIdentifier;
            self.updateInvoice(data);
        });
    },
    hideRightPanel: function(){
        var invoiceSel = am.editInvoice.sel;
        $(invoiceSel.rightPane).hide();
    },
    adjustPanelDimensions: function(){
        var invoiceSel = am.editInvoice.sel;
        $(invoiceSel.leftPane).removeClass('col-sm-7').addClass('col-sm-12');
        $(invoiceSel.mainContainer).css('width', 'auto');
        $(invoiceSel.addInvoiceToDB).hide();
    },
    fillEntries: function(data){
        var invoiceSel = am.editInvoice.sel;
        $(invoiceSel.date).val(data.date);
        $(invoiceSel.invoiceNo).val(data.invoice_no);
        $(invoiceSel.dealerName).val(data.delear_name);
        $(invoiceSel.actualAmt1).val(data.amount);
        $(invoiceSel.actalAmt2).text(data.amount);
        $(invoiceSel.dueAmt).text(data.due_amt);
        $(invoiceSel.textBox).val(data.description);

        //fill payment details panel
        var payment_data = data.payment_data;
        if(payment_data != '' && !_.isUndefined(payment_data)){
            var payment_details = payment_data.split(',');
            var detailsLen = payment_details.length;
            var i = 1;
            while(i < detailsLen){
                am.addinvoice.appendPaymentRow();
                i++;
            }
            _.each(payment_details, function(data, index){
                var details = data.split(':');
                var elm = $('.paymentRow')[index];
                $(elm).find('.paidAmt').val(details[0]);
                $(elm).find('.paymentMode').val(details[1]);
                $(elm).find('.hasDatepicker').val(details[2]);
            });
        }

        //fill ite table details
        var items = data.items;
        var itemLists = items.split(',');
        var elm = '';
        _.each(itemLists, function(anItemData, index){
            var anItemDetails = anItemData.split(':'), val='';
            if(anItemDetails[2].toLowerCase() == 'original')
                val = 'checked';
        
            elm += '<tr>';
                elm += '<td><input type="text" value="'+ (index+1) +'" disabled/></td>';
                elm += '<td><input type="text" value="'+ anItemDetails[0] +'"/></td>';
                elm += '<td><input type="text" value="'+ anItemDetails[1] +'"/></td>';
                elm += '<td><input type="checkbox" '+ val +'/></td>';
                elm += '<td><input type="text" value="'+ anItemDetails[3] +'"/></td>';                
            elm += '</tr>';
        });
        $(invoiceSel.itemListTable+' tbody').html(elm);
    },
    disableElements: function(){
        $(".disablingLayer").show();
    },
    updateUIElements: function(){
        var invoiceSel = am.sel.getAddInvoiceSelectors();
        $(invoiceSel.addPaymentIcon).css('display', 'inline-block');
        $('#btn1Update').hide();
        $(invoiceSel.mainContainer).append('<div class="disablingLayer"></div>');
    },
    enableElements: function(){
        $(".disablingLayer").hide();
    },
    updateInvoice: function(data){
        var updated = false;
        var queryObj = {
            aQuery: "UPDATE "+am.database.schema+".invoive_list SET invoice_no='"+data.invoiceNo+"', date='"+data.date+"', delear_name='"+data.dealerName+"', amount='"+data.amount+"', paid_amt='"+data.paidAmt+"', due_amt='"+data.dueAmt+"', payment_mode='"+data.paymentMode+"', items='"+data.itemList+"', description='"+data.desc+"', payment_data='"+data.paymentData+"' WHERE unique_no='"+data.unique_no+"'"
        }
        var callBackObj = am.core.getCallbackObject();
		var request = am.core.getRequestData('../php/executequery.php', queryObj, 'POST');
		callBackObj.bind('api_response', function(event, response){
            var data = JSON.parse(response);
            if(data[0].status == true)
                updated = true;
            am.invoiceList.rerender = true;            
        });
        am.core.call(request, callBackObj);
    }
}

am.deleteInvoice = {
    showConfirmation: function(){
        var msg ;
        if($('.anItemSelected').length >1)
            msg = 'Will move selected invoice\'s to Trash. Are you sure ?';
        else
            msg = 'Will move a selected invoice to Trash. Are you sure ?'
            am.popup.init(
            {
                title: 'Confirmation',
                desc: msg,
                dismissBtnText: 'No',
                buttons: ['Delete'],
                callbacks: [am.deleteInvoice.moveToTrash]
            });
    },
	moveToTrash: function(){
        am.popup.hide();
        var idLists = [];
        var selectedRows = $('.anItemSelected');
        _.each(selectedRows, function(aRow, index){
            var identifier = $(aRow).find('.invoiceNo').data('unique-no');
            idLists.push(identifier);
        });
		if(idLists.length != 0){
			var obj = {};
            obj.multiQuery = 'true';
				obj.aQuery = 'SET SQL_SAFE_UPDATES = 0;';

				_.each(idLists, function(anId, index){
					obj.aQuery += 'UPDATE '+am.database.schema+'.invoive_list SET moved_to_trash = "trashed" WHERE unique_no="'+anId+'";';
				})
								
				obj.aQuery += 'SET SQL_SAFE_UPDATES = 1';
				var callBackObj = am.core.getCallbackObject();
				var request = am.core.getRequestData('../php/executequery.php', obj , 'POST');
				callBackObj.bind('api_response', function(event, response){
					response = JSON.parse(response);
					if(response[0].status == true){
						am.popup.init({
							title: 'Success',
							desc: 'Selected invoice has been moved to trash Successfully !',
							dismissBtnText: 'Ok',
                            onHiddenCallback: am.invoiceList.fetchTableData
						});
                    }else{
						am.popup.init({
							title: 'Error',
							desc: 'Error!, Selected invoice could not be moved to trash! ',
							dismissBtnText: 'Ok'
						});
					}
				});
				am.core.call(request, callBackObj);
		}
	},
	
	confirmDelete: function(options){ //Has not yet fully implemented. TODO: UI part for deleting an invoice completely from Database.
        am.popup.hide();
		var idLists = options.ids || [];
		if(idLists.length != 0){
			var obj = {};
				obj.aQuery = 'SET SQL_SAFE_UPDATES = 0;';

				_.each(idLists, function(anId, index){
					obj.aQuery += 'DELETE FROM automobile.invoive_list WHERE unique_no = "'+anId+'"';
				});
				
				obj.aQuery += 'SET @num := 0';
				obj.aQuery += 'UPDATE automobile.invoive_list SET sno = @num := (@num+1)';
				obj.aQuery += 'ALTER TABLE automobile.invoive_list AUTO_INCREMENT = 1';

				obj.aQuery += 'SET SQL_SAFE_UPDATES = 1';
				var callBackObj = am.core.getCallbackObject();
				var request = am.core.getRequestData('../php/executequery.php', obj , 'POST');
				callBackObj.bind('api_response', function(event, response){
					response = JSON.parse(response);
					if(response[0].status == true){
						am.popup.init({
							title: 'Success',
							desc: 'Selected invoice has been removed Successfully!',
							dismissBtnText: 'Ok'
						});							            
					}else{
						am.popup.init({
							title: 'Error',
							desc: 'Error!, Selected invoice could not be removed! ',
							dismissBtnText: 'Ok'
						});
					}
				});
				am.core.call(request, callBackObj);
		}
	}
}