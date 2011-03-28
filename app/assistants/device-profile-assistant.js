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
		label: $L("Show Device Profile"),
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
	
	// setup handlers
	this.getTelephonyPlatformHandler =	this.getTelephonyPlatform.bindAsEventListener(this);
	this.telephonyPlatformTapHandler = this.telephonyPlatformTap.bindAsEventListener(this);
	this.getDeviceProfileHandler =	this.getDeviceProfile.bindAsEventListener(this);
	this.deviceProfileTapHandler = this.deviceProfileTap.bindAsEventListener(this);
	
	// setup wigets
	this.spinnerModel = {spinning: true};
	this.controller.setupWidget('spinner', {spinnerSize: 'small'}, this.spinnerModel);
	this.controller.setupWidget('telephonyPlatformButton', { }, this.telephonyPlatformButtonModel);
	this.controller.listen(this.telephonyPlatformButton,  Mojo.Event.tap, this.telephonyPlatformTapHandler);
	this.controller.setupWidget('deviceProfileButton', { }, this.deviceProfileButtonModel);
	this.controller.listen(this.deviceProfileButton,  Mojo.Event.tap, this.deviceProfileTapHandler);
	
	this.telephonyPlatform = false;
	this.deviceProfile = false;

	this.requestTelephonyPlatform = ImpostahService.impersonate(this.getTelephonyPlatformHandler,
																"com.palm.configurator",
																"com.palm.telephony",
																"platformQuery", {});
	this.requestDeviceProfile = ImpostahService.impersonate(this.getDeviceProfileHandler,
															"com.palm.configurator",
															"com.palm.deviceprofile",
															"getDeviceProfile", {});

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

DeviceProfileAssistant.prototype.updateSpinner = function()
{
	if (this.requestTelephonyPlatform || this.requestDeviceProfile) {
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
};

// Local Variables:
// tab-width: 4
// End:
