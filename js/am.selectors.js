if(typeof am == 'undefined'){
    var am = {};
}
am.sel = (function(){
	var itemManager= {
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
		updatedItemQuality: '#editItemPopup .updatedItemQuality',
		updatedItemPrice: '#editItemPopup .updatedItemPrice',
		exportItemDetails: '#exportItemDetils'
	}
	var addInvoice= {
		date: '#date',
		invoiceNo: '#addInvoice-container .invoiceNumber',
		dealerName: '#addInvoice-container .dealerName',
		actualAmt1 : '#addInvoice-container .actualAmt1',
		paidAmt: '#invoiceAmtDetails .paidAmt',
		actalAmt2: '#invoiceAmtDetails .actualAmt',
		dueAmt: '#invoiceAmtDetails .dueAmt',
		itemListTable: '#addInvoice-container .itemListTable',
		addDescriptionPanel: '#addDescriptionPanel',
		paymentMode: '#addInvoice-container .paymentMode',
		addInvoiceToDB: '#addInvoice-container .submitBtnContainer '
	}
	function getItemManagerSelectors(){
		return itemManager;
	}
	function getAddInvoiceSelectors(){
		return addInvoice;
	}
	return{
		getItemManagerSelectors : getItemManagerSelectors,
		getAddInvoiceSelectors: getAddInvoiceSelectors
	}
})();