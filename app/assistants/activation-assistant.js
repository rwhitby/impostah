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
	{label:"United States", value:'US'},
	{label:"United Kingdom", value:'GB'},
	{label:"Canada", value:'CA'},
	{label:"France", value:'FR'},
	{label:"Germany", value:'DE'},
	// {label:"Ireland", value:'IE'},
	// {label:"Italy", value:'IT'},
	{label:"Spain", value:'ES'},
	// {label:"Mexico", value:'MX'},
				  ],
		value: 'US'
	};

	this.languageSelectorModel = {
		disabled: true,
		choices: [
	{label:"English", value:'en'},
	{label:"French", value:'fr'},
	// {label:"Italian", value:'it'},
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

	this.palmProfile = false;
	this.updateSpinner(true);
	PalmProfile.getPalmProfile(this.getPalmProfile.bind(this), false);
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
	case 'GB':
		this.overrideMcc = '234'; this.overrideMnc = '10';
		break;
	case 'CA':
		this.overrideMcc = '302'; this.overrideMnc = '720';
		break;
	case 'FR':
		this.overrideMcc = '208'; this.overrideMnc = '10';
		break;
	case 'DE':
		this.overrideMcc = '262'; this.overrideMnc = '07';
		break;
	case 'ES':
		this.overrideMcc = '214'; this.overrideMnc = '07';
		break;
	default:
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
				// "HPSerialNumber": this.deviceProfile.HPSerialNumber,
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
				"homeMcc": this.overrideMcc || this.deviceProfile.homeMcc,
				"homeMnc": this.overrideMnc || this.deviceProfile.homeMnc,
				"currentMcc": this.overrideMcc || this.deviceProfile.currentMcc,
				"currentMnc": this.overrideMnc || this.deviceProfile.currentMnc,
				// "productSku": this.deviceProfile.productSku
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
				"country": this.countrySelectorModel.value
			},
			"password": this.passwordInputFieldModel.value,
			"device": {
				"serialNumber": this.deviceProfile.serialNumber,
				// "HPSerialNumber": this.deviceProfile.HPSerialNumber,
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
				"homeMcc": this.overrideMcc || this.deviceProfile.homeMcc,
				"homeMnc": this.overrideMnc || this.deviceProfile.homeMnc,
				"currentMcc": this.overrideMcc || this.deviceProfile.currentMcc,
				"currentMnc": this.overrideMnc || this.deviceProfile.currentMnc,
				// "productSku": this.deviceProfile.productSku
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
