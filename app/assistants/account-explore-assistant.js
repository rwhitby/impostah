function AccountExploreAssistant()
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
	
	this.accountSetsModel = {
		value: '',
		choices: [],
		disabled: true
	}
	this.setId = '';
	
	this.accountKindsModel = {
		value: '',
		choices: [],
		disabled: true
	}
	this.accountId = '';
	
	this.showButtonModel = {
		label: $L("Show"),
		disabled: true
	}

};

AccountExploreAssistant.prototype.setup = function()
{
	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	// get elements
	this.accountSetElement =	this.controller.get('accountSet');
	this.accountKindElement =	this.controller.get('accountKind');
	this.showButton =			this.controller.get('showButton');
	
	// setup handlers
	this.accountSetsHandler = this.accountSets.bindAsEventListener(this);
	this.accountSetChangedHandler = this.accountSetChanged.bindAsEventListener(this);
	this.accountKindsHandler = this.accountKinds.bindAsEventListener(this);
	this.accountKindChangedHandler = this.accountKindChanged.bindAsEventListener(this);
	this.showTapHandler =		this.showTap.bindAsEventListener(this);
	this.accountKindHandler =	this.accountKind.bindAsEventListener(this);
	
	// setup wigets
	this.controller.setupWidget('accountSet', {}, this.accountSetsModel);
	this.controller.listen(this.accountSetElement, Mojo.Event.propertyChange, this.accountSetChangedHandler);
	this.controller.setupWidget('accountKind', {}, this.accountKindsModel);
	this.controller.listen(this.accountKindElement, Mojo.Event.propertyChange, this.accountKindChangedHandler);
	this.controller.setupWidget('showButton', {}, this.showButtonModel);
	this.controller.listen(this.showButton,	 Mojo.Event.tap, this.showTapHandler);
	
	this.request = ImpostahService.impersonate(this.accountSetsHandler, "com.palm.configurator",
											   "com.palm.service.accounts",
											   "listAccountTemplates", {});
};

AccountExploreAssistant.prototype.accountSets = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (accountSets):</b><br>'+payload.errorText);
		return;
	}

	var oldSet = prefs.get().lastAccountSet;
	var newSet = false;

	var templates = payload.results;

	if (templates && templates.length > 0) {
		for (var a = 0; a < templates.length; a++) {
			var id = templates[a].templateId;
			var name = templates[a].loc_name;
			if (name) {
				this.accountSetsModel.choices.push({label:name, value:id});
				if (id == oldSet) {
					newSet = oldSet;
				}
			}
		}
		
		if (newSet === false) {
			newSet = this.accountSetsModel.choices[0].value;
		}

		// Enable the drop-down list
		this.accountSetsModel.disabled = false;
		this.accountSetsModel.value = newSet;
		this.controller.modelChanged(this.accountSetsModel);
		this.accountSetChanged({value: newSet});
	}
};

AccountExploreAssistant.prototype.accountSetChanged = function(event)
{
	var cookie = new preferenceCookie();
	var tprefs = cookie.get();
	tprefs.lastAccountSet = event.value;
	cookie.put(tprefs);
	var tmp = prefs.get(true);
	
	this.setId = event.value;
	
	// Disable the show button
	this.showButtonModel.disabled = true;
	this.controller.modelChanged(this.showButtonModel);

	// Disable the account kinds list
	this.accountKindsModel.choices = [];
	this.accountKindsModel.value = "";
	this.accountKindsModel.disabled = true;
	this.controller.modelChanged(this.accountKindsModel);

	this.request = ImpostahService.impersonate(this.accountKindsHandler, "com.palm.configurator",
											   "com.palm.service.accounts",
											   "listAccounts", {"templateId":this.setId});
};

AccountExploreAssistant.prototype.accountKinds = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (accountKinds):</b><br>'+payload.errorText);
		return;
	}

	var oldKind = prefs.get().lastAccountKind;
	var newKind = false;

	var accounts = payload.results;

	if (accounts && accounts.length > 0) {
		for (var a = 0; a < accounts.length; a++) {
			var id = accounts[a]._id;
			var name = accounts[a].username;
			if (name == "") name = "N/A";
			this.accountKindsModel.choices.push({label:name, value:id});
			if (id == oldKind) {
				newKind = oldKind;
			}
		}
		
		if (newKind === false) {
			newKind = this.accountKindsModel.choices[0].value;
		}

		// Enable the drop-down list
		this.accountKindsModel.disabled = false;
		this.accountKindsModel.value = newKind;
		this.controller.modelChanged(this.accountKindsModel);
		this.accountKindChanged({value: newKind});
	}
};

AccountExploreAssistant.prototype.accountKindChanged = function(event)
{
	var cookie = new preferenceCookie();
	var tprefs = cookie.get();
	tprefs.lastAccountKind = event.value;
	cookie.put(tprefs);
	var tmp = prefs.get(true);
	
	this.accountId = event.value;

	// Enable the show button
	this.showButtonModel.disabled = false;
	this.controller.modelChanged(this.showButtonModel);

};

AccountExploreAssistant.prototype.showTap = function(event)
{
	if (this.accountId) {
		this.request = ImpostahService.impersonate(this.accountKindHandler, "com.palm.configurator",
												   "com.palm.service.accounts",
												   "getAccountInfo", { "accountId" : this.accountId });
	}
};

AccountExploreAssistant.prototype.accountKind = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (accountKind):</b><br>'+payload.errorText);
		return;
	}

	if (payload.result) {
		this.controller.stageController.pushScene("item", "Account Record", payload.result);
	}

};

AccountExploreAssistant.prototype.errorMessage = function(msg)
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

AccountExploreAssistant.prototype.handleCommand = function(event)
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

AccountExploreAssistant.prototype.cleanup = function(event)
{
	this.controller.stopListening(this.accountSetElement, Mojo.Event.propertyChange, this.accountSetChangedHandler);
	this.controller.stopListening(this.accountKindElement, Mojo.Event.propertyChange, this.accountKindChangedHandler);
	this.controller.stopListening(this.showButton,	Mojo.Event.tap, this.showTapHandler);
};

// Local Variables:
// tab-width: 4
// End:
