if(typeof gs == 'undefined'){
    var gs = {};
}
gs.spinner = {
	show : function(container, className){
		//Handle Empty values and undefined type
		if(container == "" || typeof container == "undefined")
			container = "body";
		if(className == "" || typeof className == "undefined")
			className = '';
		
		//create Dom template and append to the container.
		var overlay = '<div class="spinner_overlay '+ className +'"></div>';
		$(container).append(overlay);
		//var spinner = '<div class="spinner-label '+ className +'"> <p class="spinner-loading-msg">Loading...</p> <img class="spinner-label-image" src="/images/action-loading.gif"> </div>'
		var spinner = '<div class="spinner-label '+ className +'"> <p class="spinner-loading-msg">Loading...</p> <div class="cp-spinner cp-hue"></div> </div>'		
		$(container).append(spinner);
		
		if(className != ""){
			var overlaySelector = '.spinner_overlay.'+className;
			var spinnerSelector = '.spinner-label.'+ className;
		}else{
			var overlaySelector = '.spinner_overlay';
			var spinnerSelector = '.spinner-label';
		}
		//Adjust css with respect to container
		if(container == 'body'){
			$(overlaySelector).css('position','fixed');
			$(spinnerSelector).css('position','fixed');
			$("body").css({ height: "100%", overflow: "hidden"});
		}else{
			$(overlaySelector).css('z-index','1000');
			$(spinnerSelector).css('z-index','1001');
		}

		//Show the Modal background and Spinner.
		$(".spinner_overlay").show();
		$(".spinner-label").show();
	},
	hide : function(container, className){
		//Handle Empty values and undefined type
		if(container == "" || typeof container == "undefined")
			container = "body";

		if(className == "" || typeof className == "undefined")
			className = '';
		else
			className = "."+className;

		//Remove the Modal background and Spinner
		$(container + " .spinner_overlay"+ className ).remove();
		$(container + " .spinner-label"+ className ).remove();
		
		//Re-Adjust the css.
		if(container == 'body')
			$("body").css({ height: "", overflow: ""});
	}
}