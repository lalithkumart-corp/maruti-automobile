if(typeof am == 'undefined'){
    var am = {};
}
am.sel = (function(){
	var itemManager= {
		item_manager_main_container: '#item_manager_main_container',
		inputContainer: '#item_manager_main_container .inputContainer',
		addItem: '#item_manager_main_container .addItem',
		newItemNo: '#item_manager_main_container .newItemNo',
		newCompanyName: '#item_manager_main_container .newCompanyName',
		newItemName: '#item_manager_main_container .newItemName',
		newItemQuality: '#item_manager_main_container .itemQualityDropdown',
		newItemPrice: '#item_manager_main_container .newItemPrice',
		editItem: '#item_manager_main_container .edit-selected-item',
		deleteItem: '#item_manager_main_container .delete-selected-item',
		updatedItemNo: '#editItemPopup .updatedItemNo',
		updatedCompanyName: '#editItemPopup .updatedCompanyName',
		updatedItemName: '#editItemPopup .updatedItemName',
		updatedItemQuality: '#editItemPopup .itemQualityDropdown',
		updatedItemPrice: '#editItemPopup .updatedItemPrice',
		exportItemDetails: '#exportItemDetils',
		tableSection: '#item_manager_main_container .tableSection',
		anItemSelected: '.anItemSelected'
	}
	var addInvoice= {
		mainContainer: '#addInvoice-container',
		date: '#date',
		invoiceNo: '#addInvoice-container .invoiceNumber',
		dealerName: '#addInvoice-container .dealerName',
		actualAmt1 : '#addInvoice-container .actualAmt1',
		paidAmt: '#invoiceAmtDetails .paidAmt',
		actalAmt2: '#invoiceAmtDetails .actualAmt',
		dueAmt: '#invoiceAmtDetails .dueAmt',
		itemListTable: '#addInvoice-container .itemListTable',
		addDescriptionPanel: '#addDescriptionPanel',
		textBox: '#addDescriptionPanel textarea',
		paymentMode: '#addInvoice-container .paymentMode',
		paymentRow: '.paymentRow',
		addInvoiceToDB: '#addInvoice-container .submitBtnContainer .addInvoiceToDB',
		dealerHistoryContainer: '#dealerHistoryContainer',
		rightPane: '#addInvoice-container .rightPane',
		leftPane: '#addInvoice-container .leftPane',
		addPaymentIcon: '#invoiceAmtDetails .addPaymentIcon',
		deletePaymentIcon: '#invoiceAmtDetails .deletePaymentIcon',
		paymentContainer: '#invoiceAmtDetails .paymentContainer'
	}
	var invoiceList = {
		mainContainer: '#invoice_list_page',
		utilContainer: '#invoice_list_page .util-container',		
		tableContainer: '#invoice_list_page .invoice_list_table_container',
		table: '#invoice_list_page .invoice-list-table',
		tableInvoiceCell: '#invoice_list_page .invoice-list-table .invoiceNo',
		tableRow: '#invoice_list_page .invoice-list-table tbody tr',
		invoiceDescPopover: '.invoiceDescPopover',
		msgContainer: '.update-invoice-msg-container',
		trashBtnContainer: '#invoice_list_page .trash-btn-container',
		deleteBtnContainer: '#invoice_list_page .delete-btn-container',
		restoreBtnContainer: '#invoice_list_page .restore-btn-container',
		trashBtn: '#invoice_list_page .trash-selected-invoice',
		deleteBtn: '#invoice_list_page .delete-selected-invoice',
		restoreBtn: '#invoice_list_page .restore-selected-invoice'
	}
	var commonPopup = {
		bodyContainer: '#commonModalBodyDiv'
	}
	function getItemManagerSelectors(){
		return itemManager;
	}
	function getAddInvoiceSelectors(){
		return addInvoice;
	}
	function getInvoiceListSelectors(){
		return invoiceList;
	}
	function getCommonPopupSelectors(){
		return commonPopup;
	}
	return{
		getItemManagerSelectors : getItemManagerSelectors,
		getAddInvoiceSelectors: getAddInvoiceSelectors,
		getInvoiceListSelectors: getInvoiceListSelectors,
		getCommonPopupSelectors: getCommonPopupSelectors
	}
})();