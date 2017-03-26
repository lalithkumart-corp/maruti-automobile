if(typeof am == 'undefined'){
    var am = {};
}
am.itemManager = {
	selectors:am.sel.getItemManagerSelectors(),
	init: function(){		       
		am.itemManager.getItemList();
		am.itemManager.export.init();		
	},
	bindEvents: function(){
		var $itemManager = am.itemManager, sel = $itemManager.selectors;
		$(sel.addItem).off().on('click', function(e){
			$itemManager.addNewItem();
		});
		$(sel.addItem).on('keydown', function(e){
			if (event.which == 13)
				$itemManager.addNewItem();			
		});
		$(sel.editItem).off().on('click', function(e){
			if($(this).hasClass('disabled'))
				return;			
			$itemManager.editDialogBox.open();
		});
		$(sel.deleteItem).off().on('click', function(e){
			if($(this).hasClass('disabled'))
				return;
			$itemManager.deleteItem.showConfirmation();
		});
		$(sel.newItemQuality).on('change', function(e){
			var val = $(this).val(), classNm = 'otherItem';
			if(val == 0)
				classNm = 'originalItem';
			
			$(this).removeClass('originalItem');
			$(this).removeClass('otherItem');
			$(this).addClass(classNm);
		});
		$itemManager.bindTraverseEvents();
	},
	bindTraverseEvents: function(){
		var $itemManager = am.itemManager, sel = $itemManager.selectors;
		$(sel.inputContainer).on('keydown', 'input, select', function(event){
            var $this = $(event.target);
            if (event.which == 13) {
                event.preventDefault();
                var dataIndex = $this.attr('data-index');
                if(typeof dataIndex != 'undefined'){
                    var index = parseFloat(dataIndex);
                    $('[data-index="' + (index + 1).toString() + '"]').focus();
                }
            }
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
			am.autocompleter.itemManager.init();		
		});
		am.core.call(request, callBackObj);
	},
	renderTableData: function(){
		var $itemManager = am.itemManager, sel = $itemManager.selectors;
		if($(sel.tableSection).length){
			$(sel.tableSection).remove();
		}
		var template = _.template(template_htmlstr_item_manager_table, {itemData: $itemManager.rawItemData});
		$(sel.item_manager_main_container).append(template);
		$itemManager.asDataTable();
	},
	asDataTable: function(){
		var $itemManager = am.itemManager, sel = am.sel.getItemManagerSelectors();
		$('#item_manager_table thead tr#filterData th').not(":eq(0), :eq(4)").each( function () {
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
                      { "sWidth": "30%"},
                      { "sWidth": "2%"},
                      { "sWidth": "10%"}
                    ]
        	});
        $itemManager.table = table;

        $('#item_manager_table tbody tr').on( 'click', function () {
			if($(this).hasClass('anItemSelected')){
        		$(this).removeClass('anItemSelected');				
        	}else{
	            $(this).addClass('anItemSelected');
	        }
			if($('.anItemSelected').length == 0)
				$('.edit-selected-item, .delete-selected-item').addClass('disabled');				
			else{
				$('.edit-selected-item, .delete-selected-item').removeClass('disabled');
				if($(sel.anItemSelected).length > 1)
					$('.edit-selected-item').addClass('disabled');
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
		params.company = $(sel.newCompanyName).val().trim();
		params.itemName = $(sel.newItemName).val().trim();
		params.itemQuality = $(sel.newItemQuality).val();
		params.price = $(sel.newItemPrice).val().trim();

		if(params.itemQuality == '0')
			params.itemQuality = 'original';
		else
			params.itemQuality = 'other';

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
					dismissBtnText: 'OK',
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
			obj.aQuery= 'INSERT into '+am.database.schema+'.item_lists (my_unique_id, item_no, item_brand, item_name, item_quality, item_price) VALUES ("'+$.now()+'", "'+params.itemNo+'", "'+params.company+'", "'+params.itemName+'", "'+params.itemQuality+'", "'+params.price+'")';
			var callBackObj = am.core.getCallbackObject();
			var request = am.core.getRequestData('../php/executequery.php', obj , 'POST');
			callBackObj.bind('api_response', function(event, response){
	        	response = JSON.parse(response);
	            if(response[0].status == true){
	                am.popup.init({
		               	title: 'Success',
		   				desc: 'The item <b>'+ params.itemName+'</b> has been inserted Successfully !',
		   				dismissBtnText: 'Ok',
		   				onHiddenCallback: $itemManager.setFocus
		            });
		            $itemManager.getItemList();
					$itemManager.clearEntries();	
	            }else{
	            	am.popup.init({
		               	title: 'Error',
		   				desc: 'The Ornament <b>'+ params.itemName+'</b> could not be Added into item list !',
		   				dismissBtnText: 'Ok',
		   				onHiddenCallback: $itemManager.setFocus
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

			if(condition1 && condition3 && condition4 && condition5 && condition6){
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
    setFocus: function(selector){
    	var $itemManager = am.itemManager, sel = $itemManager.selectors;
    	if(selector == undefined || selector == null || selector == '')
    		selector = sel.newItemNo;
		debugger;
		am.utils.setFocus(selector);
	},
    editDialogBox:{
    	bindEvents: function(){
    		var $itemManager = am.itemManager;
    		$('#btn0Update').off().on('click', function(e){
				$itemManager.editDialogBox.update();
			})
    	},
    	open: function(){
    		var $itemManager = am.itemManager;
    		var params = {};
    		params.myUniqueId = $('.anItemSelected').attr('id');
    		params.itemNumber = $('.anItemSelected td:eq(1)').text();
    		params.company = $('.anItemSelected td:eq(2)').text();
    		params.itemName = $('.anItemSelected td:eq(3)').text();
    			var temp = $('.anItemSelected td:eq(4)').text();
    			if(temp == 'original')
    				params.quality = "0";
    			else
    				params.quality = "1";
    		
    			var temp = $('.anItemSelected td:eq(5)').text();
    			params.price = temp.replace(/Rs: /g,'');
    		var options = {};
    		options.title= "Edit item Details...";
    		options.body = _.template(template_htmlstr_item_manager_edit, {anItem: params});
    		options.buttons = ['Update'];
    		options.className = "editItemDetailsPopup";
    		options.onShownCallback = $itemManager.editDialogBox.bindEvents;
    		options.dismissBtnText = 'Close';
    		am.commonPopup.init(options);
    	},
    	update: function(){
    		var $itemManager = am.itemManager, sel = $itemManager.selectors;
			var quality;
	    	var myUniqueId = $(sel.updatedItemNo).attr('id');
	    	var itemNo = $(sel.updatedItemNo).val().trim();
	    	var companyName = $(sel.updatedCompanyName).val().trim();
	    	var itemName = $(sel.updatedItemName).val().trim();
	    	var itemQlty = $(sel.updatedItemQuality).val();
	    		if(itemQlty == "0")
	    			quality = 'original';
	    		else
	    			quality = 'other';
	    	var price = $(sel.updatedItemPrice).val().trim();

	    	var obj = {};
	        obj.aQuery= 'UPDATE '+am.database.schema+'.item_lists SET item_no = "'+itemNo+'", item_brand = "'+companyName+'", item_name = "'+itemName+'", item_quality = "'+quality+'", item_price = "'+price+'" WHERE my_unique_id = "'+myUniqueId+'"';
	   	
			var callBackObj = am.core.getCallbackObject();
			var request = am.core.getRequestData('../php/executequery.php', obj , 'POST');
			callBackObj.bind('api_response', function(event, response){
	        	response = JSON.parse(response);
	            if(response[0].status == true){
	                $('#editItemPopup .msgBox').addClass('success').html('Saved Successfully !').fadeIn(500).delay(5000).fadeOut(1000);
		            $itemManager.getItemList();		
	            }else{
	            	$('#editItemPopup .msgBox').addClass('error').html('Unable to Save !').fadeIn(500).delay(5000).fadeOut(1000);
	            }
			});
			am.core.call(request, callBackObj);
    	}
    },
    deleteItem: {
    	showConfirmation: function(){
			var msg ;
			if($('.anItemSelected').length >1)
				msg = 'Are you sure to delete Multiple items ?';
			else
				msg = 'Are you sure to delete <b>'+ $('.anItemSelected td:eq(2)').text() + ' '+ $('.anItemSelected td:eq(3)').text() +'</b> item details ?'
    		 am.popup.init(
                {
                 title: 'Confirmation',
                 desc: msg,
                 dismissBtnText: 'No',
                 buttons: ['Delete'],
                 callbacks: [am.itemManager.deleteItem.confirmDelete]
                });
    	},
    	confirmDelete: function(){
    		var $itemManager = am.itemManager, sel = $itemManager.selectors;
			var msgPrefix;
			var selectedItems = $(sel.anItemSelected).length;
			if(selectedItems > 1){
				var obj = {};
				obj.aQuery = 'SET SQL_SAFE_UPDATES = 0;';
				_.each($('.anItemSelected'), function(elm, index){
					var uniqueId = $(elm).attr('id');
					obj.aQuery += "DELETE FROM "+am.database.schema+".item_lists WHERE my_unique_id = '"+uniqueId+"';";
				})
				obj.aQuery += 'SET SQL_SAFE_UPDATES = 1;';
				obj.multiQuery = 'true';
				msgPrefix = 'All selected items';
			}else{
				var my_unique_id = $('.anItemSelected').attr('id');
				var companyName = $('.anItemSelected td:eq(2)').text();
				var itemName = $('.anItemSelected td:eq(3)').text();
				msgPrefix = 'The item <b>'+ companyName +' '+ itemName +'</b>';
				var obj = {};
				obj.aQuery= 'DELETE FROM '+am.database.schema+'.item_lists WHERE my_unique_id = "'+ my_unique_id +'"';
			}
			    		
        	var callBackObj = am.core.getCallbackObject();
			var request = am.core.getRequestData('../php/executequery.php', obj , 'POST');
			callBackObj.bind('api_response', function(event, response){
	        	response = JSON.parse(response);
	        	if(response[0].status == true){
	                am.popup.init({
		               	title: 'Success',
		   				desc: msgPrefix+' has been removed Successfully !',
		   				dismissBtnText: 'Ok'
		            });
					setTimeout(function(e){
						$itemManager.getItemList();
					},1000);		            
	            }else{
	            	am.popup.init({
		               	title: 'Error',
		   				desc: msgPrefix+' could not be removed !',
		   				dismissBtnText: 'Ok'
		            });
	            }
	        });
	        am.core.call(request, callBackObj);
    	}
    },
	export:{
		init: function(){
			this.bindExport();
		},
		bindExport: function(){
			var $itemManager = am.itemManager, sel = am.sel.getItemManagerSelectors();
			$(sel.exportItemDetails).on('click', function(e){
				var options = {
					columnList:['Item No', 'Company', 'Item Name', 'Quality', 'Price']
				}
				am.export.init(options);
			});
		}
	},
	clearEntries: function(){
		var $itemManager = am.itemManager, sel = $itemManager.selectors;
		$(sel.newItemNo).val('');
		$(sel.newCompanyName).val('');
		$(sel.newItemName).val('');
		$(sel.newItemPrice).val('');
	}
}