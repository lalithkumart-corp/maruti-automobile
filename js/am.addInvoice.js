if(typeof am == 'undefined'){
    var am = {};
}
am.addinvoice = {
	sel: {
		actualAmt1 : '#addInvoice-container .actualAmt1',
		paidAmt: '#invoiceAmtDetails .paidAmt',
		actalAmt2: '#invoiceAmtDetails .actualAmt',
		dueAmt: '#invoiceAmtDetails .dueAmt'
	},
	init: function(){
		am.addinvoice.bindEvents();
	},
	bindEvents: function(){
		var self = am.addinvoice, sel = self.sel;
		$('#date').datepicker().datepicker("setDate", new Date());
		$(sel.actualAmt1).on('keyup', function(e){
			self.doCalculation();
		});
		$(sel.paidAmt).on('keyup', function(e){
			self.doCalculation();
		});
		self.table.bindEvents();	
	},
	table:{
		bindEvents: function(){
			$(document).on('keyup', '.itemListTable input', function(e){
				var key = e.which || e.keyCode;
			    if (key === 13) { // 13 is enter
			     self.renderTable();
			    }			
			});
		}
	},
	doCalculation: function(){
		var self = am.addinvoice, sel = self.sel;
		var amount = $(sel.actualAmt1).val();
		$(sel.actalAmt2).text(amount);
		var givenAmt = $(sel.paidAmt).val();
		var dueAmount = amount - givenAmt;
		$(sel.dueAmt).text(dueAmount);
	},
	renderTable: function(){

	},
}