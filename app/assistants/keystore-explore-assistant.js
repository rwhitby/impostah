function KeystoreExploreAssistant()
{
	// setup menu
	this.menuModel =
	{
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
	
	this.keystoreKindsModel =
	{
		value: prefs.get().lastKeystoreKind,
		choices: [],
		disabled: true
	}

	this.keyId = '';
	this.keys = {};
	
};

KeystoreExploreAssistant.prototype.setup = function()
{
	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	// get elements
	this.keystoreKindElement =	this.controller.get('keystoreKind');
	this.showButton =			this.controller.get('showButton');
	this.bodyElement =			this.controller.get('body');
	
	// setup handlers
    this.keystoreKindsHandler = 		this.keystoreKinds.bindAsEventListener(this);
    this.keystoreKindHandler = 		this.keystoreKind.bindAsEventListener(this);
	this.keystoreKindChangedHandler = this.keystoreKindChanged.bindAsEventListener(this);
    this.showTapHandler = 		this.showTap.bindAsEventListener(this);
	
	this.controller.setupWidget
	(
		'keystoreKind',
		{ multiline: true },
		this.keystoreKindsModel
	);
	
	this.controller.listen(this.keystoreKindElement, Mojo.Event.propertyChange, this.keystoreKindChangedHandler);
	
	this.controller.setupWidget
	(
		'showButton',
		{},
		this.showButtonModel =
		{
			buttonLabel: $L("Show"),
			disabled: true
		}
	);
	
	this.controller.listen(this.showButton,  Mojo.Event.tap, this.showTapHandler);
	
	this.keystoreKindsModel.choices = [];
	this.keystoreKindsModel.value = "";
	this.keystoreKindsModel.disabled = true;
	this.controller.modelChanged(this.keystoreKindsModel);

    this.bodyElement.innerHTML = "";

	this.request = ImpostahService.listKeys(this.keystoreKindsHandler, false);
	
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

	if (payload.stdOut && payload.stdOut.length > 0)
	{
		for (var a = 0; a < payload.stdOut.length; a++)
		{
			var fields = payload.stdOut[a].split('|');
			var id = fields[0];
			var owner = fields[1];
			var name = fields[2];
			var label = owner + ":" + name;
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
    this.bodyElement.innerHTML = "";
	
	// Enable the show button
	this.showButtonModel.disabled = false;
	this.controller.modelChanged(this.showButtonModel);

}

KeystoreExploreAssistant.prototype.showTap = function(event)
{
	if (this.keyId) {
		var id    = this.keys[this.keyId].id;
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

	this.bodyElement.innerHTML = JSON.stringify(payload);
};

KeystoreExploreAssistant.prototype.activate = function(event)
{
	
	if (this.firstActivate)
	{
	}
	else
	{
		
	}
	this.firstActivate = true;
};
KeystoreExploreAssistant.prototype.deactivate = function(event)
{
};

KeystoreExploreAssistant.prototype.errorMessage = function(msg)
{
	this.controller.showAlertDialog(
	{
		allowHTMLMessage:	true,
		preventCancel:		true,
	    title:				'Impostah',
	    message:			msg,
	    choices:			[{label:$L("Ok"), value:'ok'}],
	    onChoose:			function(e){}
    });
}
KeystoreExploreAssistant.prototype.handleCommand = function(event)
{
	if (event.type == Mojo.Event.command)
	{
		switch (event.command)
		{
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
};

// Local Variables:
// tab-width: 4
// End:
