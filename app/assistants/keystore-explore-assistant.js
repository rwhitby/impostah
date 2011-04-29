function KeystoreExploreAssistant()
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
	
	this.keystoreKindsModel = {
		value: '',
		choices: [],
		disabled: true
	}

	this.keyId = '';
	this.keys = {};
	
	this.showButtonModel = {
		label: $L("Show"),
		disabled: true
	}

};

KeystoreExploreAssistant.prototype.setup = function()
{
	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	// get elements
	this.iconElement =			this.controller.get('icon');
	this.keystoreKindElement =	this.controller.get('keystoreKind');
	this.showButton =			this.controller.get('showButton');
	
	// setup handlers
	this.iconTapHandler = this.iconTap.bindAsEventListener(this);
	this.keystoreKindsHandler =			this.keystoreKinds.bindAsEventListener(this);
	this.keystoreKindHandler =		this.keystoreKind.bindAsEventListener(this);
	this.keystoreKindChangedHandler = this.keystoreKindChanged.bindAsEventListener(this);
	this.showTapHandler =		this.showTap.bindAsEventListener(this);
	
	// setup widgets
	this.controller.listen(this.iconElement,  Mojo.Event.tap, this.iconTapHandler);
	this.controller.setupWidget('keystoreKind', { multiline: true }, this.keystoreKindsModel);
	this.controller.listen(this.keystoreKindElement, Mojo.Event.propertyChange, this.keystoreKindChangedHandler);
	this.controller.setupWidget('showButton', {}, this.showButtonModel);
	this.controller.listen(this.showButton,	 Mojo.Event.tap, this.showTapHandler);
	
	this.request = ImpostahService.listKeys(this.keystoreKindsHandler);
	
};

KeystoreExploreAssistant.prototype.keystoreKinds = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (keystoreKinds):</b><br>'+payload.errorText);
		return;
	}

	var oldKind = prefs.get().lastKeystoreKind;
	var newKind = false;

	this.keys = {};

	if (payload.stdOut && payload.stdOut.length > 0) {
		for (var a = 0; a < payload.stdOut.length; a++) {
			var fields = payload.stdOut[a].split('|');
			var id = fields[0];
			var owner = fields[1];
			var name = fields[2];
			var label = owner + " : " + name;
			if (label.indexOf("com.palm.") == 0) {
				label = label.slice(9);
			}
			this.keystoreKindsModel.choices.push({label:label, value:id});
			this.keys[id] = {id: id, owner: owner, name: name};
			if (id == oldKind) {
				newKind = oldKind;
			}
		}
		
		if (newKind === false) {
			newKind = "1";
		}
	}

	// Enable the drop-down list
	this.keystoreKindsModel.disabled = false;
	this.keystoreKindsModel.value = newKind;
	this.controller.modelChanged(this.keystoreKindsModel);
	this.keystoreKindChanged({value: newKind});
};

KeystoreExploreAssistant.prototype.keystoreKindChanged = function(event)
{
	var cookie = new preferenceCookie();
	var tprefs = cookie.get();
	tprefs.lastKeystoreKind = event.value;
	cookie.put(tprefs);
	var tmp = prefs.get(true);
	
	this.keyId = event.value;
	
	// Enable the show button
	this.showButtonModel.disabled = false;
	this.controller.modelChanged(this.showButtonModel);

};

KeystoreExploreAssistant.prototype.showTap = function(event)
{
	if (this.keyId) {
		var id	  = this.keys[this.keyId].id;
		var owner = this.keys[this.keyId].owner;
		var name  = this.keys[this.keyId].name;

		this.request = ImpostahService.impersonate(this.keystoreKindHandler, owner,
												   "com.palm.keymanager",
												   "keyInfo", { "keyname" : name });
	}
};

KeystoreExploreAssistant.prototype.keystoreKind = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (getKeystore):</b><br>'+payload.errorText);
		return;
	}

	this.controller.stageController.pushScene("item", "Key Store Record", payload);
};

KeystoreExploreAssistant.prototype.errorMessage = function(msg)
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

KeystoreExploreAssistant.prototype.iconTap = function(event)
{
	this.controller.stageController.popScene();
};

KeystoreExploreAssistant.prototype.handleCommand = function(event)
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

KeystoreExploreAssistant.prototype.cleanup = function(event)
{
	this.controller.stopListening(this.iconElement,  Mojo.Event.tap, this.iconTapHandler);
	this.controller.stopListening(this.keystoreKindElement, Mojo.Event.propertyChange, this.keystoreKindChangedHandler);
	this.controller.stopListening(this.showButton,	Mojo.Event.tap, this.showTapHandler);
};

// Local Variables:
// tab-width: 4
// End:
