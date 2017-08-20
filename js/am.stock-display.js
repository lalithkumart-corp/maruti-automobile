var am = am || {};
am.stock = am.stock || {};

am.stock.view = (function(){
    var sel = {
        thisContainer: '.stock-display-main-container',
        tableOuterContainer: '.stock-display-main-container .stock-table-outer-container',
        table: '.stock-display-main-container .stock-table-container table'
    };

    function init(){
        fetchStockData();
    }

    function fetchStockData(){
        var callBackObj = am.core.getCallbackObject();            
        var request = am.core.getRequestData('../php/getstock.php', {} , 'GET');
        callBackObj.bind('api_response', function(event, response){
            response = JSON.parse(response);
            if(isValidResponse(response))               
                onFetchComplete(response.STOCK_BUCKET);                            
            else
                handleResponseError(response);
        });
        am.core.call(request, callBackObj);
    }

    function isValidResponse(response){
        var isValid = true;
        if(response.STATUS !== 'success')
            isValid = false;
        return isValid;
    }

    function handleResponseError(response){

    }

    function onFetchComplete(data){
       render(data);
       renderAsDatatable();
    }

    function render(data){
        var tableElm = _.template(template_stock_display_table_container, {stockData : data});
        $(sel.tableOuterContainer).html(tableElm);
    }

    function renderAsDatatable(){
         $(sel.table+ ' thead tr.filter-stock-table th').not(":eq(0), :eq(5)").each( function () {
        	var title = $(sel.table+ ' thead tr.filter-stock-table th').eq( $(this).index() ).text();
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
                        { "sWidth": "5%"},
                        { "sWidth": "15%"},
                        { "sWidth": "20%"},
                        { "sWidth": "20%"},
                        { "sWidth": "5%"},
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

    }

    function bindEvents(){

    }

    return {
        init: init
    }
})();