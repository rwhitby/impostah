function DeviceProfileAssistant()
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
	
	this.telephonyPlatformButtonModel = {
		label: $L("Telephony Platform"),
		disabled: true
	};

	this.deviceProfileButtonModel = {
		label: $L("Device Profile"),
		disabled: true
	};

	this.palmProfileButtonModel = {
		label: $L("Show Palm Profile"),
		disabled: true
	};

	this.resetPalmProfileButtonModel = {
		label: $L("Reset Palm Profile"),
		disabled: true
	};

};

DeviceProfileAssistant.prototype.setup = function()
{
	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	// get elements
	this.iconElement =			this.controller.get('icon');
	this.iconElement.style.display = 'none';
	this.spinnerElement = 		this.controller.get('spinner');
	this.telephonyPlatformButton = this.controller.get('telephonyPlatformButton');
	this.deviceProfileButton = this.controller.get('deviceProfileButton');
	this.palmProfileButton = this.controller.get('palmProfileButton');
	this.resetPalmProfileButton = this.controller.get('resetPalmProfileButton');
	
	// setup handlers
	this.getTelephonyPlatformHandler =	this.getTelephonyPlatform.bindAsEventListener(this);
	this.telephonyPlatformTapHandler = this.telephonyPlatformTap.bindAsEventListener(this);
	this.getDeviceProfileHandler =	this.getDeviceProfile.bindAsEventListener(this);
	this.deviceProfileTapHandler = this.deviceProfileTap.bindAsEventListener(this);
	this.getPalmProfileHandler =	this.getPalmProfile.bindAsEventListener(this);
	this.palmProfileTapHandler = this.palmProfileTap.bindAsEventListener(this);
	this.resetPalmProfileTapHandler = this.resetPalmProfileTap.bindAsEventListener(this);
	this.resetPalmProfileAckHandler = this.resetPalmProfileAck.bind(this);
	this.palmProfileDeletedHandler = this.palmProfileDeleted.bindAsEventListener(this);
	this.palmProfileDeletionAckHandler = this.palmProfileDeletionAck.bind(this);
	this.palmProfileDeletionDoneHandler = this.palmProfileDeletionDone.bindAsEventListener(this);
	
	// setup wigets
	this.spinnerModel = {spinning: true};
	this.controller.setupWidget('spinner', {spinnerSize: 'small'}, this.spinnerModel);
	this.controller.setupWidget('telephonyPlatformButton', { }, this.telephonyPlatformButtonModel);
	this.controller.listen(this.telephonyPlatformButton,  Mojo.Event.tap, this.telephonyPlatformTapHandler);
	this.controller.setupWidget('deviceProfileButton', { }, this.deviceProfileButtonModel);
	this.controller.listen(this.deviceProfileButton,  Mojo.Event.tap, this.deviceProfileTapHandler);
	this.controller.setupWidget('palmProfileButton', { }, this.palmProfileButtonModel);
	this.controller.listen(this.palmProfileButton,  Mojo.Event.tap, this.palmProfileTapHandler);
	this.controller.setupWidget('resetPalmProfileButton', { }, this.resetPalmProfileButtonModel);
	this.controller.listen(this.resetPalmProfileButton,  Mojo.Event.tap, this.resetPalmProfileTapHandler);
	
	this.telephonyPlatform = false;
	this.deviceProfile = false;
	this.palmProfile = false;

	this.requestTelephonyPlatform = ImpostahService.impersonate(this.getTelephonyPlatformHandler,
																"com.palm.configurator",
																"com.palm.telephony",
																"platformQuery", {});
	this.requestDeviceProfile = ImpostahService.impersonate(this.getDeviceProfileHandler,
															"com.palm.configurator",
															"com.palm.deviceprofile",
															"getDeviceProfile", {});
	this.requestPalmProfile = ImpostahService.impersonate(this.getPalmProfileHandler,
														  "com.palm.configurator",
														  "com.palm.db",
														  "get", {"ids":["com.palm.palmprofile.token"]});

	this.updateSpinner();
};

DeviceProfileAssistant.prototype.getTelephonyPlatform = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (getTelephonyPlatform):</b><br>'+payload.errorText);
		return;
	}

	if (this.requestTelephonyPlatform) this.requestTelephonyPlatform.cancel();
	this.requestTelephonyPlatform = false;

	this.updateSpinner();

	this.telephonyPlatform = payload.extended;

	this.telephonyPlatformButtonModel.disabled = false;
	this.controller.modelChanged(this.telephonyPlatformButtonModel);
};

DeviceProfileAssistant.prototype.telephonyPlatformTap = function(event)
{
	if (this.telephonyPlatform) {
		this.controller.stageController.pushScene("item", "Telephony Platform", this.telephonyPlatform);
	}
};

DeviceProfileAssistant.prototype.getDeviceProfile = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (getDeviceProfile):</b><br>'+payload.errorText);
		return;
	}

	if (this.requestDeviceProfile) this.requestDeviceProfile.cancel();
	this.requestDeviceProfile = false;

	this.updateSpinner();

	this.deviceProfile = payload.deviceInfo;

	this.deviceProfileButtonModel.disabled = false;
	this.controller.modelChanged(this.deviceProfileButtonModel);
};

DeviceProfileAssistant.prototype.deviceProfileTap = function(event)
{
	if (this.deviceProfile) {
		this.controller.stageController.pushScene("item", "Device Profile", this.deviceProfile);
	}
};

DeviceProfileAssistant.prototype.getPalmProfile = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (getPalmProfile):</b><br>'+payload.errorText);
		return;
	}

	if (this.requestPalmProfile) this.requestPalmProfile.cancel();
	this.requestPalmProfile = false;

	this.updateSpinner();

	this.palmProfile = payload.results[0];

	if (this.palmProfile) {
		this.palmProfileButtonModel.disabled = false;
		this.controller.modelChanged(this.palmProfileButtonModel);

		this.resetPalmProfileButtonModel.disabled = false;
		this.controller.modelChanged(this.resetPalmProfileButtonModel);
	}
};

DeviceProfileAssistant.prototype.palmProfileTap = function(event)
{
	if (this.palmProfile) {
		this.controller.stageController.pushScene("item", "Palm Profile", this.palmProfile);
	}
};

DeviceProfileAssistant.prototype.resetPalmProfileTap = function(event)
{
	this.controller.showAlertDialog({
			allowHTMLMessage:	true,
			title:				'Reset Palm Profile',
			message:			"Are you sure? Applications you installed and all application settings and data will be erased.",
			choices:			[{label:$L("Delete"), value:'delete', type:'negative'},{label:$L("Cancel"), value:'cancel', type:'dismiss'}],
			onChoose:			this.resetPalmProfileAckHandler
		});
};

DeviceProfileAssistant.prototype.resetPalmProfileAck = function(value)
{
	if (value != "delete") return;

	this.palmProfile = false;

	this.requestPalmProfile = ImpostahService.impersonate(this.palmProfileDeletedHandler,
														  "com.palm.configurator",
														  "com.palm.db",
														  "del", {"ids":["com.palm.palmprofile.token"], "purge":true});

	this.updateSpinner();

	this.palmProfileButtonModel.disabled = true;
	this.controller.modelChanged(this.palmProfileButtonModel);

	this.resetPalmProfileButtonModel.disabled = true;
	this.controller.modelChanged(this.resetPalmProfileButtonModel);
};

DeviceProfileAssistant.prototype.palmProfileDeleted = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (palmProfileDeleted):</b><br>'+payload.errorText);
		return;
	}

	if (this.requestPalmProfile) this.requestPalmProfile.cancel();
	this.requestPalmProfile = false;

	this.updateSpinner();

	this.controller.showAlertDialog({
			allowHTMLMessage:	true,
				preventCancel:		true,
				title:				'Reset Palm Profile',
				message:			"Your Palm Profile has been reset. Your device will now restart.",
				choices:			[{label:$L("Ok"), value:'ok'},
									 // {label:$L("Cancel"), value:'cancel'}
									 ],
				onChoose:			this.palmProfileDeletionAckHandler
				});
};

DeviceProfileAssistant.prototype.palmProfileDeletionAck = function(value)
{
	if (value != "ok") {
		this.requestPalmProfile = ImpostahService.impersonate(this.getPalmProfileHandler,
															  "com.palm.configurator",
															  "com.palm.db",
															  "get", {"ids":["com.palm.palmprofile.token"]});
	}
	else {
		this.requestPalmProfile = ImpostahService.removeFirstUseFlag(this.palmProfileDeletionDoneHandler);
	}

	this.updateSpinner();
};

DeviceProfileAssistant.prototype.palmProfileDeletionDone = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (palmProfileDeletionDone):</b><br>'+payload.errorText);
		return;
	}

	this.requestPalmProfile = ImpostahService.restartLuna();
};

DeviceProfileAssistant.prototype.updateSpinner = function()
{
	if (this.requestTelephonyPlatform || this.requestDeviceProfile || this.requestPalmProfile) {
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

DeviceProfileAssistant.prototype.errorMessage = function(msg)
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

DeviceProfileAssistant.prototype.handleCommand = function(event)
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

DeviceProfileAssistant.prototype.cleanup = function(event)
{
	this.controller.stopListening(this.telephonyPlatformButton,  Mojo.Event.tap,
								  this.telephonyPlatformTapHandler);
	this.controller.stopListening(this.deviceProfileButton,  Mojo.Event.tap,
								  this.deviceProfileTapHandler);
	this.controller.stopListening(this.palmProfileButton,  Mojo.Event.tap,
								  this.palmProfileTapHandler);
};

// Local Variables:
// tab-width: 4
// End:
