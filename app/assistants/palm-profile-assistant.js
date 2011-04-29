function PalmProfileAssistant()
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
	
	this.palmProfileButtonModel = {
		label: $L("Show Palm Profile"),
		disabled: true
	};

	this.manageOverridesButtonModel = {
		label: $L("Palm Profile Overrides"),
		disabled: true
	};

	this.resetPalmProfileButtonModel = {
		label: $L("Reset Palm Profile"),
		disabled: true
	};

	this.palmProfile = false;
	this.reloadPalmProfile = false;

	this.requestPalmService = false;
};

PalmProfileAssistant.prototype.setup = function()
{
	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	// get elements
	this.iconElement =			this.controller.get('icon');
	this.iconElement.style.display = 'none';
	this.spinnerElement = 		this.controller.get('spinner');
	this.palmProfileButton = this.controller.get('palmProfileButton');
	this.manageOverridesButton = this.controller.get('manageOverridesButton');
	this.resetPalmProfileButton = this.controller.get('resetPalmProfileButton');
	
	// setup handlers
	this.iconTapHandler = this.iconTap.bindAsEventListener(this);
	this.palmProfileTapHandler = this.palmProfileTap.bindAsEventListener(this);
	this.manageOverridesTapHandler = this.manageOverridesTap.bindAsEventListener(this);
	this.resetPalmProfileTapHandler = this.resetPalmProfileTap.bindAsEventListener(this);
	this.resetPalmProfileAckHandler = this.resetPalmProfileAck.bind(this);
	this.palmProfileDeletedHandler = this.palmProfileDeleted.bindAsEventListener(this);
	this.palmProfileDeletionAckHandler = this.palmProfileDeletionAck.bind(this);
	this.palmProfileDeletionDoneHandler = this.palmProfileDeletionDone.bindAsEventListener(this);
	
	// setup wigets
	this.spinnerModel = {spinning: true};
	this.controller.setupWidget('spinner', {spinnerSize: 'small'}, this.spinnerModel);
	this.controller.listen(this.iconElement,  Mojo.Event.tap, this.iconTapHandler);
	this.controller.listen(this.spinnerElement,  Mojo.Event.tap, this.iconTapHandler);
	this.controller.setupWidget('palmProfileButton', { }, this.palmProfileButtonModel);
	this.controller.listen(this.palmProfileButton, Mojo.Event.tap, this.palmProfileTapHandler);
	this.controller.setupWidget('manageOverridesButton', { }, this.manageOverridesButtonModel);
	this.controller.listen(this.manageOverridesButton,  Mojo.Event.tap, this.manageOverridesTapHandler);
	this.controller.setupWidget('resetPalmProfileButton', { }, this.resetPalmProfileButtonModel);
	this.controller.listen(this.resetPalmProfileButton, Mojo.Event.tap, this.resetPalmProfileTapHandler);
}

PalmProfileAssistant.prototype.activate = function()
{
	this.palmProfile = false;
	this.updateSpinner(true);
	PalmProfile.getPalmProfile(this.getPalmProfile.bind(this), this.reloadPalmProfile);
};

PalmProfileAssistant.prototype.dirtyPalmProfile = function()
{
	this.reloadPalmProfile = true;
};

PalmProfileAssistant.prototype.getPalmProfile = function(returnValue, palmProfile, errorText)
{
	this.updateSpinner(false);

	if (returnValue === false) {
		this.errorMessage('<b>Service Error (getPalmProfile):</b><br>'+errorText);
		return;
	}

	this.palmProfile = palmProfile;

	if (this.palmProfile) {
		this.palmProfileButtonModel.disabled = false;
		this.controller.modelChanged(this.palmProfileButtonModel);
		this.manageOverridesButtonModel.disabled = false;
		this.controller.modelChanged(this.manageOverridesButtonModel);
		this.resetPalmProfileButtonModel.disabled = false;
		this.controller.modelChanged(this.resetPalmProfileButtonModel);
	}
};

PalmProfileAssistant.prototype.palmProfileTap = function(event)
{
	if (this.palmProfile) {
		this.controller.stageController.pushScene("item", "Palm Profile", this.palmProfile);
	}
};

PalmProfileAssistant.prototype.manageOverridesTap = function(event)
{
	if (this.palmProfile) {
		var attributes = this.palmProfile;
		delete attributes['_id']; delete attributes['_kind']; delete attributes['_rev'];
		this.controller.stageController.pushScene("overrides", "Palm Profile Overrides", attributes,
												  "org.webosinternals.impostah.palmprofile",
												  this.dirtyPalmProfile.bind(this));
	}
};

PalmProfileAssistant.prototype.resetPalmProfileTap = function(event)
{
	this.controller.showAlertDialog({
			allowHTMLMessage:	true,
			title:				'Reset Palm Profile',
			message:			"Are you sure? Applications you installed and all application settings and data will be erased.",
			choices:			[{label:$L("Delete"), value:'delete', type:'negative'},{label:$L("Cancel"), value:'cancel', type:'dismiss'}],
			onChoose:			this.resetPalmProfileAckHandler
		});
};

PalmProfileAssistant.prototype.resetPalmProfileAck = function(value)
{
	if (value != "delete") return;

	this.palmProfile = false;

	if (this.requestPalmService) this.requestPalmService.cancel();
	this.requestPalmService = ImpostahService.impersonate(this.palmProfileDeletedHandler,
														  "com.palm.configurator",
														  "com.palm.db",
														  "del", {"ids":["com.palm.palmprofile.token"], "purge":true});

	this.updateSpinner(true);

	this.palmProfileButtonModel.disabled = true;
	this.controller.modelChanged(this.palmProfileButtonModel);

	this.resetPalmProfileButtonModel.disabled = true;
	this.controller.modelChanged(this.resetPalmProfileButtonModel);
};

PalmProfileAssistant.prototype.palmProfileDeleted = function(payload)
{
	if (this.requestPalmService) this.requestPalmService.cancel();
	this.requestPalmService = false;

	this.updateSpinner(false);

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (palmProfileDeleted):</b><br>'+payload.errorText);
		return;
	}

	this.controller.showAlertDialog({
			allowHTMLMessage:	true,
				preventCancel:		true,
				title:				'Reset Palm Profile',
				message:			"Your Palm Profile has been reset. Your device will now restart.",
				choices:			[{label:$L("Ok"), value:'ok'},
									 {label:$L("Cancel"), value:'cancel'}
									 ],
				onChoose:			this.palmProfileDeletionAckHandler
				});
};

PalmProfileAssistant.prototype.palmProfileDeletionAck = function(value)
{
	if (this.requestPalmService) this.requestPalmService.cancel();
	if (value != "ok") {
		this.palmProfile = false;
		this.updateSpinner(true);
		PalmProfile.getPalmProfile(this.getPalmProfile.bind(this), true);
	}
	else {
		this.requestPalmService = ImpostahService.removeFirstUseFlag(this.palmProfileDeletionDoneHandler);
		this.updateSpinner(true);
	}
};

PalmProfileAssistant.prototype.palmProfileDeletionDone = function(payload)
{
	if (this.requestPalmService) this.requestPalmService.cancel();
	this.requestPalmService = false;

	this.updateSpinner(false);

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (palmProfileDeletionDone):</b><br>'+payload.errorText);
		return;
	}

	this.requestPalmService = ImpostahService.restartLuna();
};

PalmProfileAssistant.prototype.updateSpinner = function(active)
{
	if (active)  {
		this.iconElement.style.display = 'none';
		this.spinnerModel.spinning = true;
		this.controller.modelChanged(this.spinnerModel);
	}
	else {
		this.iconElement.style.display = 'inline';
		this.spinnerModel.spinning = false;
		this.controller.modelChanged(this.spinnerModel);
	}
};

PalmProfileAssistant.prototype.errorMessage = function(msg)
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

PalmProfileAssistant.prototype.iconTap = function(event)
{
	this.controller.stageController.popScene();
};

PalmProfileAssistant.prototype.handleCommand = function(event)
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

PalmProfileAssistant.prototype.cleanup = function(event)
{
	this.controller.stopListening(this.iconElement,  Mojo.Event.tap,
								  this.iconTapHandler);
	this.controller.stopListening(this.spinnerElement,  Mojo.Event.tap,
								  this.iconTapHandler);
	this.controller.stopListening(this.palmProfileButton,  Mojo.Event.tap,
								  this.palmProfileTapHandler);
	this.controller.stopListening(this.manageOverridesButton,  Mojo.Event.tap,
								  this.manageOverridesTapHandler);
	this.controller.stopListening(this.resetPalmProfileButton,  Mojo.Event.tap,
								  this.resetPalmProfileTapHandler);
	this.controller.stopListening(this.deviceInUseButton,  Mojo.Event.tap,
								  this.deviceInUseTapHandler);
	this.controller.stopListening(this.authenticateFromDeviceButton,  Mojo.Event.tap,
								  this.authenticateFromDeviceTapHandler);
	this.controller.stopListening(this.createDeviceAccountButton,  Mojo.Event.tap,
								  this.createDeviceAccountTapHandler);
};

// Local Variables:
// tab-width: 4
// End:
