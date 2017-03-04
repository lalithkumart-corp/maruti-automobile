if(typeof am == 'undefined'){
    var am = {};
}
am.commonPopup = {
	selectors: {
		overlay : '.commonModal_overlay',
		container: '.commonModalContainer',
		title: '#commonModalHeaderDiv',
		body: '#commonModalBodyDiv',
		footer: '.commonModalFooterDiv'
	},
	dismissButtonId: 'commonDismissButton',
	init: function(options){
		var $this = am.commonPopup;
		$this.className = options.className;
		$this.title = options.title;
		$this.body = options.body;
		$this.buttons = options.buttons || '';
		$this.callbacks = options.callbacks;
		$this.dismissBtnText = options.dismissBtnText || 'Cancel';
		$this.onHiddenCallback = options.onHiddenCallback || '';
		$this.onShownCallback = options.onShownCallback || '';
		$this.renderPopup();
	},
	renderPopup: function(){
		var $this = am.commonPopup;
		var property = {};
		var template = _.template(template_htmlstr_common_popup, property);
		$('body').append(template);
		$this.addTitle();
		$this.addDescription();
		$this.createButtons();		
		$this.addClassName();
		$this.show();
		$this.bindEvents();
	},
	addClassName: function(){
		var $this = am.commonPopup;
		if($this.className !== '')
			$($this.selectors.container).addClass($this.className);
	},
	addTitle: function(){
		var $this = am.commonPopup;
		if($this.enableHtml)
			$($this.selectors.title).html($this.title);
		else
			$($this.selectors.title).text($this.title);
	},
	addDescription: function(){
		var $this = am.commonPopup;
		$($this.selectors.body).html($this.body);
	},
	createButtons: function(){
		var $this = am.commonPopup;
		if(!_.isUndefined($this.buttons)){
			_.each($this.buttons, function(value, index){
				var aButtonHtml = '<input type="button" id="btn'+index+value+'" value= "'+value+'"/>'
				$($this.selectors.footer).append(aButtonHtml);
			});
		}

		//add default cancel button
		var dismissBtn = '<input type="button" id="'+$this.dismissButtonId+'" value="'+$this.dismissBtnText+'"/>';
		$($this.selectors.footer).append(dismissBtn);
	},
	show: function(){
		var $this = am.commonPopup;
		$($this.selectors.overlay).show();
		$($this.selectors.container).show();
		$this.onShown();
	},
	onShown: function(){
		var $this = am.commonPopup;
		if(!_.isUndefined($this.onShownCallback) && $this.onShownCallback !== ''){
			var callBackMeth = $this.onShownCallback;
			callBackMeth();
		}
	},
	bindEvents: function(){
		var $this = am.commonPopup;
		$('#'+this.dismissButtonId).off().on('click', function(){
			$this.hide();
		});
	},
	hide: function(){
		var $this = am.commonPopup;
		if($($this.selectors.container).length != -1){			
			$($this.selectors.container).remove();
			$($this.selectors.overlay).remove();
			$this.onHidden();
		}
	},
	onHidden: function(){
		var $this = am.commonPopup;
		if(!_.isUndefined($this.onHiddenCallback) && $this.onHiddenCallback !== ''){
			var callBackMeth = $this.onHiddenCallback;
			callBackMeth();
		}
	}
}