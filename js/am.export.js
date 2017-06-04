if(typeof am == 'undefined'){
    var am = {};
}
am.export = {
	columnList: undefined,
	init: function(options){
		var $this = am.export;
		if(typeof options.columnList != undefined)
			$this.columnList = options.columnList;
		if(!_.isUndefined(options.tableSelector))
			$this.tableSelector = options.tableSelector;
		if(!_.isUndefined(options.dataEngine))
			$this.dataEngine = options.dataEngine;
		$this.showColumnList();
	},
	showColumnList: function(){
		var $this = am.export;
		var options = {};
		options.title= "Select columns...";
		options.body = _.template(template_htmlstr_exp_col_list, {columnList: am.export.columnList});
		options.buttons = ['Export'];
		options.onShownCallback = $this.bindExportPopupEvents;
		options.className = "exportPickColList"
		am.commonPopup.init(options);
	},
	bindExportPopupEvents: function(){
		var $this = am.export;
		$('#btn0Export').off().on('click', function(e){
			$this.filteredColList = [];
			_.each($('.commonModalBodyDiv input:checked'), function(aInput, index){
				$this.filteredColList.push($(aInput).val());
			});			
			am.commonPopup.hide();
			$this.exportFile();
		});
	},
	exportFile: function(){
		 am.spinner.show();
        setTimeout(function(){
               var content = am.export.getExportContent();
               am.export.doExport(content);
        }, 100);
	},
	isColumnExcluded: function(columnIndex){
		var $this = am.export, filteredColList = $this.filteredColList;
		columnIndex = columnIndex.toString();
		var isColumnExcluded = false;
		if(filteredColList.indexOf(columnIndex) == -1)
			isColumnExcluded = true;
		return isColumnExcluded;
	},
	getExportContent: function(){
		var $this = am.export, filteredColList = $this.filteredColList;
		var totalColumnCount = $this.columnList.length;
		var data= '';
		
		//table-column Header data
		data += 'S.No ,';
		for(col= 1; col <= totalColumnCount; col++){
			if($this.isColumnExcluded(col))
				continue;
			data += $this.columnList[col-1];
			data += ',';
		}
		data += '\n';

		//table-body row data
		if(!_.isUndefined($this.dataEngine))
			data += $this.dataEngine();
		else{		
			var rowLength = $($this.tableSelector+' tbody tr').length;
			for(i=0; i< rowLength; i++){
				var newRowData = true;
				data += i+1 + ',';
				debugger;
				for(j=1; j <= totalColumnCount; j++){
					var currentColIndex = j;
					if($this.isColumnExcluded(currentColIndex))
						continue;
					data += '"'+ $($this.tableSelector+' tbody tr:eq('+ i +') td:eq('+ j +')').text() + '"';
					data += ',';
				}
				data += '\n';
			}
		}
		return data;
	},

	doExport: function(data){
		var content = data;
 		var encodedUri = encodeURIComponent(content);
        var link = document.createElement("a");
        var filename = 'my_file';
        link.setAttribute("href", 'data:attachment/csv,' + encodedUri);
        link.setAttribute("download", filename+".csv");
        link.setAttribute("target","_blank");
        document.body.appendChild(link);
        link.click();
        am.spinner.hide();
	}
}


