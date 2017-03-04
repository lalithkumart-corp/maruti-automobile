if(typeof am == 'undefined'){
    var am = {};
}
am.itemManager = {
	selectors:{
		addItem: '#item_manager_main_container .addItem',
		newItemNo: '#item_manager_main_container .newItemNo',
		newPartNo: '#item_manager_main_container .newPartNo',
		newCompanyName: '#item_manager_main_container .newCompanyName',
		newItemName: '#item_manager_main_container .newItemName',
		newItemQuality: '#item_manager_main_container .newItemQuality',
		newItemPrice: '#item_manager_main_container .newItemPrice',
		editItem: '#item_manager_main_container .edit-selected-item',
		deleteItem: '#item_manager_main_container .delete-selected-item'
	},
	init: function(){
		am.itemManager.getItemList();		
	},
	bindEvents: function(){
		var $itemManager = am.itemManager, sel = $itemManager.selectors;
		$(sel.addItem).off().on('click', function(e){
			$itemManager.addNewItem();
		});
		$(sel.editItem).off().on('click', function(e){
			if($(this).hasClass('disabled'))
				return;
			$itemManager.openEditDialogBox();
		});
		$(sel.deleteItem).off().on('click', function(e){
			if($(this).hasClass('disabled'))
				return;
		});
	},
	getItemList: function(){
		var $itemManager = am.itemManager;
		var obj = {};
		obj.aQuery= "SELECT * FROM "+am.database.schema+".item_lists";
		var callBackObj = am.core.getCallbackObject();
		var request = am.core.getRequestData('../php/executequery.php', obj , 'POST');
		callBackObj.bind('api_response', function(event, response){
			$itemManager.rawItemData = JSON.parse(response);
			$itemManager.renderTableData();				
		});
		am.core.call(request, callBackObj);
	},
	renderTableData: function(){
		var $itemManager = am.itemManager;
		var template = _.template(template_htmlstr_item_manager, {itemData: $itemManager.rawItemData});
		$('.mainContent').html(template);
		$itemManager.asDataTable();
	},
	asDataTable: function(){
		var $itemManager = am.itemManager;
		$('#item_manager_table thead tr#filterData th').not(":eq(0), :eq(5)").each( function () {
        	var title = $('#item_manager_table thead tr#filterData th').eq( $(this).index() ).text();
        	var className = title.replace(/\./g, '');
        	className = className.replace(/\s/g, '');
        	$(this).html( '<input type="text" class="'+className+' filterInput" onclick="event.stopPropagation();" placeholder="'+title+'" />' );
    	});
    	$("#item_manager_table thead input[type='text']").on( 'keyup change', function () {
	        table
	            .column( $(this).parent().index()+':visible' )
	            .search( this.value )
	            .draw();
	    });

		var table = $("#item_manager_table").on( 'init.dt', function () {
               $itemManager.tableComplete();
            }).DataTable({
                paging: false,
                scrollY: 400,
                scrollCollapse: true,
                     aoColumns : [
                      { "sWidth": "4%"},
                      { "sWidth": "10%"},
                      { "sWidth": "10%"},
                      { "sWidth": "10%"},
                      { "sWidth": "34%"},
                      { "sWidth": "2%"},
                      { "sWidth": "10%"}
                    ]
        	});
        $itemManager.table = table;

        $('#item_manager_table tbody tr').on( 'click', function () {
        	if($(this).hasClass('anItemSelected')){
        		$(this).removeClass('anItemSelected');
        		$('.edit-selected-item, .delete-selected-item').addClass('disabled');
        	}else{
	            $('#item_manager_table tbody .anItemSelected').removeClass('anItemSelected');
	            $(this).addClass('anItemSelected');
	            $('.edit-selected-item, .delete-selected-item').removeClass('disabled');
	            $('#btn0OK').prop('disabled', false);
	        }
        });
	},
	tableComplete: function(){
		var $itemManager = am.itemManager;
		if(typeof $itemManager.table != 'undefined' && !_.isEmpty($itemManager.table)){
            $itemManager.table.draw();
            am.itemManager.bindEvents();
        }else{
            setTimeout(function(){
                $itemManager.tableComplete();
            },200);
        }
	},
	addNewItem: function(){
		var $itemManager = am.itemManager, sel = $itemManager.selectors;
		var params = {};
		params.itemNo = $(sel.newItemNo).val().trim();
		params.partNo = $(sel.newPartNo).val().trim();
		params.company = $(sel.newCompanyName).val().trim();
		params.itemName = $(sel.newItemName).val().trim();
		params.itemQuality = $(sel.newItemQuality).is(':checked');
		params.price = $(sel.newItemPrice).val().trim();

		if(params.itemQuality == true)
			params.itemQuality = 'original';
		else
			params.itemQuality = 'local';

		if(_.isEmpty(params.itemName) || _.isEmpty(params.price)){
			am.popup.init({
		           	title: 'Alert',
					desc: 'Please Enter item Name & price',
					dismissBtnText: 'OK'
		        });
		}else if($itemManager.isItemAlreadyExists(params)){
			am.popup.init({
		           	title: 'Already Exists !',
					desc: 'The item already exists. Give unique item details ! ',
					dismissBtnText: 'OK'
		        });
		}else{
			am.popup.init({
		           	title: 'Confirmation',
					desc: 'Do you really want to add this item detail ? ',
					buttons: ['Yes'],
					callbacks: [addIntoDB],
					dismissBtnText: 'No'
		        });			
		}
		function addIntoDB(){
			var obj = {};
			obj.aQuery= "SELECT * FROM "+am.database.schema+".item_lists";
			obj.aQuery= 'INSERT into '+am.database.schema+'.item_lists (my_unique_id, part_no, item_no, item_brand, item_name, item_quality, item_price) VALUES ("'+$.now()+'", "'+params.partNo+'", "'+params.itemNo+'", "'+params.company+'", "'+params.itemName+'", "'+params.itemQuality+'", "'+params.price+'")';
			var callBackObj = am.core.getCallbackObject();
			var request = am.core.getRequestData('../php/executequery.php', obj , 'POST');
			callBackObj.bind('api_response', function(event, response){
	        	response = JSON.parse(response);
	            if(response[0].status == true){
	                am.popup.init({
		               	title: 'Success',
		   				desc: 'The item <b>'+ params.itemName+'</b> has been inserted Successfully !',
		   				dismissBtnText: 'Ok'
		            });
		            $itemManager.getItemList();		
	            }else{
	            	am.popup.init({
		               	title: 'Error',
		   				desc: 'The Ornament <b>'+ params.itemName+'</b> could not be Added into item list !',
		   				dismissBtnText: 'Ok'
		            });
	            }
	            //am.spinner.hide();						
			});
			am.core.call(request, callBackObj);
		}
	},
	isItemAlreadyExists: function(params){
		var alreadyExists = false;
		_.each(am.itemManager.rawItemData, function(anItem, index){
			if(anItem.item_no.toLowerCase() == params.itemNo.toLowerCase())
				condition1 = true;
			else
				condition1 = false;

			if(anItem.part_no.toLowerCase() == params.partNo.toLowerCase())
				condition2 = true;
			else
				condition2 = false;

			if(anItem.item_brand.toLowerCase() == params.company.toLowerCase())
				condition3 = true;
			else
				condition3 = false;

			if(anItem.item_name.toLowerCase() == params.itemName.toLowerCase())
				condition4 = true;
			else
				condition4 = false;
			
			if(anItem.item_quality.toLowerCase() == params.itemQuality.toLowerCase())
				condition5 = true;
			else
				condition5 = false;

			if(anItem.item_price.toLowerCase() == params.price.toLowerCase())
				condition6 = true;
			else
				condition6 = false;

			if(condition1 && condition2 && condition3 && condition4 && condition5 && condition6){
				alreadyExists = true;
				return alreadyExists;
			}
		});		
		return alreadyExists;
	},
	getCurrencyFormat: function(currencyValue){
		var formatted = am.itemManager.commaSeparateNumber(currencyValue);
        return 'Rs: '+ formatted;
    },
	commaSeparateNumber: function(val){
        while (/(\d+)(\d{3})/.test(val.toString())){
          val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
        }
        return val;
    },
    openEditDialogBox: function(){
    	var params = {};
    	params.itemNumber = $('.anItemSelected td:eq(1)').text();
    	params.partNumber = $('.anItemSelected td:eq(2)').text();
    	params.company = $('.anItemSelected td:eq(3)').text();
    	params.itemName = $('.anItemSelected td:eq(4)').text();
    		var temp = $('.anItemSelected td:eq(5)').text();
    		if(temp == 'original')
    			params.quality = true;
    		else
    			params.quality = false;
   
    		var temp = $('.anItemSelected td:eq(6)').text();
    		params.price = temp.replace(/Rs: /g,'');
    	var options = {};
    	options.title= "Edit item Details...";
    	options.body = _.template(template_htmlstr_item_manager_edit, {anItem: params});
    	options.buttons = ['OK'];
    	options.className = "editItemDetailsPopup"
    	am.commonPopup.init(options);
    }
}