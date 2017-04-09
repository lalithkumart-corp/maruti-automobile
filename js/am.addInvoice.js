if(typeof am == 'undefined'){
    var am = {};
}
am.addinvoice = {
	sel: am.sel.getAddInvoiceSelectors(),
	init: function(){
		//am.addinvoice.fetchDefaults();
		$('#date').datepicker().datepicker("setDate", new Date());
		am.addinvoice.bindEvents();
	},
	bindEvents: function(){
		var self = am.addinvoice, sel = self.sel;
		
		$(sel.actualAmt1).off().on('keyup', function(e){
			self.doCalculation();
		});
		$(sel.paidAmt).off().on('keyup', function(e){
			self.doCalculation();
		});
		$(sel.addInvoiceToDB).off().on('click', function(e){
			self.submitInvoice();
		});
		$(sel.dealerName).off().on('blur', function(e){
			var dealerName = $(this).val().trim();
			self.checkHistory(dealerName);
		});
		$(sel.addPaymentIcon).off().on('click', function(){
			self.appendPaymentRow();
		});
		$(sel.deletePaymentIcon).off().on('click', function(){
			var identifier = $(this).data('identifier');
			self.deletePaymentRow(identifier);
		});

		self.table.bindEvents();	
	},
	table:{
		bindEvents: function(){
			var self = am.addinvoice;
			$('#addInvoice-container').off().on('keyup', '.itemListTable input', function(e){
				var key = e.which || e.keyCode;
			    if (key === 13) { // 13 is enter
			     	self.renderTable(this);
			    }			
			});
		}
	},
	doCalculation: function(){
		var self = am.addinvoice, sel = self.sel;
		var amount = $(sel.actualAmt1).val();
		$(sel.actalAmt2).text(amount);
		var givenAmt = 0;
		_.each($(sel.paidAmt), function(elm, inde){
			var price = $(elm).val();
			if(price !== "")
				givenAmt += parseInt(price);
		});
		var dueAmount = amount - givenAmt;
		$(sel.dueAmt).text(dueAmount);
	},
	renderTable: function(inputElm){
		var self = am.addinvoice, sel = self.sel, totalColumn = 5;
		var indexes= getRowColIndexes();
		var colNames = ['S.no', 'brand', 'itemName', 'quality', 'nos'];
		var isLastColumn = isLastColumn(indexes.col);
		var isEmptyRow = isEmptyRow(indexes);
		
		if(!isLastColumn){
			traverseToNextCell();
			return;
		}
		if(isLastColumn && !isEmptyRow){
			var options = {
				rowIndex: indexes.row + 1,
			}
			var aNewRow = getNewRowElm(options);
			appendRow(aNewRow, options);
		}else if(isLastColumn && isEmptyRow){ //delete row and set focus to other upNext outside table element
			deleteRow(indexes.row);
		}

		function getRowColIndexes(){
			var tt = $(inputElm).closest('td');
			var col = $(tt).parent().children().index($(tt));
			var row = $(tt).parent().parent().children().index($(tt).parent());			
			return{
				row: row,
				col: col
			}
		}
		function isLastColumn(col){
			var isLastColumn = false;
			if(col == totalColumn-1)
				isLastColumn = true;
			return isLastColumn;
		}
		//it will check whether the row has the data which we need. Here it checks for Item brand , item Name not be null
		function isEmptyRow(indexes){
			var isEmptyRow = false;
			var notFilledFully = false;
			var columns = $(sel.itemListTable+ ' tbody tr:eq('+ indexes.row +') td');
			var rowData = {};
			_.each(columns, function(value, index){
				if(index == 3){//to handle 'quality' checkbox
					rowData[colNames[index]] = $(value).find('input').is(':checked') ? 'Original' : 'Other';
				}
				else
					rowData[colNames[index]] = $(value).find('input').val().trim();
			});
			if(rowData.itemName == '')
				notFilledFully = true;
			
			isEmptyRow = notFilledFully;
			return isEmptyRow;
		}
		function getNewRowElm(options){
			var rowElm = '<tr>';
			rowElm += '<td><input type="text" value="'+ (options.rowIndex+1) +'" disabled/></td>';
			rowElm += '<td><input type="text" class=""/></td>';
			rowElm += '<td><input type="text" class=""/></td>';
			rowElm += '<td><input type="checkbox" checked/></td>';
			rowElm += '<td><input type="text"/></td>';
			rowElm += '</tr>';
			return rowElm;
		}
		function appendRow(rowElm, options){
			$(sel.itemListTable + ' tbody').append(rowElm);
			$(sel.itemListTable + ' tbody tr:eq('+ options.rowIndex +') td:eq(1) input').focus();
		}
		function deleteRow(row){
			if(row !== 0) //skip row delete for first row, since the user should able to add item later.For that he need row to add data
				$(sel.itemListTable + ' tbody tr:eq('+ row +')').remove();
			$(sel.paidAmt).focus();
		}
		function traverseToNextCell(){
				$(sel.itemListTable + ' tbody tr:eq('+ indexes.row +') td:eq('+ (indexes.col+1) +') input').focus();		
		}
	},
	submitInvoice: function(){
		var self = am.addinvoice;
		var data = self.getEntries();
		var callBackObj = am.core.getCallbackObject();
		var request = am.core.getRequestData('../php/addInvoice.php', data, 'POST');
		callBackObj.bind('api_response', function(event, response){
			var responseData = JSON.parse(response)[0];
			if(responseData.status == 'success'){                
				//self.updateLastSerialNumber();
				am.popup.init(
					{
						title: 'Success',
						desc: 'New Invoice has been created sccesfully ! ' ,
						dismissBtnText: 'OK',
						onHiddenCallback: function(){
										self.clearFields();
									}
					});          
			}else{
				am.popup.showMsg('<b class="error">Error</b>', responseData.status_msg, 'OK', 'bounce');
			}
		});
		am.core.call(request, callBackObj);
	},
	checkHistory: function(name){
		var self = am.addinvoice;
		var queryObj = {
			aQuery: 'select * from automobile.invoive_list where delear_name="'+name+'"'
		}
		var callBackObj = am.core.getCallbackObject();
		var request = am.core.getRequestData('../php/executequery.php', queryObj, 'POST');
		callBackObj.bind('api_response', function(event, response){
			response = JSON.parse(response);
			self.updateHistoryTable(response);
		});
		am.core.call(request, callBackObj);
	},
	updateHistoryTable: function(historyData){
		var self = am.addinvoice, sel = self.sel;
		var historyElm = _.template(template_htmlstr_invoice_history_panel, {data: historyData});
		$(sel.dealerHistoryContainer).html(historyElm);
	},
	getEntries: function(){
		var self = am.addinvoice, sel = self.sel;
		var data = {};
		//data.s_no = self.current_s_no;
		data.unique_no = $.now();
		data.date = $(sel.date).val();		
		data.invoiceNo = $(sel.invoiceNo).val().trim();
		data.dealerName = $(sel.dealerName).val().trim();
		data.amount = $(sel.actualAmt1).val().trim();		
		data.dueAmt = $(sel.dueAmt).text();
		data.paymentMode = $(sel.paymentMode).val();
		data.desc = $(sel.addDescriptionPanel + ' textarea').val().trim();

		//get Table Data
		var tableData = [];
		var rows = $(sel.itemListTable + ' tbody tr');
		var rowCount = rows.length;
		_.each(rows, function(aRow, index){
			var aRowData = [];
			var cols = $(aRow).find('td');
			_.each(cols, function(colData, subIndex){
				var cellData = '';
				if(subIndex == 0) //skip S.No 
					return true;
				if(subIndex == 3) //Handle checkbox value
					cellData = $(colData).find('input').is(':checked')? 'Original': 'Other';
				else
					cellData = $(colData).find('input').val().trim();
				aRowData.push(cellData);
			});
			aRowData = aRowData.join(':');
			tableData.push(aRowData);
		});
		tableData = tableData.join(',');

		data.itemList = tableData;

		//get payment data
		var paymentData = [];
		var total_paid_amt = 0;
		_.each($(sel.paymentRow), function(elm, index){
			var arr = [], price= 0, paymentMode, date;
			price = $(elm).find('.paidAmt').val();
			paymentMode = $(elm).find('.paymentMode').val();
			if($(elm).hasClass('initialPaymentRow'))
				date = $(sel.date).val();
			else
				date = $(elm).find('.hasDatepicker').val();
			arr.push(price);
			arr.push(paymentMode);
			arr.push(date);
			paymentData.push(arr.join(':'));

			//update total paid amt
			if(price != "")
				total_paid_amt += parseInt(price);
		});
		data.paymentData = paymentData.join(',');
		data.paidAmt = total_paid_amt || 0;
		return data;
	},
	fetchDefaults: function(){
		var self = am.addinvoice;
		var queryObj = {
			aQuery: 'select * from automobile.config'
		}
		var callBackObj = am.core.getCallbackObject();
		var request = am.core.getRequestData('../php/executequery.php', queryObj, 'POST');
		callBackObj.bind('api_response', function(event, response){
			response = JSON.parse(response);
			self.current_s_no = parseInt(response[0].last_invoice_table_s_no) + 1;
		});
		am.core.call(request, callBackObj);
	},
	updateLastSerialNumber: function(){
		var self = am.addinvoice;
		var queryObj = {
			aQuery: "UPDATE "+am.database.schema+".config SET last_invoice_table_s_no='"+self.current_s_no+"' WHERE s_no='1'"
		}
		var callBackObj = am.core.getCallbackObject();
		var request = am.core.getRequestData('../php/executequery.php', queryObj, 'POST');
		callBackObj.bind('api_response', function(event, response){
			response = JSON.parse(response);
			self.current_s_no = parseInt(self.current_s_no) + 1;
		});
		am.core.call(request, callBackObj);
	},
	clearFields: function(){
		var self = am.addinvoice, sel = self.sel;
		$(sel.invoiceNo).val('');
		$(sel.dealerName).val('');
		$(sel.actualAmt1).val('');
		$(sel.paidAmt).val('');
		$(sel.dueAmt).text('');
		$(sel.paymentMode);
		$(sel.addDescriptionPanel + ' textarea').val('Cash');
		var defaultRow = '<tr>';
			defaultRow += '<td><input type="text" value="1" disabled=""></td>';
			defaultRow += '<td><input type="text" class=""></td>';
			defaultRow += '<td><input type="text" class=""></td>';
			defaultRow += '<td><input type="checkbox" checked=""></td>';
			defaultRow += '<td><input type="text"></td>';
		defaultRow += '</tr>';
		$(sel.itemListTable + ' tbody').html(defaultRow);
		$(sel.invoiceNo).focus();
		$(sel.dealerHistoryContainer).html('');
	},
	appendPaymentRow: function(){
		var self = am.addinvoice, sel = self.sel;
		var identifier = $.now();
		var elem = _.template(template_addinvoice_payment_adder, {identifier : identifier});
		$(sel.paymentContainer).append(elem);
		$('#date'+identifier).datepicker().datepicker("setDate", new Date());
		$(sel.deletePaymentIcon).off().on('click', function(e){
			var identifier = $(this).data('identifier');
			self.deletePaymentRow(identifier);
		});
		$('.'+identifier+' input[type="number"]').on('keyup', function(e){
			self.doCalculation();
		});
	},
	deletePaymentRow: function(identifier){
		var self = am.addinvoice, sel = self.sel;
		$('.'+identifier).remove();
		self.doCalculation();
	}
}