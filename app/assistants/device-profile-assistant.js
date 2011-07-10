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

	this.locationHostInputFieldModel = {
		label: $L("Location Host"),
		value: '',
		disabled: true
	};

	this.setLocationHostButtonModel = {
		label: $L("Set Location Host"),
		disabled: true
	};

	this.deviceProfile = false;
	this.reloadDeviceProfile = false;

	this.locationHost = false;
	this.reloadLocationHost = false;
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
	this.locationHostInputField = this.controller.get('locationHostInputField');
	this.setLocationHostButton = this.controller.get('setLocationHostButton');
	
	// setup back tap
	this.backElement = this.controller.get('icon');
	this.backTapHandler = this.backTap.bindAsEventListener(this);
	this.controller.listen(this.backElement,  Mojo.Event.tap, this.backTapHandler);
	
	// setup handlers
	this.deviceProfileTapHandler = this.deviceProfileTap.bindAsEventListener(this);
	this.manageOverridesTapHandler = this.manageOverridesTap.bindAsEventListener(this);
	this.locationHostChangedHandler = this.locationHostChanged.bindAsEventListener(this);
	this.setLocationHostTapHandler = this.setLocationHostTap.bindAsEventListener(this);
	
	// setup wigets
	this.spinnerModel = {spinning: true};
	this.controller.setupWidget('spinner', {spinnerSize: 'large'}, this.spinnerModel);
	this.controller.setupWidget('deviceProfileButton', { }, this.deviceProfileButtonModel);
	this.controller.listen(this.deviceProfileButton,  Mojo.Event.tap, this.deviceProfileTapHandler);
	this.controller.setupWidget('manageOverridesButton', { }, this.manageOverridesButtonModel);
	this.controller.listen(this.manageOverridesButton,  Mojo.Event.tap, this.manageOverridesTapHandler);
	this.controller.setupWidget('locationHostInputField', {
			autoReplace: false,
				hintText: 'Enter location host ...',
				changeOnKeyPress: true,
				'textCase':Mojo.Widget.steModeLowerCase,
				focusMode: Mojo.Widget.focusSelectMode },
		this.locationHostInputFieldModel);
	this.controller.listen(this.locationHostInputField, Mojo.Event.propertyChange, this.locationHostChangedHandler);
	this.controller.setupWidget('setLocationHostButton', { type: Mojo.Widget.activityButton }, this.setLocationHostButtonModel);
	this.controller.listen(this.setLocationHostButton,  Mojo.Event.tap, this.setLocationHostTapHandler);
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

	this.updateSpinner(true);
	AccountServer.getLocationHost(this.getLocationHost.bind(this), this.reloadLocationHost);
};

DeviceProfileAssistant.prototype.dirtyLocationHost = function()
{
	this.reloadLocationHost = true;
};

DeviceProfileAssistant.prototype.getLocationHost = function(returnValue, locationHost, errorText)
{
	this.updateSpinner(false);

	if (returnValue === false) {
		this.errorMessage('<b>Service Error (getLocationHost):</b><br>'+errorText);
		return;
	}

	this.locationHost = locationHost;
	this.reloadLocationHost = false;

	if (this.locationHost) {
		this.locationHostInputFieldModel.value = this.locationHost;
		this.locationHostInputFieldModel.disabled = false;
		this.controller.modelChanged(this.locationHostInputFieldModel);
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

DeviceProfileAssistant.prototype.locationHostChanged = function(event)
{
	if (event.value != '') {
		this.setLocationHostButtonModel.disabled = false;
		this.controller.modelChanged(this.setLocationHostButtonModel);
	}
	else {
		this.setLocationHostButtonModel.disabled = true;
		this.controller.modelChanged(this.setLocationHostButtonModel);
	}
};

DeviceProfileAssistant.prototype.setLocationHostTap = function(event)
{
	AccountServer.setLocationHost(this.setLocationHost.bind(this), this.locationHostInputFieldModel.value);
};

DeviceProfileAssistant.prototype.setLocationHost = function(returnValue, errorText)
{
	this.setLocationHostButton.mojo.deactivate();

	if (returnValue === false) {
		this.errorMessage('<b>Service Error (setLocationHost):</b><br>'+errorText);
		this.locationHost = false;
		this.dirtyLocationHost();
		return;
	}

	this.locationHost = this.locationHostInputFieldModel.value;
	this.setLocationHostButtonModel.disabled = true;
	this.controller.modelChanged(this.setLocationHostButtonModel);
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
	this.controller.stopListening(this.locationHostInputField, Mojo.Event.propertyChange,
								  this.locationHostChangedHandler);
	this.controller.stopListening(this.setLocationHostButton,  Mojo.Event.tap,
								  this.setLocationHostTapHandler);
};

// Local Variables:
// tab-width: 4
// End:
