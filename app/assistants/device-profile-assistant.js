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
	
	this.deviceProfileButtonModel = {
		label: $L("Show Device Profile"),
		disabled: true
	};

	this.manageOverridesButtonModel = {
		label: $L("Device Profile Overrides"),
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
	this.deviceProfileButton = this.controller.get('deviceProfileButton');
	this.manageOverridesButton = this.controller.get('manageOverridesButton');
	
	// setup handlers
	this.getDeviceProfileHandler =	this.getDeviceProfile.bindAsEventListener(this);
	this.deviceProfileTapHandler = this.deviceProfileTap.bindAsEventListener(this);
	this.manageOverridesTapHandler = this.manageOverridesTap.bindAsEventListener(this);
	
	// setup wigets
	this.spinnerModel = {spinning: true};
	this.controller.setupWidget('spinner', {spinnerSize: 'small'}, this.spinnerModel);
	this.controller.setupWidget('deviceProfileButton', { }, this.deviceProfileButtonModel);
	this.controller.listen(this.deviceProfileButton,  Mojo.Event.tap, this.deviceProfileTapHandler);
	this.controller.setupWidget('manageOverridesButton', { }, this.manageOverridesButtonModel);
	this.controller.listen(this.manageOverridesButton,  Mojo.Event.tap, this.manageOverridesTapHandler);
};

DeviceProfileAssistant.prototype.activate = function()
{
	this.deviceProfile = false;

	this.requestDeviceProfile = ImpostahService.impersonate(this.getDeviceProfileHandler,
															"com.palm.configurator",
															"com.palm.deviceprofile",
															"getDeviceProfile", {});

	this.updateSpinner();

};

DeviceProfileAssistant.prototype.getDeviceProfile = function(payload)
{
	if (this.requestDeviceProfile) this.requestDeviceProfile.cancel();
	this.requestDeviceProfile = false;

	this.updateSpinner();

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (getDeviceProfile):</b><br>'+payload.errorText);
		return;
	}

	this.deviceProfile = payload.deviceInfo;

	if (this.deviceProfile) {
		this.deviceProfileButtonModel.disabled = false;
		this.controller.modelChanged(this.deviceProfileButtonModel);
		this.manageOverridesButtonModel.disabled = false;
		this.controller.modelChanged(this.manageOverridesButtonModel);
	}
};

DeviceProfileAssistant.prototype.deviceProfileTap = function(event)
{
	if (this.deviceProfile) {
		this.controller.stageController.pushScene("item", "Device Profile", this.deviceProfile);
	}
};

DeviceProfileAssistant.prototype.manageOverridesTap = function(event)
{
	if (this.deviceProfile) {
		this.controller.stageController.pushScene("overrides", "Device Profile Overrides",
												  this.deviceProfile,
												  "org.webosinternals.impostah.deviceprofile");
	}
};

DeviceProfileAssistant.prototype.updateSpinner = function()
{
	if (this.requestDeviceProfile) {
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
	this.controller.stopListening(this.deviceProfileButton,  Mojo.Event.tap,
								  this.deviceProfileTapHandler);
	this.controller.stopListening(this.manageOverridesButton,  Mojo.Event.tap,
								  this.manageOverridesTapHandler);
};

// Local Variables:
// tab-width: 4
// End:
