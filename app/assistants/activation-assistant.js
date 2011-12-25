function ActivationAssistant()
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
	
	this.countrySelectorModel = {
		disabled: true,
		choices: [
	{label:"Australia (Palm)", value:'AU-5'},
	{label:"Australia (Telstra)", value:'AU-24'},
	{label:"Canada (Bell)", value:'CA-0'},
	{label:"Canada (Palm)", value:'CA-5'},
	{label:"Canada (Rogers)", value:'CA-64'},
	{label:"France (Palm)", value:'FR-5'},
	{label:"France (SFR)", value:'FR-37'},
	{label:"Germany (O2)", value:'DE-56'},
	{label:"Germany (Palm)", value:'DE-5'},
	{label:"Hong Kong (CSL)", value:'HK-67'},
	{label:"Hong Kong (Palm)", value:'HK-5'},
	{label:"Ireland (O2)", value:'IE-60'},
	{label:"Ireland (Palm)", value:'IE-5'},
	{label:"Singapore (Palm)", value:'SG-5'},
	{label:"Singapore (SingTel)", value:'SG'},
	{label:"Spain (Movistar)", value:'ES-39'},
	{label:"Spain (Palm)", value:'ES-5'},
	{label:"Mexico (Palm)", value:'MX-5'},
	{label:"Mexico (Telcel)", value:'MX-10'},
	{label:"Mexico (Movistar)", value:'MX-10'},
	{label:"New Zealand (Palm)", value:'NZ-5'},
	{label:"New Zealand (Vodafone)", value:'NZ-246'},
	{label:"United Kingdom (O2)", value:'GB-46'},
	{label:"United Kingdom (Palm)", value:'GB-5'},
	{label:"United States (AT&T)", value:'US-1'},
	{label:"United States (Palm)", value:'US-5'},
	{label:"United States (Sprint)", value:'US-4'},
	{label:"United States (Verizon)", value:'US-114'},
				  ],
		value: 'US-5'
	};

	this.country = "US";

	this.languageSelectorModel = {
		disabled: true,
		choices: [
	{label:"English", value:'en'},
	{label:"French", value:'fr'},
	{label:"Italian", value:'it'},
	{label:"German", value:'de'},
	{label:"Spanish", value:'es'},
				  ],
		value: 'en'
	};

	this.emailInputFieldModel = {
		label: $L("Email Address"),
		value: '',
		disabled: true
	};

	this.passwordInputFieldModel = {
		label: $L("Password"),
		value: '',
		disabled: true
	};

	this.loginToProfileButtonModel = {
		label: $L("Login To Profile"),
		disabled: true
	};

	this.createNewProfileButtonModel = {
		label: $L("Create New Profile"),
		disabled: true
	};

	this.deviceId = false;
	this.deviceProfile = false;
	this.locationHost = false;
	this.accountServerUrl = false;
	this.palmProfile = false;

	this.overrideMcc = false;
	this.overrideMnc = false;
	this.authenticationInfo = false;

	this.requestPalmService = false;
	this.requestWebService = false;
};

ActivationAssistant.prototype.setup = function()
{
	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	// get elements
	this.overlay = this.controller.get('overlay'); this.overlay.hide();
	this.spinnerElement = this.controller.get('spinner');
	this.languageSelector = this.controller.get('languageSelector');
	this.countrySelector = this.controller.get('countrySelector');
	this.emailInputField = this.controller.get('emailInputField');
	this.passwordInputField = this.controller.get('passwordInputField');
	this.loginToProfileButton = this.controller.get('loginToProfileButton');
	this.createNewProfileButton = this.controller.get('createNewProfileButton');
	
	// setup back tap
	this.backElement = this.controller.get('icon');
	this.backTapHandler = this.backTap.bindAsEventListener(this);
	this.controller.listen(this.backElement,  Mojo.Event.tap, this.backTapHandler);
	
	// setup handlers
	this.countryChangedHandler = this.countryChanged.bindAsEventListener(this);
	this.emailChangedHandler = this.emailChanged.bindAsEventListener(this);
	this.passwordChangedHandler = this.passwordChanged.bindAsEventListener(this);
	this.loginToProfileTapHandler = this.loginToProfileTap.bindAsEventListener(this);
	this.authenticateFromDeviceHandler = this.authenticateFromDevice.bind(this);
	this.loginToProfileHandler =	this.loginToProfile.bindAsEventListener(this);
	this.authenticationUpdateHandler =	this.authenticationUpdate.bindAsEventListener(this);
	this.viewAuthenticationInfoHandler =	this.viewAuthenticationInfo.bind(this);
	this.createNewProfileTapHandler = this.createNewProfileTap.bindAsEventListener(this);
	this.createDeviceAccountHandler = this.createDeviceAccount.bind(this);
	this.createNewProfileHandler =	this.createNewProfile.bindAsEventListener(this);
	
	// setup wigets
	this.spinnerModel = {spinning: true};
	this.controller.setupWidget('spinner', {spinnerSize: 'large'}, this.spinnerModel);
	this.controller.setupWidget('countrySelector', { label: $L("Country") }, this.countrySelectorModel);
	this.controller.listen(this.countrySelector, Mojo.Event.propertyChange, this.countryChangedHandler);
	this.controller.setupWidget('languageSelector', { label: $L("Language") }, this.languageSelectorModel);
	this.controller.setupWidget('emailInputField', {
			autoReplace: false,
				hintText: 'Enter email address ...',
				changeOnKeyPress: true,
				'textCase':Mojo.Widget.steModeLowerCase,
				focusMode: Mojo.Widget.focusSelectMode },
		this.emailInputFieldModel);
	this.controller.listen(this.emailInputField, Mojo.Event.propertyChange, this.emailChangedHandler);
	this.controller.setupWidget('passwordInputField', {
			autoReplace: false,
				hintText: 'Enter password ...',
				changeOnKeyPress: true,
				'textCase':Mojo.Widget.steModeLowerCase,
				focusMode: Mojo.Widget.focusSelectMode },
		this.passwordInputFieldModel);
	this.controller.listen(this.passwordInputField, Mojo.Event.propertyChange, this.passwordChangedHandler);
	this.controller.setupWidget('loginToProfileButton', { type: Mojo.Widget.activityButton },
								this.loginToProfileButtonModel);
	this.controller.listen(this.loginToProfileButton, Mojo.Event.tap, this.loginToProfileTapHandler);
	this.controller.setupWidget('createNewProfileButton', { type: Mojo.Widget.activityButton },
								this.createNewProfileButtonModel);
	this.controller.listen(this.createNewProfileButton, Mojo.Event.tap, this.createNewProfileTapHandler);
}

ActivationAssistant.prototype.activate = function()
{
	this.deviceId = false;
	this.deviceProfile = false;
	this.updateSpinner(true);
	DeviceProfile.getDeviceId(this.getDeviceId.bind(this), false);
};

ActivationAssistant.prototype.getDeviceId = function(returnValue, deviceId, errorText)
{
	this.updateSpinner(false);

	if (returnValue === false) {
		this.errorMessage('<b>Service Error (getDeviceId):</b><br>'+errorText);
		return;
	}

	this.deviceId = deviceId;

	this.deviceProfile = false;
	this.updateSpinner(true);
	DeviceProfile.getDeviceProfile(this.getDeviceProfile.bind(this), false);
};

ActivationAssistant.prototype.getDeviceProfile = function(returnValue, deviceProfile, errorText)
{
	this.updateSpinner(false);

	if (returnValue === false) {
		this.errorMessage('<b>Service Error (getDeviceProfile):</b><br>'+errorText);
		return;
	}

	this.deviceProfile = deviceProfile;

	if (this.deviceProfile) {
		this.countrySelectorModel.disabled = false;
		this.controller.modelChanged(this.countrySelectorModel);
		this.languageSelectorModel.disabled = false;
		this.controller.modelChanged(this.languageSelectorModel);
		this.emailInputFieldModel.disabled = false;
		this.controller.modelChanged(this.emailInputFieldModel);
		if (this.emailInputFieldModel.value != '') {
			this.passwordInputFieldModel.disabled = false;
			this.controller.modelChanged(this.passwordInputFieldModel);
			if (this.passwordInputFieldModel.value != '') {
				this.loginToProfileButtonModel.disabled = false;
				this.controller.modelChanged(this.loginToProfileButtonModel);
				this.createNewProfileButtonModel.disabled = false;
				this.controller.modelChanged(this.createNewProfileButtonModel);
			}
		}
	}

	this.locationHost = false;
	this.updateSpinner(true);
	AccountServer.getLocationHost(this.getLocationHost.bind(this), false);
};

ActivationAssistant.prototype.getLocationHost = function(returnValue, locationHost, errorText)
{
	this.updateSpinner(false);

	if (returnValue === false) {
		this.errorMessage('<b>Service Error (getLocationHost):</b><br>'+errorText);
		return;
	}

	this.locationHost = locationHost;

	if (this.locationHost) {
		this.accountServerUrl = false;
		this.updateSpinner(true);
		AccountServer.getAccountServerUrl(this.getAccountServerUrl.bind(this), false);
	}
	else {
		this.locationHost = "ps.palmws.com";
		this.updateSpinner(true);
		AccountServer.setLocationHost(this.setLocationHost.bind(this), this.locationHost);
	}
};

ActivationAssistant.prototype.setLocationHost = function(returnValue, errorText)
{
	this.updateSpinner(false);

	if (returnValue === false) {
		this.errorMessage('<b>Service Error (setLocationHost):</b><br>'+errorText);
		return;
	}

	this.accountServerUrl = false;
	this.updateSpinner(true);
	AccountServer.getAccountServerUrl(this.getAccountServerUrl.bind(this), false);
};

ActivationAssistant.prototype.getAccountServerUrl = function(returnValue, accountServerUrl, errorText)
{
	this.updateSpinner(false);

	if (returnValue === false) {
		this.errorMessage('<b>Service Error (getAccountServerUrl):</b><br>'+errorText);
		return;
	}

	this.accountServerUrl = accountServerUrl;

	if (this.accountServerUrl) {
		this.palmProfile = false;
		this.updateSpinner(true);
		PalmProfile.getPalmProfile(this.getPalmProfile.bind(this), false);
	}
	else {
		this.accountServerUrl = "https://" + this.locationHost + "/palmcsext/services/deviceJ/";
		this.palmProfile = false;
		this.updateSpinner(true);
		PalmProfile.getPalmProfile(this.getPalmProfile.bind(this), false);
	}
};

ActivationAssistant.prototype.getPalmProfile = function(returnValue, palmProfile, errorText)
{
	this.updateSpinner(false);

	if (returnValue === false) {
		this.errorMessage('<b>Service Error (getPalmProfile):</b><br>'+errorText);
		return;
	}

	this.palmProfile = palmProfile;

	if (this.palmProfile) {
		this.emailInputFieldModel.disabled = false;
		if (this.emailInputFieldModel.value == '') {
			this.emailInputFieldModel.value = this.palmProfile.alias;
		}
		this.controller.modelChanged(this.emailInputFieldModel);
		if (this.emailInputFieldModel.value != '') {
			this.passwordInputFieldModel.disabled = false;
			this.controller.modelChanged(this.passwordInputFieldModel);
			if (this.passwordInputFieldModel.value != '') {
				this.loginToProfileButtonModel.disabled = false;
				this.controller.modelChanged(this.loginToProfileButtonModel);
				this.createNewProfileButtonModel.disabled = false;
				this.controller.modelChanged(this.createNewProfileButtonModel);
			}
		}
	}
};

ActivationAssistant.prototype.countryChanged = function(event)
{
	var country = event.value;

	switch (country) {
	case 'AU-5':
		this.country = "AU";
		this.overrideMcc = false; this.overrideMnc = false;
		break;
	case 'AU-24':
		this.country = "AU";
		this.overrideMcc = '505'; this.overrideMnc = '01';
		break;
	case 'CA-5':
		this.country = "CA";
		this.overrideMcc = false; this.overrideMnc = false;
		break;
	case 'CA-0':
		this.country = "CA";
		this.overrideMcc = '302'; this.overrideMnc = '610';
		break;
	case 'CA-64':
		this.country = "CA";
		this.overrideMcc = '302'; this.overrideMnc = '720';
		break;
	case 'FR-5':
		this.country = "FR";
		this.overrideMcc = false; this.overrideMnc = false;
		break;
	case 'FR-37':
		this.country = "FR";
		this.overrideMcc = '208'; this.overrideMnc = '10';
		break;
	case 'DE-5':
		this.country = "DE";
		this.overrideMcc = false; this.overrideMnc = false;
		break;
	case 'DE-56':
		this.country = "DE";
		this.overrideMcc = '262'; this.overrideMnc = '07';
		break;
	case 'ES-5':
		this.country = "ES";
		this.overrideMcc = false; this.overrideMnc = false;
		break;
	case 'ES-39':
		this.country = "ES";
		this.overrideMcc = '214'; this.overrideMnc = '07';
		break;
	case 'GB-5':
		this.country = "GB";
		this.overrideMcc = false; this.overrideMnc = false;
		break;
	case 'GB-46':
		this.country = "GB";
		this.overrideMcc = '234'; this.overrideMnc = '10';
		break;
	case 'HK-5':
		this.country = "HK";
		this.overrideMcc = false; this.overrideMnc = false;
		break;
	case 'HK-67':
		this.country = "HK";
		this.overrideMcc = '454'; this.overrideMnc = '00';
		break;
	case 'IE-5':
		this.country = "IE";
		this.overrideMcc = false; this.overrideMnc = false;
		break;
	case 'IE-60':
		this.country = "IE";
		this.overrideMcc = '272'; this.overrideMnc = '02';
		break;
	case 'MX-5':
		this.country = "MX";
		this.overrideMcc = false; this.overrideMnc = false;
		break;
	case 'MX-10':
		this.country = "MX";
		this.overrideMcc = '334'; this.overrideMnc = '20';
		break;
	case 'NZ-5':
		this.country = "NZ";
		this.overrideMcc = false; this.overrideMnc = false;
		break;
	case 'NZ-246':
		this.country = "NZ";
		this.overrideMcc = '530'; this.overrideMnc = '01';
		break;
	case 'SG-5':
		this.country = "SG";
		this.overrideMcc = false; this.overrideMnc = false;
		break;
	case 'SG':
		this.country = "SG";
		this.overrideMcc = '525'; this.overrideMnc = '01';
		break;
	case 'US-1':
		this.country = "US";
		this.overrideMcc = "310"; this.overrideMnc = "410";
		break;
	case 'US-4':
		this.country = "US";
		this.overrideMcc = false; this.overrideMnc = false;
		break;
	case 'US-5':
		this.country = "US";
		this.overrideMcc = false; this.overrideMnc = false;
		break;
	case 'US-114':
		this.country = "US";
		this.overrideMcc = false; this.overrideMnc = false;
		break;
	default:
		this.country = country;
		this.overrideMcc = false; this.overrideMnc = false;
		break;
	}
};

ActivationAssistant.prototype.emailChanged = function(event)
{
	if (event.value != '') {
		this.passwordInputFieldModel.disabled = false;
		this.controller.modelChanged(this.passwordInputFieldModel);
		if (this.passwordInputFieldModel.value != '') {
			this.loginToProfileButtonModel.disabled = false;
			this.controller.modelChanged(this.loginToProfileButtonModel);
			this.createNewProfileButtonModel.disabled = false;
			this.controller.modelChanged(this.createNewProfileButtonModel);
		}
	}
	else {
		this.passwordInputFieldModel.disabled = true;
		this.controller.modelChanged(this.passwordInputFieldModel);
		this.loginToProfileButtonModel.disabled = true;
		this.controller.modelChanged(this.loginToProfileButtonModel);
		this.createNewProfileButtonModel.disabled = true;
		this.controller.modelChanged(this.createNewProfileButtonModel);
	}
};

ActivationAssistant.prototype.passwordChanged = function(event)
{
	if (event.value != '') {
		this.loginToProfileButtonModel.disabled = false;
		this.controller.modelChanged(this.loginToProfileButtonModel);
		this.createNewProfileButtonModel.disabled = false;
		this.controller.modelChanged(this.createNewProfileButtonModel);
	}
	else {
		this.loginToProfileButtonModel.disabled = true;
		this.controller.modelChanged(this.loginToProfileButtonModel);
		this.createNewProfileButtonModel.disabled = true;
		this.controller.modelChanged(this.createNewProfileButtonModel);
	}
};

ActivationAssistant.prototype.loginToProfileTap = function(event)
{
	this.overlay.show();

	this.controller.showAlertDialog({
			allowHTMLMessage:	true,
			title:				'Login To Profile',
			message:			"Are you sure? This will replace any current Palm Profile on your device, which may have an unknown impact on your apps and data in your Palm Profile.",
			choices:			[{label:$L("Login To Profile"), value:'login', type:'affirmative'},{label:$L("Cancel"), value:'cancel', type:'negative'}],
			onChoose:			this.authenticateFromDeviceHandler
		});
};

ActivationAssistant.prototype.authenticateFromDevice = function(value)
{
	if (value != "login") {
		this.overlay.hide();
		this.loginToProfileButton.mojo.deactivate();
		return;
	}
	
	this.authenticationInfo = false;

	var callback = this.loginToProfileHandler;

	var url = this.accountServerUrl+"authenticateFromDevice";
	var body = {
		"InAuthenticateFromDevice": {
			"application": "ASClient",
			"accountAlias": this.emailInputFieldModel.value,
			"password": this.passwordInputFieldModel.value,
			"device": {
				"serialNumber": this.deviceProfile.serialNumber,
				"carrier": this.deviceProfile.carrier,
				"dataNetwork": this.deviceProfile.dataNetwork,
				"deviceID": this.deviceId,
				"phoneNumber": this.deviceProfile.phoneNumber,
				"nduID": this.deviceProfile.nduId,
				"deviceModel": this.deviceProfile.deviceModel,
				"firmwareVersion": this.deviceProfile.firmwareVersion,
				"network": this.deviceProfile.network,
				"platform": this.deviceProfile.platform,
				"macAddress": this.deviceProfile.macAddress,
			},
			"romToken": {
				"buildVariant": this.deviceProfile.dmSets,
				"serverAuthType": this.deviceProfile.serverAuthType,
				"serverPwd": this.deviceProfile.serverPwd,
				"serverNonce": this.deviceProfile.serverNonce,
				"clientCredential": this.deviceProfile.clientCredential,
				"clientPwd": this.deviceProfile.clientPwd,
				"clientNonce": this.deviceProfile.clientNonce,
				"softwareBuildBranch": this.deviceProfile.softwareBuildBranch,
				"swUpdateTarget": this.deviceProfile.swUpdateTarget,
				"softwareBuildNumber": this.deviceProfile.softwareVersion
			}
		}
	};

	if (this.overrideMcc && this.overrideMnc) {
		body.InAuthenticateFromDevice.device.homeMcc = this.overrideMcc;
		body.InAuthenticateFromDevice.device.homeMnc = this.overrideMnc;
		body.InAuthenticateFromDevice.device.currentMcc = this.overrideMcc;
		body.InAuthenticateFromDevice.device.currentMnc = this.overrideMnc;
	}

	if (this.deviceProfile.hardwareType == "topaz") {
		body.InAuthenticateFromDevice.device.HPSerialNumber = this.deviceProfile.HPSerialNumber;
		body.InAuthenticateFromDevice.device.productSku = this.deviceProfile.productSku;
	}

	Mojo.Log.warn("request %j", body);

	this.requestWebService = new Ajax.Request(url, {
			method: 'POST',
			contentType: 'application/json',
			postBody: Object.toJSON(body),
			evalJSON: 'force',
			onSuccess: function(response) {
				response = response.responseJSON;
				Mojo.Log.warn("onSuccess %j", response);
				if (!response) {
					callback({"returnValue":true}); // Empty replies are okay
				}
				else {
					var exception = response.JSONException;
					if (exception) {
						Mojo.Log.error("CatalogServer._callServer %j", exception);
						callback({"returnValue":false, "errorText":Object.toJSON(exception)});
					}
					else {
						callback({"returnValue":true, "response":response});
					}
				}
			},
			onFailure: function(response) {
				Mojo.Log.warn("onFailure %j", response);
				if (response.responseJSON && response.responseJSON.JSONException) {
					callback({"returnValue":false, "errorText":Object.toJSON(response.responseJSON.JSONException)});
				}
				else {
					callback({"returnValue":false, "errorText":response.status});
				}
			},
			on0: function(response) {
				Mojo.Log.warn("on0 %j", response);
				callback({"returnValue":false, "errorText":response.status});
			}
	});
};

ActivationAssistant.prototype.loginToProfile = function(payload)
{
	this.requestWebService = false;

	this.loginToProfileButton.mojo.deactivate();

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (authenticateFromDevice):</b><br>'+payload.errorText);
		this.overlay.hide();
		return;
	}

	if (payload.response.AuthenticateInfoEx) {
		var info = payload.response.AuthenticateInfoEx;
		this.updateAuthentication(info);
	}
	else {
		this.errorMessage('<b>Service Error (authenticateFromDevice):</b><br>Empty authentication response');
		this.overlay.hide();
		return;
	}
};

ActivationAssistant.prototype.updateAuthentication = function(info)
{
	this.authenticationInfo = info;

	if (Mojo.Environment.DeviceInfo.platformVersionMajor == 1) {
		this.controller.showAlertDialog({
				allowHTMLMessage:	true,
				preventCancel:		true,
				title:				'Run First Use App',
				message:			'Impostah cannot update the Palm Profile on webOS 1.x - you must now login using the First Use application.',
				choices:			[{label:$L("Ok"), value:'ok'}],
				onChoose:			function(e) { this.authenticationUpdate({returnValue: true}) }
			});
	}
	else {
		if (this.palmProfile) {
			this.requestPalmService = ImpostahService.impersonate(this.authenticationUpdateHandler,
																  "com.palm.configurator", "com.palm.db",
																  "merge", {
																	  "objects" : [
			{ "_id": "com.palm.palmprofile.token", "_kind": "com.palm.palmprofile:1",
			  "accountServerUrl": this.accountServerUrl, "accountExpirationTime": "",
			  "alias": info.accountAlias, "authenticatedTime": info.authenticationTime,
			  "jabberId": info.jabberId, "phoneNumber": "", "state": info.accountState,
			  "token": info.token, "tokenexpireTime": info.expirationTime,
			  "uniqueId": info.uniqueId }
																				   ]
																  });
		}
		else {
			this.requestPalmService = ImpostahService.impersonate(this.authenticationUpdateHandler,
																  "com.palm.configurator", "com.palm.db",
																  "put", {
																	  "objects" : [
			{ "_id": "com.palm.palmprofile.token", "_kind": "com.palm.palmprofile:1",
			  "accountServerUrl": this.accountServerUrl, "accountExpirationTime": "",
			  "alias": info.accountAlias, "authenticatedTime": info.authenticationTime,
			  "jabberId": info.jabberId, "phoneNumber": "", "state": info.accountState,
			  "token": info.token, "tokenexpireTime": info.expirationTime,
			  "uniqueId": info.uniqueId }
																				   ]
																  });
		}
	}
};

ActivationAssistant.prototype.authenticationUpdate = function(payload)
{
	if (this.requestPalmService) this.requestPalmService.cancel();
	this.requestPalmService = false;

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (setPalmProfile):</b><br>'+payload.errorText);
		this.overlay.hide();
		this.loginToProfileButton.mojo.deactivate();
		return;
	}

	this.controller.showAlertDialog({
			allowHTMLMessage:	true,
			title:				'Success',
			choices:			[{label:$L("View Authentication Info"), value:'view', type:'affirmative'},{label:$L("Done"), value:'done'}],
			onChoose:			this.viewAuthenticationInfoHandler
		});

	this.overlay.hide();
};

ActivationAssistant.prototype.viewAuthenticationInfo = function(value)
{
	if (value == "view") {
		this.controller.stageController.pushScene("item", "Palm Profile", this.authenticationInfo,
												  'com.palm.palmprofile.token', false);
	}

	this.palmProfile = false;
	this.updateSpinner(true);
	PalmProfile.getPalmProfile(this.getPalmProfile.bind(this), true);
};

ActivationAssistant.prototype.createNewProfileTap = function(event)
{
	this.overlay.show();

	this.controller.showAlertDialog({
			allowHTMLMessage:	true,
			title:				'Create New Profile',
			message:			"Are you sure? This will replace any current Palm Profile on your device, which may have an unknown impact on your apps and data in your Palm Profile.",
			choices:			[{label:$L("Create New Profile"), value:'create', type:'affirmative'},{label:$L("Cancel"), value:'cancel', type:'negative'}],
			onChoose:			this.createDeviceAccountHandler
		});
};

ActivationAssistant.prototype.createDeviceAccount = function(value)
{
	if (value != "create") {
		this.overlay.hide();
		this.createNewProfileButton.mojo.deactivate();
		return;
	}

	this.authenticationInfo = false;

	var callback = this.createNewProfileHandler;

	var url = this.accountServerUrl+"createDeviceAccount";
	var body = {
		"InCreateDeviceAccount": {
			"account": {
				"email": this.emailInputFieldModel.value,
				"firstName": "Impostah",
				"lastName": "User",
				"language": this.languageSelectorModel.value,
				"country": this.country
			},
			"password": this.passwordInputFieldModel.value,
			"device": {
				"serialNumber": this.deviceProfile.serialNumber,
				"carrier": this.deviceProfile.carrier,
				"dataNetwork": this.deviceProfile.dataNetwork,
				"deviceID": this.deviceId,
				"phoneNumber": this.deviceProfile.phoneNumber,
				"nduID": this.deviceProfile.nduId,
				"deviceModel": this.deviceProfile.deviceModel,
				"firmwareVersion": this.deviceProfile.firmwareVersion,
				"network": this.deviceProfile.network,
				"platform": this.deviceProfile.platform,
				"macAddress": this.deviceProfile.macAddress
			},
			"romToken": {
				"buildVariant": this.deviceProfile.dmSets,
				"serverAuthType": this.deviceProfile.serverAuthType,
				"serverPwd": this.deviceProfile.serverPwd,
				"serverNonce": this.deviceProfile.serverNonce,
				"clientCredential": this.deviceProfile.clientCredential,
				"clientPwd": this.deviceProfile.clientPwd,
				"clientNonce": this.deviceProfile.clientNonce,
				"softwareBuildBranch": this.deviceProfile.softwareBuildBranch,
				"swUpdateTarget": this.deviceProfile.swUpdateTarget,
				"softwareBuildNumber": this.deviceProfile.softwareVersion
			}
		}
	};

	if (this.overrideMcc && this.overrideMnc) {
		body.InCreateDeviceAccount.device.homeMcc = this.overrideMcc;
		body.InCreateDeviceAccount.device.homeMnc = this.overrideMnc;
		body.InCreateDeviceAccount.device.currentMcc = this.overrideMcc;
		body.InCreateDeviceAccount.device.currentMnc = this.overrideMnc;
	}

	if (this.deviceProfile.hardwareType == "topaz") {
		body.InCreateDeviceAccount.device.HPSerialNumber = this.deviceProfile.HPSerialNumber;
		body.InCreateDeviceAccount.device.productSku = this.deviceProfile.productSku;
	}

	Mojo.Log.warn("request %j", body);

	this.requestWebService = new Ajax.Request(url, {
			method: 'POST',
			contentType: 'application/json',
			postBody: Object.toJSON(body),
			evalJSON: 'force',
			onSuccess: function(response) {
				response = response.responseJSON;
				Mojo.Log.warn("onSuccess %j", response);
				if (!response) {
					callback({"returnValue":true}); // Empty replies are okay
				}
				else {
					var exception = response.JSONException;
					if (exception) {
						Mojo.Log.error("CatalogServer._callServer %j", exception);
						callback({"returnValue":false, "errorText":Object.toJSON(exception)});
					}
					else {
						callback({"returnValue":true, "response":response});
					}
				}
			},
			onFailure: function(response) {
				Mojo.Log.warn("onFailure %j", response);
				if (response.responseJSON && response.responseJSON.JSONException) {
					callback({"returnValue":false, "errorText":Object.toJSON(response.responseJSON.JSONException)});
				}
				else {
					callback({"returnValue":false, "errorText":response.status});
				}
			},
			on0: function(response) {
				Mojo.Log.warn("on0 %j", response);
				callback({"returnValue":false, "errorText":response.status});
			}
	});
};

ActivationAssistant.prototype.createNewProfile = function(payload)
{
	this.requestWebService = false;

	this.createNewProfileButton.mojo.deactivate();

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (createDeviceAccount):</b><br>'+payload.errorText);
		this.overlay.hide();
		return;
	}

	if (payload.response.AuthenticateInfoEx) {
		var info = payload.response.AuthenticateInfoEx;
		this.updateAuthentication(info);
	}
	else {
		this.errorMessage('<b>Service Error (createDeviceAccount):</b><br>Empty authentication response');
		this.overlay.hide();
		return;
	}
};

ActivationAssistant.prototype.updateSpinner = function(active)
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

ActivationAssistant.prototype.errorMessage = function(msg)
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

ActivationAssistant.prototype.backTap = function(event)
{
	this.controller.stageController.popScene();
};

ActivationAssistant.prototype.handleCommand = function(event)
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

ActivationAssistant.prototype.cleanup = function(event)
{
	this.controller.stopListening(this.backElement,  Mojo.Event.tap,
								  this.backTapHandler);
	this.controller.stopListening(this.countrySelector, Mojo.Event.propertyChange,
								  this.countryChangedHandler);
	this.controller.stopListening(this.emailInputField, Mojo.Event.propertyChange,
								  this.emailChangedHandler);
	this.controller.stopListening(this.passwordInputField, Mojo.Event.propertyChange,
								  this.passwordChangedHandler);
	this.controller.stopListening(this.loginToProfileButton,  Mojo.Event.tap,
								  this.loginToProfileTapHandler);
	this.controller.stopListening(this.createNewProfileButton,  Mojo.Event.tap,
								  this.createNewProfileTapHandler);
};

// Local Variables:
// tab-width: 4
// End:
