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

	this.deviceImpersonationSelectorModel = {
		disabled: true,
		choices: [
				  //	{label:"NA Pre (Sprint)",		value:'P100EWW/Sprint'},
				  //	{label:"NA Pre (Bell)",			value:'P100EWW/Bell'},
				  //	{label:"NA Pre (ROW)",			value:'P100UNA/ROW'},
				  //	{label:"EU Pre (ROW)",			value:'P100UEU/ROW'},
				  //	{label:"NA Pre+ (AT&T)",		value:'P101UNA/ATT'},
				  //	{label:"NA Pre+ (Verizon)",		value:'P101EWW/Verizon'},
				  //	{label:"EU Pre+ (ROW)",			value:'P101UEU/ROW'},
				  //	{label:"NA Pixi (Sprint)",		value:'P120EWW/Sprint'},
				  //	{label:"NA Pixi+ (AT&T)",		value:'P121UNA/ATT'},
				  //	{label:"NA Pixi+ (Verizon)",	value:'P121UNA/Verizon'},
				  //	{label:"EU Pixi+ (ROW)",		value:'P121UEU/ROW'},
				  //	{label:"NA Pre 2 (AT&T)",		value:'P102UNA/ATT'},
				  //	{label:"NA Pre 2 (Sprint)",		value:'P102EWW/Sprint'},
				  //	{label:"NA Pre 2 (Verizon)",	value:'P102EWW/Verizon'},
				  //	{label:"NA Pre 2 (ROW)",		value:'P102UNA/ROW'},
				  //	{label:"EU Pre 2 (ROW)",		value:'P102UEU/ROW'},
				  //	{label:"NA Veer (AT&T)",		value:'P160UNA/ATT'},
				  //	{label:"NA Veer (ROW)",			value:'P160UNA/ROW'},
				  //	{label:"EU Veer (ROW)",			value:'P160UEU/ROW'},
	{label:"NA Pre 3 (AT&T)",		value:'HSTNH-F30CN/ATT'},
	{label:"NA Pre 3 (Verizon)",	value:'HSTNH-F30CV/Verizon'},
	{label:"EU Pre 3 (ROW)",		value:'HSTNH-F30CE/ROW'},
	{label:"TouchPad (WiFi)",		value:'HSTNH-I29C/'},
	{label:"TouchPad 3G (AT&T)",	value:'HSTNH-I30C/ATT'},
	//	{label:"TouchPad Go",			value:'HSTNH-I32C/'},
	{label:"SDK Emulator",			value:'/'},
				  ],
	};

	this.setDeviceImpersonationButtonModel = {
		label: $L("Set Device Impersonation"),
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

	this.chameleonIdentityInputFieldModel = {
		label: $L("Chameleon Identity"),
		value: '',
		disabled: true
	};

	this.setChameleonIdentityButtonModel = {
		label: $L("Set Chameleon Identity"),
		disabled: true
	};

	this.deviceProfile = false;
	this.reloadDeviceProfile = false;

	this.currentDevice = false;

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
	this.deviceImpersonationGroup = this.controller.get('deviceImpersonationGroup');
	this.deviceImpersonationSelector = this.controller.get('deviceImpersonationSelector');
	this.setDeviceImpersonationButton = this.controller.get('setDeviceImpersonationButton');
	this.locationHostGroup = this.controller.get('locationHostGroup');
	this.locationHostInputField = this.controller.get('locationHostInputField');
	this.setLocationHostButton = this.controller.get('setLocationHostButton');
	this.chameleonIdentityGroup = this.controller.get('chameleonIdentityGroup');
	this.chameleonIdentityInputField = this.controller.get('chameleonIdentityInputField');
	this.setChameleonIdentityButton = this.controller.get('setChameleonIdentityButton');
	
	if (Mojo.Environment.DeviceInfo.platformVersionMajor == 1) {
		this.manageOverridesButton.style.display = 'none';
		this.deviceImpersonationGroup.style.display = 'none';
		this.locationHostGroup.style.display = 'none';
		this.chameleonIdentityGroup.style.display = 'none';
	}

	// setup back tap
	this.backElement = this.controller.get('icon');
	this.backTapHandler = this.backTap.bindAsEventListener(this);
	this.controller.listen(this.backElement,  Mojo.Event.tap, this.backTapHandler);
	
	// setup handlers
	this.deviceProfileTapHandler = this.deviceProfileTap.bindAsEventListener(this);
	this.manageOverridesTapHandler = this.manageOverridesTap.bindAsEventListener(this);
	this.deviceImpersonationChangedHandler = this.deviceImpersonationChanged.bindAsEventListener(this);
	this.setDeviceImpersonationTapHandler = this.setDeviceImpersonationTap.bindAsEventListener(this);
	this.getDeviceOverridesHandler =  this.getDeviceOverrides.bindAsEventListener(this);
	this.GetIdentityOverridesHandler =  this.GetIdentityOverrides.bindAsEventListener(this);
	this.delOverridesHandler =  this.delOverrides.bindAsEventListener(this);
	this.putOverridesHandler =  this.putOverrides.bindAsEventListener(this);
	this.locationHostChangedHandler = this.locationHostChanged.bindAsEventListener(this);
	this.setLocationHostTapHandler = this.setLocationHostTap.bindAsEventListener(this);
	this.chameleonIdentityChangedHandler = this.chameleonIdentityChanged.bindAsEventListener(this);
	this.setChameleonIdentityTapHandler = this.setChameleonIdentityTap.bindAsEventListener(this);
	
	// setup wigets
	this.spinnerModel = {spinning: true};
	this.controller.setupWidget('spinner', {spinnerSize: 'large'}, this.spinnerModel);
	this.controller.setupWidget('deviceProfileButton', { }, this.deviceProfileButtonModel);
	this.controller.listen(this.deviceProfileButton,  Mojo.Event.tap, this.deviceProfileTapHandler);
	this.controller.setupWidget('manageOverridesButton', { }, this.manageOverridesButtonModel);
	this.controller.listen(this.manageOverridesButton,  Mojo.Event.tap, this.manageOverridesTapHandler);
	this.controller.setupWidget('deviceImpersonationSelector', { label: $L("Device") }, this.deviceImpersonationSelectorModel);
	this.controller.listen(this.deviceImpersonationSelector, Mojo.Event.propertyChange, this.deviceImpersonationChangedHandler);
	this.controller.setupWidget('setDeviceImpersonationButton', { type: Mojo.Widget.activityButton }, this.setDeviceImpersonationButtonModel);
	this.controller.listen(this.setDeviceImpersonationButton,  Mojo.Event.tap, this.setDeviceImpersonationTapHandler);
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
	this.controller.setupWidget('chameleonIdentityInputField', {
			autoReplace: false,
				hintText: 'Enter chameleon identity ...',
				changeOnKeyPress: true,
				'textCase':Mojo.Widget.steModeLowerCase,
				focusMode: Mojo.Widget.focusSelectMode },
		this.chameleonIdentityInputFieldModel);
	this.controller.listen(this.chameleonIdentityInputField, Mojo.Event.propertyChange, this.chameleonIdentityChangedHandler);
	this.controller.setupWidget('setChameleonIdentityButton', { type: Mojo.Widget.activityButton }, this.setChameleonIdentityButtonModel);
	this.controller.listen(this.setChameleonIdentityButton,  Mojo.Event.tap, this.setChameleonIdentityTapHandler);
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
		this.currentDevice = this.deviceProfile.deviceModel+"/"+this.deviceProfile.carrier;
		this.deviceImpersonationSelectorModel.disabled = false;
		this.deviceImpersonationSelectorModel.value = this.currentDevice;
		this.controller.modelChanged(this.deviceImpersonationSelectorModel);
		this.chameleonIdentityInputFieldModel.disabled = false;
		this.controller.modelChanged(this.chameleonIdentityInputFieldModel);
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
	else {
		this.locationHost = "ps.palmws.com";
		this.updateSpinner(true);
		AccountServer.setLocationHost(this.initLocationHost.bind(this), this.locationHost);
	}
};

DeviceProfileAssistant.prototype.initLocationHost = function(returnValue, errorText)
{
	if (returnValue === false) {
		this.errorMessage('<b>Service Error (setLocationHost):</b><br>'+errorText);
		this.updateSpinner(false);
		return;
	}

	AccountServer.getLocationHost(this.getLocationHost.bind(this), this.reloadLocationHost);
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

DeviceProfileAssistant.prototype.deviceImpersonationChanged = function(event)
{
	if (event.value != this.currentDevice) {
		this.setDeviceImpersonationButtonModel.disabled = false;
		this.controller.modelChanged(this.setDeviceImpersonationButtonModel);
	}
	else {
		this.setDeviceImpersonationButtonModel.disabled = true;
		this.controller.modelChanged(this.setDeviceImpersonationButtonModel);
	}
};

DeviceProfileAssistant.prototype.setDeviceImpersonationTap = function(event)
{
	this.updateSpinner(true);

	this.dirtyDeviceProfile();
	
	if (this.requestDb8) this.requestDb8.cancel();
	this.requestDb8 = new Mojo.Service.Request("palm://com.palm.db/", {
			method: "get",
			parameters: {
				"ids" : ['org.webosinternals.impostah.deviceprofile']
			},
			onSuccess: this.getDeviceOverridesHandler,
			onFailure: this.getDeviceOverridesHandler
		});
};

DeviceProfileAssistant.prototype.getDeviceOverrides = function(payload)
{
	if (this.requestDb8) this.requestDb8.cancel();
	this.requestDb8 = false;

	this.updateSpinner(false);

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (getDeviceOverrides):</b><br>'+payload.errorText);
		return;
	}

	if (payload.results && (payload.results.length == 1)) {
		this.overrides = payload.results[0];
		delete this.overrides["_rev"];
		delete this.overrides["_sync"];
		if (this.overrides["_del"] == true) {
			this.overrides = {
				"_id":'org.webosinternals.impostah.deviceprofile',
				"_kind":"org.webosinternals.impostah:1"
			}
		}
	}
	else {
		this.overrides = {
			"_id":'org.webosinternals.impostah.deviceprofile',
			"_kind":"org.webosinternals.impostah:1"
		}
	}

	this.currentDevice = this.deviceImpersonationSelectorModel.value;
	var model = this.currentDevice.split("/")[0];
	var carrier = this.currentDevice.split("/")[1];

	this.overrides['deviceModel'] = model;
	this.overrides['carrier'] = carrier;

	switch (this.currentDevice) {
	case "P100EWW/Sprint":
		break;
	case "P100EWW/Bell":
		break;
	case "P100UNA/ROW":
		break;
	case "P100UEU/ROW":
		break;
	case "P101UNA/ATT":
		break;
	case "P101EWW/Verizon":
		break;
	case "P101UEU/ROW":
		break;
	case "P120EWW/Sprint":
		break;
	case "P121UNA/ATT":
		break;
	case "P121UNA/Verizon":
		break;
	case "P121UEU/ROW":
		break;
	case "P102UNA/ATT":
		break;
	case "P102EWW/Sprint":
		break;
	case "P102EWW/Verizon":
		break;
	case "P102UNA/ROW":
		break;
	case "P102UEU/ROW":
		break;
	case "P160UNA/ATT":
		break;
	case "P160UNA/ROW":
		break;
	case "P160UEU/ROW":
		break;
	case "HSTNH-F30CN/ATT":
		this.overrides['carrierROM'] = "Nova-ATT-Mantaray-2207";
		this.overrides['network'] = "gsm";
		this.overrides['dataNetwork'] = "gsm,edge,umts,hsdpa";
		this.overrides['softwareVersion'] = "Nova-ATT-Mantaray-2207";
		this.overrides['hardwareType'] = "mantaray";
		this.overrides['dmSets'] = '{"sets":"2175","2179"}';
		this.overrides['softwareBuildBranch'] = "HP webOS 2.2.3";
		break;
	case "HSTNH-F30CV/Verizon":
		this.overrides['carrierROM'] = "Nova-Verizon-Mantaray-1217";
		this.overrides['network'] = "gsm";
		this.overrides['dataNetwork'] = "gsm,edge,umts,hsdpa";
		this.overrides['softwareVersion'] = "Nova-Verizon-Mantaray-1217";
		this.overrides['hardwareType'] = "mantaray";
		this.overrides['dmSets'] = '{"sets":"2167","2171"}';
		this.overrides['softwareBuildBranch'] = "HP webOS 2.2.3";
		break;
	case "HSTNH-F30CE/ROW":
		this.overrides['carrierROM'] = "Nova-WR-Mantaray-3171";
		this.overrides['network'] = "gsm";
		this.overrides['dataNetwork'] = "gsm,edge,umts,hsdpa";
		this.overrides['softwareVersion'] = "Nova-WR-Mantaray-3171";
		this.overrides['hardwareType'] = "mantaray";
		this.overrides['dmSets'] = '{"sets":"2191","2195"}';
		this.overrides['softwareBuildBranch'] = "HP webOS 2.2.0";
		break;
	case "HSTNH-I29C/":
		this.overrides['deviceId'] = "";
		this.overrides['carrierROM'] = "Nova-HP-Topaz-77";
		this.overrides['network'] = "none";
		this.overrides['dataNetwork'] = "unknown";
		this.overrides['softwareVersion'] = "Nova-HP-Topaz-77";
		this.overrides['hardwareType'] = "topaz";
		this.overrides['dmSets'] = '{"sets":"2151","2155"}';
		this.overrides['softwareBuildBranch'] = "HP webOS 3.0.4";
		this.overrides['HPSerialNumber'] = "180-10871-01";
		this.overrides['productSku'] = "FB359UA#ABA";
		break;
	case "HSTNH-I30C/ATT":
		this.overrides['carrierROM'] = "Nova-ATT-Topaz-78";
		this.overrides['network'] = "gsm";
		this.overrides['dataNetwork'] = "gsm,edge,umts,hsdpa";
		this.overrides['softwareVersion'] = "Nova-ATT-Topaz-78";
		this.overrides['hardwareType'] = "topaz";
		this.overrides['dmSets'] = '{"sets":"2143","2147"}';
		this.overrides['softwareBuildBranch'] = "HP webOS 3.0.4";
		this.overrides['HPSerialNumber'] = "180-10874-02";
		this.overrides['productSku'] = "FB354UA#ABA";
		break;
	case "HSTNH-I32C/":
		break;
	}

	this.saveOverrides();
};

DeviceProfileAssistant.prototype.saveOverrides = function()
{
	if (this.requestDb8) this.requestDb8.cancel();
	this.requestDb8 = new Mojo.Service.Request("palm://com.palm.db/", {
			method: "del",
			parameters: {
				"ids" : ['org.webosinternals.impostah.deviceprofile'],
				"purge": true
			},
			onSuccess: this.delOverridesHandler,
			onFailure: this.delOverridesHandler
		});
};

DeviceProfileAssistant.prototype.delOverrides = function(payload)
{
	if (this.requestDb8) this.requestDb8.cancel();
	this.requestDb8 = new Mojo.Service.Request("palm://com.palm.db/", {
			method: "put",
			parameters: {
				"objects" : [this.overrides]
			},
			onSuccess: this.putOverridesHandler,
			onFailure: this.putOverridesHandler
		});
}

DeviceProfileAssistant.prototype.putOverrides = function(payload)
{
	if (this.requestDb8) this.requestDb8.cancel();
	this.requestDb8 = false;

	// Either button can trigger this path
	this.setDeviceImpersonationButton.mojo.deactivate();
	this.setChameleonIdentityButton.mojo.deactivate();

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (putOverrides):</b><br>'+payload.errorText);
		return;
	}

	this.activate();
}

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

DeviceProfileAssistant.prototype.chameleonIdentityChanged = function(event)
{
	if (event.value != '') {
		this.setChameleonIdentityButtonModel.disabled = false;
		this.controller.modelChanged(this.setChameleonIdentityButtonModel);
	}
	else {
		this.setChameleonIdentityButtonModel.disabled = true;
		this.controller.modelChanged(this.setChameleonIdentityButtonModel);
	}
};

DeviceProfileAssistant.prototype.setChameleonIdentityTap = function(event)
{
	this.updateSpinner(true);

	this.dirtyDeviceProfile();
	
	if (this.requestDb8) this.requestDb8.cancel();
	this.requestDb8 = new Mojo.Service.Request("palm://com.palm.db/", {
			method: "get",
			parameters: {
				"ids" : ['org.webosinternals.impostah.deviceprofile']
			},
			onSuccess: this.GetIdentityOverridesHandler,
			onFailure: this.GetIdentityOverridesHandler
		});
};

DeviceProfileAssistant.prototype.GetIdentityOverrides = function(payload)
{
	if (this.requestDb8) this.requestDb8.cancel();
	this.requestDb8 = false;

	this.updateSpinner(false);

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (GetIdentityOverrides):</b><br>'+payload.errorText);
		return;
	}

	if (payload.results && (payload.results.length == 1)) {
		this.overrides = payload.results[0];
		delete this.overrides["_rev"];
		delete this.overrides["_sync"];
		if (this.overrides["_del"] == true) {
			this.overrides = {
				"_id":'org.webosinternals.impostah.deviceprofile',
				"_kind":"org.webosinternals.impostah:1"
			}
		}
	}
	else {
		this.overrides = {
			"_id":'org.webosinternals.impostah.deviceprofile',
			"_kind":"org.webosinternals.impostah:1"
		}
	}

	var alphanumeric = hex_sha1(this.chameleonIdentityInputFieldModel.value);

	var numeric = '';
	for (var i = 0; i < 40; i++) {
		var char = alphanumeric.charAt(i);
		if ((char >= '0') && (char <= '9')) {
			numeric += char;
		}
	}
	numeric += "0000000";
	numeric = numeric.slice(0,7);

	this.overrides['nduId'] = alphanumeric;

	if (this.currentDevice != 'HSTNH-I29C/') {
		this.overrides['deviceId'] = 'IMEI:00440145' + numeric;
	}

	var serialNumber = this.deviceProfile.serialNumber;
	if (serialNumber && (serialNumber.length > 7)) {
		this.overrides['serialNumber'] = serialNumber.slice(0, serialNumber.length-7) + numeric;
	}
	else {
		this.overrides['serialNumber'] = "AE21P" + numeric;
	}

	this.saveOverrides();
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
	this.controller.stopListening(this.deviceImpersonationSelector, Mojo.Event.propertyChange,
								  this.deviceImpersonationChangedHandler);
	this.controller.stopListening(this.setDeviceImpersonationButton,  Mojo.Event.tap,
								  this.setDeviceImpersonationTapHandler);
	this.controller.stopListening(this.locationHostInputField, Mojo.Event.propertyChange,
								  this.locationHostChangedHandler);
	this.controller.stopListening(this.setLocationHostButton,  Mojo.Event.tap,
								  this.setLocationHostTapHandler);
	this.controller.stopListening(this.chameleonIdentityInputField, Mojo.Event.propertyChange,
								  this.chameleonIdentityChangedHandler);
	this.controller.stopListening(this.setChameleonIdentityButton,  Mojo.Event.tap,
								  this.setChameleonIdentityTapHandler);
};

// Local Variables:
// tab-width: 4
// End:
