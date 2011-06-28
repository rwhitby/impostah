function AccountsAssistant()
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
	
	this.accountTemplatesModel = {
		value: '',
		choices: [],
		disabled: true
	}
	this.templateId = '';
	
	this.accountNamesModel = {
		value: '',
		choices: [],
		disabled: true
	}
	this.accountId = '';
	
	this.showAccountButtonModel = {
		label: $L("Show Account"),
		disabled: true
	}

	this.removeAccountButtonModel = {
		label: $L("Remove Account"),
		disabled: true
	}

	this.reloadAccounts = false;

	this.requestPalmService = false;
};

AccountsAssistant.prototype.setup = function()
{
	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	// get elements
	this.overlay = 		this.controller.get('overlay'); this.overlay.hide();
	this.spinnerElement = 		this.controller.get('spinner');
	this.accountTemplatesElement =	this.controller.get('accountTemplates');
	this.accountNamesElement =	this.controller.get('accountNames');
	this.showAccountButton =	this.controller.get('showAccountButton');
	this.removeAccountButton =	this.controller.get('removeAccountButton');
	
	// setup back tap
	this.backElement = this.controller.get('icon');
	this.backTapHandler = this.backTap.bindAsEventListener(this);
	this.controller.listen(this.backElement,  Mojo.Event.tap, this.backTapHandler);
	
	// setup handlers
	this.listAccountTemplatesHandler = this.listAccountTemplates.bindAsEventListener(this);
	this.accountTemplatesChangedHandler = this.accountTemplatesChanged.bindAsEventListener(this);
	this.listAccountsHandler = this.listAccounts.bindAsEventListener(this);
	this.accountNamesChangedHandler = this.accountNamesChanged.bindAsEventListener(this);
	this.showAccountTapHandler =		this.showAccountTap.bindAsEventListener(this);
	this.getAccountInfoHandler =	this.getAccountInfo.bindAsEventListener(this);
	this.removeAccountTapHandler =		this.removeAccountTap.bindAsEventListener(this);
	this.removeAccountAckHandler =		this.removeAccountAck.bindAsEventListener(this);
	this.accountDeletedHandler = this.accountDeleted.bindAsEventListener(this);
	
	// setup wigets
	this.spinnerModel = {spinning: true};
	this.controller.setupWidget('spinner', {spinnerSize: 'large'}, this.spinnerModel);
	this.controller.setupWidget('accountTemplates', {}, this.accountTemplatesModel);
	this.controller.listen(this.accountTemplatesElement, Mojo.Event.propertyChange, this.accountTemplatesChangedHandler);
	this.controller.setupWidget('accountNames', {}, this.accountNamesModel);
	this.controller.listen(this.accountNamesElement, Mojo.Event.propertyChange, this.accountNamesChangedHandler);
	this.controller.setupWidget('showAccountButton', { type: Mojo.Widget.activityButton }, this.showAccountButtonModel);
	this.controller.listen(this.showAccountButton,	 Mojo.Event.tap, this.showAccountTapHandler);
	this.controller.setupWidget('removeAccountButton', { type: Mojo.Widget.activityButton }, this.removeAccountButtonModel);
	this.controller.listen(this.removeAccountButton,	 Mojo.Event.tap, this.removeAccountTapHandler);

	this.reloadAccounts = true;
};

AccountsAssistant.prototype.activate = function()
{
	if (this.reloadAccounts) {
		// Disable the account templates list
		this.accountTemplatesModel.choices = [];
		this.accountTemplatesModel.value = "";
		this.accountTemplatesModel.disabled = true;
		this.controller.modelChanged(this.accountTemplatesModel);

		this.updateSpinner(true);

		if (this.requestPalmService) this.requestPalmService.cancel();
		this.requestPalmService = ImpostahService.impersonate(this.listAccountTemplatesHandler,
															  "com.palm.configurator",
															  "com.palm.service.accounts",
															  "listAccountTemplates", {});
	}
};

AccountsAssistant.prototype.listAccountTemplates = function(payload)
{
	if (this.requestPalmService) this.requestPalmService.cancel();
	this.requestPalmService = false;

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (listAaccountTemplates):</b><br>'+payload.errorText);
		this.updateSpinner(false);
		return;
	}

	this.reloadAccounts = false;

	var oldSet = prefs.get().lastAccountTemplate;
	var newSet = false;

	var templates = payload.results;

	if (!templates || !templates.length) {
		this.updateSpinner(false);
		return;
	}

	for (var a = 0; a < templates.length; a++) {
		var id = templates[a].templateId;
		var name = templates[a].loc_name;
		if (name) {
			this.accountTemplatesModel.choices.push({label:name, value:id});
			if (id == oldSet) {
				newSet = oldSet;
			}
		}
	}
		
	if (newSet === false) {
		newSet = 'com.palm.palmprofile';
	}

	// Enable the drop-down list
	this.accountTemplatesModel.disabled = false;
	this.accountTemplatesModel.value = newSet;
	this.controller.modelChanged(this.accountTemplatesModel);
	this.accountTemplatesChanged({value: newSet});
};

AccountsAssistant.prototype.accountTemplatesChanged = function(event)
{
	var cookie = new preferenceCookie();
	var tprefs = cookie.get();
	tprefs.lastAccountTemplate = event.value;
	cookie.put(tprefs);
	var tmp = prefs.get(true);
	
	this.templateId = event.value;
	
	// Disable the show button
	this.showAccountButtonModel.disabled = true;
	this.controller.modelChanged(this.showAccountButtonModel);
	// Disable the remove button
	this.removeAccountButtonModel.disabled = true;
	this.controller.modelChanged(this.removeAccountButtonModel);

	// Disable the account kinds list
	this.accountNamesModel.choices = [];
	this.accountNamesModel.value = "";
	this.accountNamesModel.disabled = true;
	this.controller.modelChanged(this.accountNamesModel);

	this.updateSpinner(true);

	if (this.requestPalmService) this.requestPalmService.cancel();
	this.requestPalmService = ImpostahService.impersonate(this.listAccountsHandler, "com.palm.configurator",
														  "com.palm.service.accounts",
														  "listAccounts", {"templateId":this.templateId});
};

AccountsAssistant.prototype.listAccounts = function(payload)
{
	if (this.requestPalmService) this.requestPalmService.cancel();
	this.requestPalmService = false;

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (listAccounts):</b><br>'+payload.errorText);
		this.updateSpinner(false);
		return;
	}

	var oldKind = prefs.get().lastAccountId;
	var newKind = false;

	var accounts = payload.results;

	if (!accounts || !accounts.length) {
		this.updateSpinner(false);
		return;
	}

	for (var a = 0; a < accounts.length; a++) {
		var id = accounts[a]._id;
		var name = accounts[a].username;
		if (name == "") name = "N/A";
		this.accountNamesModel.choices.push({label:name, value:id});
		if (id == oldKind) {
			newKind = oldKind;
		}
	}
		
	if (newKind === false) {
		newKind = this.accountNamesModel.choices[0].value;
	}

	// Enable the drop-down list
	this.accountNamesModel.disabled = false;
	this.accountNamesModel.value = newKind;
	this.controller.modelChanged(this.accountNamesModel);
	this.accountNamesChanged({value: newKind});
};

AccountsAssistant.prototype.accountNamesChanged = function(event)
{
	var cookie = new preferenceCookie();
	var tprefs = cookie.get();
	tprefs.lastAccountId = event.value;
	cookie.put(tprefs);
	var tmp = prefs.get(true);
	
	this.accountId = event.value;

	if (this.accountId) {
		// Enable the show button
		this.showAccountButtonModel.disabled = false;
		this.controller.modelChanged(this.showAccountButtonModel);
		// Enable the remove button
		this.removeAccountButtonModel.disabled = false;
		this.controller.modelChanged(this.removeAccountButtonModel);
	}

	this.updateSpinner(false);
};

AccountsAssistant.prototype.showAccountTap = function(event)
{
	this.overlay.show();

	if (this.requestPalmService) this.requestPalmService.cancel();
	this.requestPalmService = ImpostahService.impersonate(this.getAccountInfoHandler, "com.palm.configurator",
														  "com.palm.service.accounts",
														  "getAccountInfo", { "accountId" : this.accountId });
};

AccountsAssistant.prototype.getAccountInfo = function(payload)
{
	if (this.requestPalmService) this.requestPalmService.cancel();
	this.requestPalmService = false;

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (getAccountInfo):</b><br>'+payload.errorText);
		this.overlay.hide();
		this.showAccountButton.mojo.deactivate();
		return;
	}

	if (payload.result) {
		this.controller.stageController.pushScene("item", "Account Record", payload.result, this.accountId,
												  payload.result['_id']);
	}

	this.overlay.hide();
	this.showAccountButton.mojo.deactivate();
};

AccountsAssistant.prototype.removeAccountTap = function(event)
{
	this.overlay.show();

	this.controller.showAlertDialog({
			allowHTMLMessage:	true,
			title:				'Remove Account',
			message:			"Are you sure? This will remove the account and all associated data on your device.",
			choices:			[{label:$L("Remove"), value:'remove', type:'negative'},{label:$L("Cancel"), value:'cancel', type:'dismiss'}],
			onChoose:			this.removeAccountAckHandler
		});
};

AccountsAssistant.prototype.removeAccountAck = function(value)
{
	if (value != "remove") {
		this.overlay.hide();
		this.removeAccountButton.mojo.deactivate();
		return;
	}

	if (this.requestPalmService) this.requestPalmService.cancel();
	this.requestPalmService = ImpostahService.impersonate(this.accountDeletedHandler, "com.palm.configurator",
														  "com.palm.service.accounts",
														  "deleteAccount", { "accountId" : this.accountId });
};

AccountsAssistant.prototype.accountDeleted = function(payload)
{
	if (this.requestPalmService) this.requestPalmService.cancel();
	this.requestPalmService = false;

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (deleteAccount):</b><br>'+payload.errorText);
	}

	// this.overlay.hide(); // leave the overlay in place, rather than flash off then on again
	this.removeAccountButton.mojo.deactivate();

	this.reloadAccounts = true;
	this.activate();
};

AccountsAssistant.prototype.updateSpinner = function(active)
{
	if (active)  {
		this.spinnerModel.spinning = true;
		this.controller.modelChanged(this.spinnerModel);
		this.overlay.show();
	}
	else {
		this.spinnerModel.spinning = false;
		this.controller.modelChanged(this.spinnerModel);
		this.overlay.hide();
	}
};

AccountsAssistant.prototype.errorMessage = function(msg)
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

AccountsAssistant.prototype.backTap = function(event)
{
	this.controller.stageController.popScene();
};

AccountsAssistant.prototype.handleCommand = function(event)
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

AccountsAssistant.prototype.cleanup = function(event)
{
	this.controller.stopListening(this.backElement, Mojo.Event.tap, this.backTapHandler);
	this.controller.stopListening(this.accountTemplatesElement, Mojo.Event.propertyChange,
								  this.accountTemplatesChangedHandler);
	this.controller.stopListening(this.accountNamesElement, Mojo.Event.propertyChange,
								  this.accountNamesChangedHandler);
	this.controller.stopListening(this.showAccountButton,	Mojo.Event.tap, this.showAccountTapHandler);
	this.controller.stopListening(this.removeAccountButton,	Mojo.Event.tap, this.removeAccountTapHandler);
};

// Local Variables:
// tab-width: 4
// End:
