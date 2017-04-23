if(typeof am == 'undefined'){
    var am = {};
}
am.popup = {
	selectors: {
		overlay : '.msgModal_overlay',
		container: '.msgModalContainer',
		title: '#msgHeaderText',
		msgBody: '#msgBodyText'
	},
	defaults: {
		text 	: '',
		header 	: ''
	},
	dismissButtonId: 'msgDismissButton',
	enableHtml: true,
	init: function(options){
		var $popup = am.popup;
		if(_.isUndefined(options))
			var options = {};
		$popup.hide();
		$popup.msgDescription = options.desc || '';
		$popup.msgHeader = options.title || '';
		$popup.buttons = options.buttons || '';
		$popup.callbacks = options.callbacks;
		$popup.onHiddenCallback = options.onHiddenCallback || '';
		$popup.onShownCallback = options.onShownCallback || '';
		$popup.dismissBtnText = options.dismissBtnText || 'Cancel';
		$popup.enableHtml = !_.isUndefined(options.enableHtml)?options.enableHtml:true;
		$popup.animationObj.init(options);	
		$popup.renderPopup();
	},
	renderPopup: function(){
		var $popup = am.popup;
		var property = {};
		var template = _.template(template_htmlstr_msgBox, property);
		$('body').append(template);
		$popup.addTitle();
		$popup.addDescription();
		$popup.createButtons();		
		$popup.show();
		$popup.bindEvents();
	},
	addTitle: function(){
		var $popup = am.popup;
		if($popup.enableHtml)
			$($popup.selectors.title).html($popup.msgHeader);
		else
			$($popup.selectors.title).text($popup.msgHeader);
	},
	addDescription: function(){
		var $popup = am.popup;
		if($popup.enableHtml)
			$($popup.selectors.msgBody).html($popup.msgDescription);
		else
			$($popup.selectors.msgBody).text($popup.msgDescription);
	},
	createButtons: function(){
		var $popup = am.popup;
		if(!_.isUndefined($popup.buttons)){
			_.each($popup.buttons, function(value, index){
				var trimmedVal = value.replace(/\s/g,'');
				var aButtonHtml = '<input type="button" id="btn'+index+trimmedVal+'" value= "'+value+'"/>'
				$('#msgFooterDiv').append(aButtonHtml);
			});
		}

		//add default cancel button
		var dismissBtn = '<input type="button" id="'+$popup.dismissButtonId+'" value="'+$popup.dismissBtnText+'"/>';
		$('#msgFooterDiv').append(dismissBtn);
	},
	bindEvents: function(){
		var $popup = am.popup;
		if(!_.isUndefined($popup.buttons)){
			_.each($popup.buttons, function(value, index){
				var trimmedVal = value.replace(/\s/g,'');
				$('#btn'+index+trimmedVal).on('click', function(event){
					var callBackMeth = $popup.callbacks[index];
					if(!_.isUndefined(callBackMeth))
						callBackMeth();
				});
			});
		}
		

		$('#'+this.dismissButtonId).off().on('click', function(){
			$popup.hide();
		});
	},
	show: function(callback){
		var $popup = am.popup;
		$($popup.selectors.overlay).show();
		$($popup.selectors.container).show();
		$popup.animationObj.showAnimation();
		$popup.onShown();
	},
	onShown: function(){
		var $popup = am.popup;
		$popup.setBtnFocus();
		if(!_.isUndefined($popup.onShownCallback) && $popup.onShownCallback !== ''){
			var callBackMeth = $popup.onShownCallback;
			callBackMeth();
		}
	},
	setBtnFocus: function(){
		var $popup = am.popup;
		$('#msgFooterDiv input')[0].focus();
	},
	hide: function(){
		var $popup = am.popup;
		if($($popup.selectors.container).length != -1){			
			$($popup.selectors.container).remove();
			$($popup.selectors.overlay).remove();
			$popup.onHidden();
			$popup.clearObjects();
		}
	},
	onHidden: function(){
		var $popup = am.popup;
		if(!_.isUndefined($popup.onHiddenCallback) && $popup.onHiddenCallback !== ''){
			var callBackMeth = $popup.onHiddenCallback;
			callBackMeth();
		}
	},
	clearObjects: function(){
		var $popup = am.popup;
		$popup.msgDescription = '';
		$popup.msgHeader = '';
		$popup.buttons = '';
		$popup.callbacks = [];
		$popup.onHiddenCallback = '';
		$popup.onShownCallback = '';
		$popup.dismissBtnText = 'Cancel';
		$popup.enableHtml = true;
		$popup.animationObj.effect = '';
	},
	animationObj: {
		effect: '',
		init: function(options){
			var $animation = am.popup.animationObj;
			if(!_.isUndefined(options.animate))
				$animation.effect = options.animate;
		},
		showAnimation: function(){
			var $animation = am.popup.animationObj;
			switch($animation.effect){
				case 'bounce':
					$animation.bounce();
					break;
				case 'blinkingIn':
					$animation.blinkingIn();
					break;
				case 'blinkingOut':
					$animation.blinkingOut();
					break;
			}
		},
		bounce: function(){
			$(am.popup.selectors.container).fadeIn(100).animate({top:"-=20px"},100).animate({top:"+=20px"},100).animate({top:"-=20px"},100).animate({top:"+=20px"},100).animate({top:"-=20px"},100).animate({top:"+=20px"},100);
		},
		blinkingIn: function(){
			$(am.popup.selectors.container).fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
		},
		blinkingOut: function(){
			$(am.popup.selectors.container).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100);
		}
	},

	//short and quick method to just show a msg
	showMsg: function(title, description, btnText, animate){
		var $popup = am.popup;
		$popup.hide();
		$popup.msgDescription = description;
		$popup.msgHeader = title;
		$popup.dismissBtnText = btnText;
		$popup.animationObj.effect = animate || '';
		$popup.renderPopup();
	}
}