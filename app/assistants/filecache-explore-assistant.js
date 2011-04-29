function FilecacheExploreAssistant()
{
	// setup menu
	this.menuModel = {
		visible: true,
		items:
		[
	{
		label: $L("Preferences"),
		command: 'do-prefs'
	},
	{
		label: $L("Help"),
		command: 'do-help'
	}
		 ]
	};
	
	this.filecacheKindsModel = {
		value: '',
		choices: [],
		disabled: true
	};

	this.typeId = '';
	
	this.showButtonModel = {
		label: $L("Show"),
		disabled: true
	};
};

FilecacheExploreAssistant.prototype.setup = function()
{
	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	// get elements
	this.iconElement =			this.controller.get('icon');
	this.filecacheKindElement =	this.controller.get('filecacheKind');
	this.showButton =			this.controller.get('showButton');
	
	// setup handlers
	this.iconTapHandler = this.iconTap.bindAsEventListener(this);
	this.filecacheKindsHandler = 		this.filecacheKinds.bindAsEventListener(this);
	this.filecacheKindHandler = 		this.filecacheKind.bindAsEventListener(this);
	this.filecacheKindChangedHandler =	this.filecacheKindChanged.bindAsEventListener(this);
	this.showTapHandler = 				this.showTap.bindAsEventListener(this);
	
	// setup widgets
	this.controller.listen(this.iconElement,  Mojo.Event.tap, this.iconTapHandler);
	this.controller.setupWidget('filecacheKind', { multiline: true }, this.filecacheKindsModel);
	this.controller.listen(this.filecacheKindElement, Mojo.Event.propertyChange, this.filecacheKindChangedHandler);
	this.controller.setupWidget('showButton', { }, this.showButtonModel);
	this.controller.listen(this.showButton,  Mojo.Event.tap, this.showTapHandler);
	
	// initialise the list
	this.request = ImpostahService.impersonate(this.filecacheKindsHandler, "com.palm.filecache",
											   "com.palm.filecache", "GetCacheTypes", { });
};

FilecacheExploreAssistant.prototype.filecacheKinds = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (filecacheKinds):</b><br>'+payload.errorText);
		return;
	}

	var oldKind = prefs.get().lastFilecacheKind;
	var newKind = false;

	var types = payload.types;

	if (types && types.length > 0) {
		for (var a = 0; a < types.length; a++) {
			var id = types[a];
			this.filecacheKindsModel.choices.push({label:id, value:id});
			if (id == oldKind) {
				newKind = oldKind;
			}
		}
		
		if (newKind === false) {
			newKind = types[0];
		}
	}

	// Enable the drop-down list
	this.filecacheKindsModel.disabled = false;
	this.filecacheKindsModel.value = newKind;
	this.controller.modelChanged(this.filecacheKindsModel);
	this.filecacheKindChanged({value: newKind});
};

FilecacheExploreAssistant.prototype.filecacheKindChanged = function(event)
{
	var cookie = new preferenceCookie();
	var tprefs = cookie.get();
	tprefs.lastFilecacheKind = event.value;
	cookie.put(tprefs);
	var tmp = prefs.get(true);
	
	this.typeId = event.value;
	
	// Enable the show button
	this.showButtonModel.disabled = false;
	this.controller.modelChanged(this.showButtonModel);
};

FilecacheExploreAssistant.prototype.showTap = function(event)
{
	if (this.typeId) {
		this.request = ImpostahService.impersonate(this.filecacheKindHandler, "com.palm.filecache",
												   "com.palm.filecache",
												   "GetCacheTypeStatus", { "typeName" : this.typeId });
	}
};

FilecacheExploreAssistant.prototype.filecacheKind = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (getFilecache):</b><br>'+payload.errorText);
		return;
	}

	this.controller.stageController.pushScene("item", "File Cache Type", payload);
};

FilecacheExploreAssistant.prototype.errorMessage = function(msg)
{
	this.controller.showAlertDialog({
			allowHTMLMessage:	true,
			preventCancel:		true,
			title:				'Impostah',
			message:			msg,
			choices:			[{label:$L("Ok"), value:'ok'}],
			onChoose:			function(e){}
		});
};

FilecacheExploreAssistant.prototype.iconTap = function(event)
{
	this.controller.stageController.popScene();
};

FilecacheExploreAssistant.prototype.handleCommand = function(event)
{
	if (event.type == Mojo.Event.command) {
		switch (event.command) {
		case 'do-prefs':
		this.controller.stageController.pushScene('preferences');
		break;
		
		case 'do-help':
		this.controller.stageController.pushScene('help');
		break;
		}
	}
};

FilecacheExploreAssistant.prototype.cleanup = function(event)
{
	this.controller.stopListening(this.iconElement,  Mojo.Event.tap,
								  this.iconTapHandler);
	this.controller.stopListening(this.filecacheKindElement, Mojo.Event.propertyChange,
								  this.filecacheKindChangedHandler);
	this.controller.stopListening(this.showButton,  Mojo.Event.tap,
								  this.showTapHandler);
};

// Local Variables:
// tab-width: 4
// End:
