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

	this.deviceProfile = false;
	this.reloadDeviceProfile = false;

	this.requestPalmService = false;
};

DeviceProfileAssistant.prototype.setup = function()
{
	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	// get elements
	this.overlay = this.controller.get('overlay'); this.overlay.hide();
	this.spinnerElement = this.controller.get('spinner');
	this.deviceProfileButton = this.controller.get('deviceProfileButton');
	this.manageOverridesButton = this.controller.get('manageOverridesButton');
	
	// setup back tap
	this.backElement = this.controller.get('icon');
	this.backTapHandler = this.backTap.bindAsEventListener(this);
	this.controller.listen(this.backElement,  Mojo.Event.tap, this.backTapHandler);
	
	// setup handlers
	this.deviceProfileTapHandler = this.deviceProfileTap.bindAsEventListener(this);
	this.manageOverridesTapHandler = this.manageOverridesTap.bindAsEventListener(this);
	
	// setup wigets
	this.spinnerModel = {spinning: true};
	this.controller.setupWidget('spinner', {spinnerSize: 'large'}, this.spinnerModel);
	this.controller.setupWidget('deviceProfileButton', { }, this.deviceProfileButtonModel);
	this.controller.listen(this.deviceProfileButton,  Mojo.Event.tap, this.deviceProfileTapHandler);
	this.controller.setupWidget('manageOverridesButton', { }, this.manageOverridesButtonModel);
	this.controller.listen(this.manageOverridesButton,  Mojo.Event.tap, this.manageOverridesTapHandler);
};

DeviceProfileAssistant.prototype.activate = function()
{
	this.deviceProfile = false;
	this.updateSpinner(true);
	DeviceProfile.getDeviceProfile(this.getDeviceProfile.bind(this), this.reloadDeviceProfile);
};

DeviceProfileAssistant.prototype.dirtyDeviceProfile = function()
{
	this.reloadDeviceProfile = true;
};

DeviceProfileAssistant.prototype.getDeviceProfile = function(returnValue, deviceProfile, errorText)
{
	this.updateSpinner(false);

	if (returnValue === false) {
		this.errorMessage('<b>Service Error (getDeviceProfile):</b><br>'+errorText);
		return;
	}

	this.deviceProfile = deviceProfile;
	this.reloadDeviceProfile = false;

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
		this.controller.stageController.pushScene("item", "Device Profile", this.deviceProfile,
												  'com.palm.deviceprofile', false);
	}
};

DeviceProfileAssistant.prototype.manageOverridesTap = function(event)
{
	if (this.deviceProfile) {
		var attributes = this.deviceProfile;
		if (!attributes["homeMcc"]) attributes["homeMcc"] = '';
		if (!attributes["homeMnc"]) attributes["homeMnc"] = '';
		if (!attributes["currentMcc"]) attributes["currentMcc"] = '';
		if (!attributes["currentMnc"]) attributes["currentMnc"] = '';
		this.controller.stageController.pushScene("overrides", "Device Profile Overrides", attributes,
												  "org.webosinternals.impostah.deviceprofile",
												  this.dirtyDeviceProfile.bind(this));
	}
};

DeviceProfileAssistant.prototype.updateSpinner = function(active)
{
	if (active) {
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

DeviceProfileAssistant.prototype.backTap = function(event)
{
	this.controller.stageController.popScene();
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
	this.controller.stopListening(this.backElement,  Mojo.Event.tap,
								  this.backTapHandler);
	this.controller.stopListening(this.deviceProfileButton,  Mojo.Event.tap,
								  this.deviceProfileTapHandler);
	this.controller.stopListening(this.manageOverridesButton,  Mojo.Event.tap,
								  this.manageOverridesTapHandler);
};

// Local Variables:
// tab-width: 4
// End:
