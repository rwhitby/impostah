function DeviceExploreAssistant()
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
	
	this.deviceProfileButtonModel = {
		label: $L("Device Profile"),
		disabled: true
	};

	this.telephonyPlatformButtonModel = {
		label: $L("Telephony Platform"),
		disabled: true
	};
};

DeviceExploreAssistant.prototype.setup = function()
{
	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	// get elements
	this.iconElement =			this.controller.get('icon');
	this.iconElement.style.display = 'none';
	this.spinnerElement = 		this.controller.get('spinner');
	this.deviceProfileButton = this.controller.get('deviceProfileButton');
	this.telephonyPlatformButton = this.controller.get('telephonyPlatformButton');
	
	// setup handlers
	this.deviceProfileTapHandler = this.deviceProfileTap.bindAsEventListener(this);
	this.getDeviceProfileHandler =	this.getDeviceProfile.bindAsEventListener(this);
	this.telephonyPlatformTapHandler = this.telephonyPlatformTap.bindAsEventListener(this);
	this.getTelephonyPlatformHandler =	this.getTelephonyPlatform.bindAsEventListener(this);
	
	// setup wigets
	this.spinnerModel = {spinning: true};
	this.controller.setupWidget('spinner', {spinnerSize: 'small'}, this.spinnerModel);
	this.controller.setupWidget('deviceProfileButton', { }, this.deviceProfileButtonModel);
	this.controller.listen(this.deviceProfileButton,  Mojo.Event.tap, this.deviceProfileTapHandler);
	this.controller.setupWidget('telephonyPlatformButton', { }, this.telephonyPlatformButtonModel);
	this.controller.listen(this.telephonyPlatformButton,  Mojo.Event.tap, this.telephonyPlatformTapHandler);
	
	this.deviceProfile = false;
	this.telephonyPlatform = false;

	this.request1 = ImpostahService.impersonate(this.getDeviceProfileHandler, "com.palm.configurator",
											   "com.palm.deviceprofile",
											   "getDeviceProfile", {});
	this.request2 = ImpostahService.impersonate(this.getTelephonyPlatformHandler, "com.palm.configurator",
											   "com.palm.telephony",
											   "platformQuery", {});
};

DeviceExploreAssistant.prototype.getDeviceProfile = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (getDeviceProfile):</b><br>'+payload.errorText);
		return;
	}

	this.deviceProfile = payload.deviceInfo;

	if (this.deviceProfile && this.telephonyPlatform) {
		this.iconElement.style.display = 'inline';
		this.spinnerModel.spinning = false;
		this.controller.modelChanged(this.spinnerModel);
	}

	this.deviceProfileButtonModel.disabled = false;
	this.controller.modelChanged(this.deviceProfileButtonModel);
};

DeviceExploreAssistant.prototype.deviceProfileTap = function(event)
{
	if (this.deviceProfile) {
		this.controller.stageController.pushScene("item", "Device Profile", this.deviceProfile);
	}
};

DeviceExploreAssistant.prototype.getTelephonyPlatform = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (getTelephonyPlatform):</b><br>'+payload.errorText);
		return;
	}

	this.telephonyPlatform = payload.extended;

	if (this.deviceProfile && this.telephonyPlatform) {
		this.iconElement.style.display = 'inline';
		this.spinnerModel.spinning = false;
		this.controller.modelChanged(this.spinnerModel);
	}

	this.telephonyPlatformButtonModel.disabled = false;
	this.controller.modelChanged(this.telephonyPlatformButtonModel);
};

DeviceExploreAssistant.prototype.telephonyPlatformTap = function(event)
{
	if (this.telephonyPlatform) {
		this.controller.stageController.pushScene("item", "Telephony Platform", this.telephonyPlatform);
	}
};

DeviceExploreAssistant.prototype.errorMessage = function(msg)
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

DeviceExploreAssistant.prototype.handleCommand = function(event)
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

DeviceExploreAssistant.prototype.cleanup = function(event)
{
	this.controller.stopListening(this.deviceProfileButton,  Mojo.Event.tap,
								  this.deviceProfileTapHandler);
	this.controller.stopListening(this.telephonyPlatformButton,  Mojo.Event.tap,
								  this.telephonyPlatformTapHandler);
};

// Local Variables:
// tab-width: 4
// End:
