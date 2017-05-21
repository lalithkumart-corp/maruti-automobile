if(typeof am == 'undefined'){
    var am = {};
}
am.invoiceList = {
    sel: am.sel.getInvoiceListSelectors(),
    viewMode: [],
    rerender: false,
    dataModel:{
        rawLists: null
    },
    init: function(){
        am.invoiceList.viewMode.push('pendingInvoice');
        am.invoiceList.fetchTableData();
        am.invoiceList.bindEvents();
    },
    bindEvents: function(){
        var self = am.invoiceList, sel = self.sel;
        $(sel.trashBtn).on('click', function(e){
            if($(this).hasClass('disabled'))
				return;
            var isValidSelection = am.deleteInvoice.isValidSelection('trash');
            if(isValidSelection)
			    am.deleteInvoice.showConfirmation('trash');
        });

        $(sel.restoreBtn).on('click', function(e){
            if($(this).hasClass('disabled'))
				return;
            var isValidSelection = am.deleteInvoice.isValidSelection('restore');
            if(isValidSelection)
			    am.deleteInvoice.showConfirmation('restore');
        });

        $(sel.deleteBtn).on('click', function(e){
            if($(this).hasClass('disabled'))
				return;
            var isValidSelection = am.deleteInvoice.isValidSelection('delete');
            if(isValidSelection)
			    am.deleteInvoice.showConfirmation('delete');
        });

        $('body').on('click', function (event) {
            self.dismissAllPopUps(event);
        });

        $(document).keyup(function (event) {
            if (event.which === 27) {
                self.dismissAllPopUps(event);
            }
        });
    },
    fetchTableData: function(){
        var self = am.invoiceList;
        var query = {
            //aQuery: 'Select * from '+am.database.schema+'.invoive_list;'
            aQuery: 'SELECT * FROM '+am.database.schema+'.invoive_list;'
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
        $(sel.trashBtn).addClass('disabled');
    },
    renderAsDataTable: function(){
        var self = am.invoiceList, sel = self.sel;
        $(sel.table+ ' thead tr#filterData th').not(":eq(0), :eq(1), :eq(3), :eq(5), :eq(6), :eq(7), :eq(8)").each( function () {
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
                         var serialNo = 1;
                        _.each($(sel.table+' tbody tr'), function(aRow, index){                            
                            if($(aRow).find('.dataTables_empty').length) //if no records in table, just return back .
                                return;
                            $(aRow).find('td:eq(0)').text(serialNo);
                            serialNo++;
                        });
                        self.bindTableEvents();
                        if(self.viewMode.indexOf('trashedInvoice') != -1){
                            $(sel.restoreBtnContainer).show();
                            $(sel.deleteBtnContainer).show();
                        }else{
                            $(sel.restoreBtnContainer).hide();
                            $(sel.deleteBtnContainer).hide();
                        }

                        if(self.viewMode.indexOf('pendingInvoice') != -1 || self.viewMode.indexOf('closedInvoice') != -1)
                            $(sel.trashBtnContainer).show();
                        else
                            $(sel.trashBtnContainer).hide();
                        
                        self.refreshBtnStates();
                    }
        	});
        self.table = table;

        $.fn.dataTableExt.afnFiltering.push(
            function(oSettings, aData, iDataIndex){
                var validRow = false;
                if(self.viewMode.indexOf('closedInvoice') != -1){
                    if(aData[1] == 'closed')
                        validRow = true;
                }
                if(self.viewMode.indexOf('pendingInvoice') != -1){
                    if(aData[1] == 'open')
                        validRow = true;
                }
                if(self.viewMode.indexOf('trashedInvoice') != -1){
                    if(aData[1] == 'trashed')
                        validRow = true;
                }
               return validRow;
                
            }
        );   
    },
    tableComplete: function(){
		var self = am.invoiceList, sel = self.sel;
		if(typeof self.table != 'undefined' && !_.isEmpty(self.table)){
            self.table.draw();
            var optionsPopover = '<div class="invoiceListOptions" data-toggle="optionsPopover" data-placement="right" data-html="'+self.getOptionsPopover() +'" data-content="'+ self.getOptionsPopover() +'" data-title="Options" data-class="viewModePopover" data-container="body"></div>'
            $('.dataTables_scrollHead .invoice-list-table thead tr#filterData th:eq(1)').html(optionsPopover);
            
            self.bindTableEvents();
        }else{
            setTimeout(function(){
                self.tableComplete();
            },200);
        }
	},
    
    bindTableEvents: function(){
        var self = am.invoiceList, sel = self.sel;  
        $(".dataTables_scrollHead [data-toggle = 'optionsPopover']").popover({trigger: "click"});
        $("[data-toggle = 'invoice-desc-popover']").popover({trigger: "click"});

        $('.invoiceListOptions').on('click', function(e){
            e.stopPropagation();
        });
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
			self.refreshBtnStates();
        });

        $('[data-toggle="optionsPopover"]').on('show.bs.popover', function(e) {
            setTimeout(function(){
                _.each(self.viewMode, function(value, index){
                    $("input[value='"+value+"']").attr('checked', true);    
                })
                $(".viewModePopover  input").off().on('change' , function(e){
                    self.viewMode = [];
                    _.each($('.popoverContainer input[type="checkbox"]:checked()'), function(aCheckbox, index){
                        self.viewMode.push($(aCheckbox).val());
                    });
                    self.table.draw();
                });
            },200);
        });
        $(sel.invoiceDescPopover).on('click', function(e){
            e.stopPropagation();
        });
    },
    refreshBtnStates: function(){
        var self = am.invoiceList;
        self.trashBtnState();
        self.restoreBtnState();
        self.deleteBtnState();
    },
    trashBtnState: function(){
        var self = am.invoiceList, sel = self.sel;
        if($('.anItemSelected .open, .anItemSelected .closed').length == 0)
            $(sel.trashBtn).addClass('disabled');				
        else
            $(sel.trashBtn).removeClass('disabled');	
    },
    restoreBtnState: function(){
        var self = am.invoiceList, sel = self.sel;
        if($('.anItemSelected .trashed').length == 0)
            $(sel.restoreBtn).addClass('disabled');
        else
            $(sel.restoreBtn).removeClass('disabled');       
    },
    deleteBtnState: function(){
        var self = am.invoiceList, sel = self.sel;
        if($('.anItemSelected .trashed').length == 0)
            $(sel.deleteBtn).addClass('disabled');				
        else
            $(sel.deleteBtn).removeClass('disabled');        
    },

    getOptionsPopover: function(){
        var optionsPopover = "<div class='popoverContainer'><label><input type = 'checkbox' value='pendingInvoice' name='options' class='optionsRadio'/><span class='secondaryRadio'></span>Pending Invoice's</label></br><label><input type = 'checkbox' value='closedInvoice' name='options' class='optionsRadio'/><span class='secondaryRadio'></span>Closed Invoice's</label></br><div class='seperator'></div><label><input type = 'checkbox' value='trashedInvoice' name='options' class='optionsRadio'/><span class='secondaryRadio'></span>Trashed Invoice's</label></div>";
        return optionsPopover;
    },
    //get description of a particular invoice for displaying in a popover container
    getInvoiceDesc: function(data){
        var descriptionPopover = "<div class='popoverContainer'>"+data.description+"</div>";
        return descriptionPopover;
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
        $('.editInvoicePopup .commonModalBodyDiv').prepend('<div class="update-invoice-msg-container"><p class="msg-string"></p></div>');
        var self = am.invoiceList;
        am.editInvoice.init(myInvoiceData);        
    },
    onHiddenCallback: function(){
        var self = am.invoiceList;
        if(self.rerender){
            am.invoiceList.fetchTableData();
            self.rerender = false;
        }
    },
    dismissAllPopUps: function(e){
        var popoverControls = $('[data-toggle="optionsPopover"],\
             [data-toggle="invoice-desc-popover"]');
        popoverControls.each(function () {
            //the 'is' for buttons that trigger popups
            //the 'has' for icons within a button that triggers a popup
            if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
                $(this).popover('hide');
            }
        });		     
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
        var sel = am.invoiceList.sel;
        var popupSel = am.sel.getCommonPopupSelectors();
        var updated = false;
        var msg = 'Error in Update the invoice.';
        var msgClassName = 'error';
        var queryObj = {
            aQuery: "UPDATE "+am.database.schema+".invoive_list SET invoice_no='"+data.invoiceNo+"', date='"+data.date+"', delear_name='"+data.dealerName+"', amount='"+data.amount+"', paid_amt='"+data.paidAmt+"', due_amt='"+data.dueAmt+"', payment_mode='"+data.paymentMode+"', items='"+data.itemList+"', description='"+data.desc+"', payment_data='"+data.paymentData+"' WHERE unique_no='"+data.unique_no+"'"
        }
        var callBackObj = am.core.getCallbackObject();
		var request = am.core.getRequestData('../php/executequery.php', queryObj, 'POST');
		callBackObj.bind('api_response', function(event, response){
            var data = JSON.parse(response);
            if(data[0].status == true){
                updated = true;
                msg = 'Invoice updated successfully!';
                msgClassName = 'success';
            }
            $(sel.msgContainer +' .msg-string').addClass(msgClassName);
            $(popupSel.bodyContainer).scrollTop(0);
            $(sel.msgContainer +' .msg-string').html(msg).fadeIn(500).delay(2000).fadeOut(1000);
            am.invoiceList.rerender = true;            
        });
        am.core.call(request, callBackObj);
    }
}

am.deleteInvoice = {
    showConfirmation: function(action){
        var msg, btnText, callback ;
        // if($('.anItemSelected').length >1)
        //     msg = 'Will move selected invoice\'s to Trash. Are you sure ?';
        // else
        switch(action){
            case 'trash':
                msg = 'Will move a selected invoice to Trash. Are you sure ?'
                btnText = 'Move to trash';
                callback = am.deleteInvoice.moveToTrash;
                break;
            case 'delete':
                msg = 'Will permenantly delete the selected invoice(s). Are you Sure?';
                btnText = 'Delete';
                callback = am.deleteInvoice.confirmDelete;
                break;
            case 'restore':
                msg = 'Will restore the selecte items. Are you sure?';
                btnText = 'Restore';
                callback = am.deleteInvoice.restore;
                break;
        }
        
        am.popup.init(
        {
            title: 'Confirmation',
            desc: msg,
            dismissBtnText: 'No',
            buttons: [btnText],
            callbacks: [callback]
        });
    },
    isValidSelection: function(action){
        var selectedItemsLength = $('.anItemSelected').length;
        var improperSelection = false, msg, btnText, callback;
        switch(action){
            case 'trash':
                var trashableItemsLength = $('.anItemSelected .open, .anItemSelected .closed').length;
                if(selectedItemsLength !== trashableItemsLength){
                    improperSelection = true;
                    msg = 'Please select only Trashable items. '
                    btnText = 'Ok';
                }
                break;
            case 'delete':
                var deleteableItemsLength = $('.anItemSelected .trashed').length;
                if(selectedItemsLength !== deleteableItemsLength){
                    improperSelection = true;
                    msg = 'Please select already trashed items to delete permenantly. '
                    btnText = 'Ok';
                }
                break;
            case 'restore':
                var restoreableItemsLength = $('.anItemSelected .trashed').length;
                if(selectedItemsLength !== restoreableItemsLength){
                    improperSelection = true;
                    msg = 'Please select already trashed items to restore. '
                    btnText = 'Ok';
                }
                break;
        }
        if(improperSelection){
            am.popup.init({
                title: '<b class="error">Warning</b>',
                desc: msg,
                dismissBtnText: btnText
            });
            return false;
        }
        return true;
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
				});
								
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
        var idLists = [];
        var selectedRows = $('.anItemSelected');
        _.each(selectedRows, function(aRow, index){
            var identifier = $(aRow).find('.invoiceNo').data('unique-no');
            idLists.push(identifier);
        });
		//var idLists = options.ids || [];
		if(idLists.length != 0){
			var obj = {};
                obj.multiQuery = 'true';
				obj.aQuery = 'SET SQL_SAFE_UPDATES = 0;';

				_.each(idLists, function(anId, index){
					obj.aQuery += 'DELETE FROM automobile.invoive_list WHERE unique_no = "'+anId+'";';
				});
				
				obj.aQuery += 'SET @num := 0;';
				obj.aQuery += 'UPDATE automobile.invoive_list SET sno = @num := (@num+1);';
				obj.aQuery += 'ALTER TABLE automobile.invoive_list AUTO_INCREMENT = 1;';

				obj.aQuery += 'SET SQL_SAFE_UPDATES = 1;';
				var callBackObj = am.core.getCallbackObject();
				var request = am.core.getRequestData('../php/executequery.php', obj , 'POST');
				callBackObj.bind('api_response', function(event, response){
					response = JSON.parse(response);
					if(response[0].status == true){
						am.popup.init({
							title: 'Success',
							desc: 'Selected invoice has been removed Successfully!',
							dismissBtnText: 'Ok',
                            onHiddenCallback: am.invoiceList.fetchTableData
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
	},
    restore: function(){
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
					obj.aQuery += 'UPDATE '+am.database.schema+'.invoive_list SET moved_to_trash = null WHERE unique_no="'+anId+'";';
				});
								
				obj.aQuery += 'SET SQL_SAFE_UPDATES = 1';
				var callBackObj = am.core.getCallbackObject();
				var request = am.core.getRequestData('../php/executequery.php', obj , 'POST');
				callBackObj.bind('api_response', function(event, response){
					response = JSON.parse(response);
					if(response[0].status == true){
						am.popup.init({
							title: 'Success',
							desc: 'Selected invoice has been RESTORED Successfully !',
							dismissBtnText: 'Ok',
                            onHiddenCallback: am.invoiceList.fetchTableData
						});
                    }else{
						am.popup.init({
							title: 'Error',
							desc: 'Error!, Selected invoice could not be RESTORED! ',
							dismissBtnText: 'Ok'
						});
					}
				});
				am.core.call(request, callBackObj);
		}
    }
}