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
	
	this.telephonyPlatformButtonModel = {
		label: $L("Telephony Platform"),
		disabled: true
	};

	this.deviceProfileButtonModel = {
		label: $L("Device Profile"),
		disabled: true
	};

	this.palmProfileButtonModel = {
		label: $L("Palm Profile"),
		disabled: true
	};

	this.resetFirstUseButtonModel = {
		label: $L("Reset First Use"),
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
	this.telephonyPlatformButton = this.controller.get('telephonyPlatformButton');
	this.deviceProfileButton = this.controller.get('deviceProfileButton');
	this.palmProfileButton = this.controller.get('palmProfileButton');
	this.resetFirstUseButton = this.controller.get('resetFirstUseButton');
	
	// setup handlers
	this.getTelephonyPlatformHandler =	this.getTelephonyPlatform.bindAsEventListener(this);
	this.telephonyPlatformTapHandler = this.telephonyPlatformTap.bindAsEventListener(this);
	this.getDeviceProfileHandler =	this.getDeviceProfile.bindAsEventListener(this);
	this.deviceProfileTapHandler = this.deviceProfileTap.bindAsEventListener(this);
	this.getPalmProfileHandler =	this.getPalmProfile.bindAsEventListener(this);
	this.palmProfileTapHandler = this.palmProfileTap.bindAsEventListener(this);
	this.resetFirstUseTapHandler = this.resetFirstUseTap.bindAsEventListener(this);
	this.palmProfileDeletedHandler = this.palmProfileDeleted.bindAsEventListener(this);
	this.palmProfileDeletionAckHandler = this.palmProfileDeletionAck.bind(this);
	
	// setup wigets
	this.spinnerModel = {spinning: true};
	this.controller.setupWidget('spinner', {spinnerSize: 'small'}, this.spinnerModel);
	this.controller.setupWidget('telephonyPlatformButton', { }, this.telephonyPlatformButtonModel);
	this.controller.listen(this.telephonyPlatformButton,  Mojo.Event.tap, this.telephonyPlatformTapHandler);
	this.controller.setupWidget('deviceProfileButton', { }, this.deviceProfileButtonModel);
	this.controller.listen(this.deviceProfileButton,  Mojo.Event.tap, this.deviceProfileTapHandler);
	this.controller.setupWidget('palmProfileButton', { }, this.palmProfileButtonModel);
	this.controller.listen(this.palmProfileButton,  Mojo.Event.tap, this.palmProfileTapHandler);
	this.controller.setupWidget('resetFirstUseButton', { }, this.resetFirstUseButtonModel);
	this.controller.listen(this.resetFirstUseButton,  Mojo.Event.tap, this.resetFirstUseTapHandler);
	
	this.telephonyPlatform = false;
	this.deviceProfile = false;
	this.palmProfile = false;

	this.request1 = ImpostahService.impersonate(this.getTelephonyPlatformHandler, "com.palm.configurator",
											   "com.palm.telephony",
											   "platformQuery", {});
	this.request2 = ImpostahService.impersonate(this.getDeviceProfileHandler, "com.palm.configurator",
											   "com.palm.deviceprofile",
											   "getDeviceProfile", {});
	this.request3 = ImpostahService.impersonate(this.getPalmProfileHandler, "com.palm.configurator",
											   "com.palm.db",
												"get", {"ids":["com.palm.palmprofile.token"]});
};

DeviceExploreAssistant.prototype.getTelephonyPlatform = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (getTelephonyPlatform):</b><br>'+payload.errorText);
		return;
	}

	if (this.request1) this.request1.cancel();

	this.telephonyPlatform = payload.extended;

	if (this.telephonyPlatform && this.deviceProfile && this.palmProfile) {
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

DeviceExploreAssistant.prototype.getDeviceProfile = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (getDeviceProfile):</b><br>'+payload.errorText);
		return;
	}

	if (this.request2) this.request2.cancel();

	this.deviceProfile = payload.deviceInfo;

	if (this.telephonyPlatform && this.deviceProfile && this.palmProfile) {
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

DeviceExploreAssistant.prototype.getPalmProfile = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (getPalmProfile):</b><br>'+payload.errorText);
		return;
	}

	if (this.request3) this.request3.cancel();

	this.palmProfile = payload.results[0];

	if (this.telephonyPlatform && this.deviceProfile && this.palmProfile) {
		this.iconElement.style.display = 'inline';
		this.spinnerModel.spinning = false;
		this.controller.modelChanged(this.spinnerModel);
	}

	this.palmProfileButtonModel.disabled = false;
	this.controller.modelChanged(this.palmProfileButtonModel);

	this.resetFirstUseButtonModel.disabled = false;
	this.controller.modelChanged(this.resetFirstUseButtonModel);
};

DeviceExploreAssistant.prototype.palmProfileTap = function(event)
{
	if (this.palmProfile) {
		this.controller.stageController.pushScene("item", "Palm Profile", this.palmProfile);
	}
};

DeviceExploreAssistant.prototype.resetFirstUseTap = function(event)
{
	this.palmProfileButtonModel.disabled = true;
	this.controller.modelChanged(this.palmProfileButtonModel);

	this.resetFirstUseButtonModel.disabled = true;
	this.controller.modelChanged(this.resetFirstUseButtonModel);

	this.iconElement.style.display = 'none';
	this.spinnerModel.spinning = true;
	this.controller.modelChanged(this.spinnerModel);

	this.request4 = ImpostahService.impersonate(this.palmProfileDeletedHandler, "com.palm.configurator",
											   "com.palm.db",
												"del", {"ids":["com.palm.palmprofile.token"]});
};

DeviceExploreAssistant.prototype.palmProfileDeleted = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (palmProfileDeleted):</b><br>'+payload.errorText);
		return;
	}

	if (this.request4) this.request4.cancel();

	this.controller.showAlertDialog({
			allowHTMLMessage:	true,
			preventCancel:		true,
			title:				'Impostah',
			message:			"Palm Profile token deleted",
			choices:			[{label:$L("Ok"), value:'ok'}],
			onChoose:			this.palmProfileDeletionAckHandler
		});
};

DeviceExploreAssistant.prototype.palmProfileDeletionAck = function(value)
{
	this.request3 = ImpostahService.impersonate(this.getPalmProfileHandler, "com.palm.configurator",
											   "com.palm.db",
												"get", {"ids":["com.palm.palmprofile.token"]});
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
