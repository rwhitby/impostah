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
	
	this.emailInputFieldModel = {
		label: $L("Email Address"),
		value: '',
		disabled: true
	};

	this.emailAvailableButtonModel = {
		label: $L("Check Email Available"),
		disabled: true
	};

	this.deviceInUseButtonModel = {
		label: $L("Check Device In Use"),
		disabled: true
	};

	this.passwordInputFieldModel = {
		label: $L("Password"),
		value: '',
		disabled: true
	};

	this.authenticateFromDeviceButtonModel = {
		label: $L("Authenticate From Device"),
		disabled: true
	};

	this.languageSelectorModel = {
		disabled: true,
		choices: [
	{label:"English", value:'en'},
	{label:"French", value:'fr'},
	// {label:"Italian", value:'it'},
	{label:"German", value:'de'},
	// {label:"Spanish", value:'es'},
				  ],
		value: 'en'
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
	// {label:"Spain", value:'ES'},
	// {label:"Mexico", value:'MX'},
				  ],
		value: 'US'
	};

	this.createDeviceAccountButtonModel = {
		label: $L("Create Device Account"),
		disabled: true
	};

	this.deviceProfile = false;
	this.palmProfile = false;
	this.overrideMcc = false;
	this.overrideMnc = false;
	this.authenticationInfo = false;

	this.requestPalmService = false;
	this.requestWebService = false;

	// %%% FIXME %%%
	this.locationServerUrl = "https://lcn.palmws.com/location-dir/getdomain/";
	this.accountServerUrl = "https://ps.palmws.com/palmcsext/services/deviceJ/";
};

ActivationAssistant.prototype.setup = function()
{
	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	// get elements
	this.iconElement =			this.controller.get('icon');
	this.iconElement.style.display = 'none';
	this.spinnerElement = 		this.controller.get('spinner');
	this.languageSelector = this.controller.get('languageSelector');
	this.countrySelector = this.controller.get('countrySelector');
	this.emailInputField = this.controller.get('emailInputField');
	this.emailAvailableButton = this.controller.get('emailAvailableButton');
	this.deviceInUseButton = this.controller.get('deviceInUseButton');
	this.passwordInputField = this.controller.get('passwordInputField');
	this.authenticateFromDeviceButton = this.controller.get('authenticateFromDeviceButton');
	this.createDeviceAccountButton = this.controller.get('createDeviceAccountButton');
	
	// setup handlers
	this.countryChangedHandler = this.countryChanged.bindAsEventListener(this);
	this.emailChangedHandler = this.emailChanged.bindAsEventListener(this);
	this.emailAvailableTapHandler = this.emailAvailableTap.bindAsEventListener(this);
	this.emailAvailableHandler =	this.emailAvailable.bindAsEventListener(this);
	this.deviceInUseTapHandler = this.deviceInUseTap.bindAsEventListener(this);
	this.deviceInUseHandler =	this.deviceInUse.bindAsEventListener(this);
	this.passwordChangedHandler = this.passwordChanged.bindAsEventListener(this);
	this.authenticateFromDeviceTapHandler = this.authenticateFromDeviceTap.bindAsEventListener(this);
	this.authenticateFromDeviceAckHandler = this.authenticateFromDeviceAck.bind(this);
	this.authenticateFromDeviceHandler =	this.authenticateFromDevice.bindAsEventListener(this);
	this.authenticationUpdateHandler =	this.authenticationUpdate.bindAsEventListener(this);
	this.createDeviceAccountTapHandler = this.createDeviceAccountTap.bindAsEventListener(this);
	this.createDeviceAccountAckHandler = this.createDeviceAccountAck.bind(this);
	this.createDeviceAccountHandler =	this.createDeviceAccount.bindAsEventListener(this);
	this.profileCreationHandler =	this.profileCreation.bindAsEventListener(this);
	
	// setup wigets
	this.spinnerModel = {spinning: true};
	this.controller.setupWidget('spinner', {spinnerSize: 'small'}, this.spinnerModel);
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
	this.controller.setupWidget('emailAvailableButton', { }, this.emailAvailableButtonModel);
	this.controller.listen(this.emailAvailableButton, Mojo.Event.tap, this.emailAvailableTapHandler);
	this.controller.setupWidget('deviceInUseButton', { }, this.deviceInUseButtonModel);
	this.controller.listen(this.deviceInUseButton, Mojo.Event.tap, this.deviceInUseTapHandler);
	this.controller.setupWidget('passwordInputField', {
			autoReplace: false,
				hintText: 'Enter password ...',
				changeOnKeyPress: true,
				'textCase':Mojo.Widget.steModeLowerCase,
				focusMode: Mojo.Widget.focusSelectMode },
		this.passwordInputFieldModel);
	this.controller.listen(this.passwordInputField, Mojo.Event.propertyChange, this.passwordChangedHandler);
	this.controller.setupWidget('authenticateFromDeviceButton', { }, this.authenticateFromDeviceButtonModel);
	this.controller.listen(this.authenticateFromDeviceButton, Mojo.Event.tap, this.authenticateFromDeviceTapHandler);
	this.controller.setupWidget('createDeviceAccountButton', { }, this.createDeviceAccountButtonModel);
	this.controller.listen(this.createDeviceAccountButton, Mojo.Event.tap, this.createDeviceAccountTapHandler);
}

ActivationAssistant.prototype.activate = function()
{
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
			this.emailAvailableButtonModel.disabled = false;
			this.controller.modelChanged(this.emailAvailableButtonModel);
			this.deviceInUseButtonModel.disabled = false;
			this.controller.modelChanged(this.deviceInUseButtonModel);
			this.passwordInputFieldModel.disabled = false;
			this.controller.modelChanged(this.passwordInputFieldModel);
			if (this.passwordInputFieldModel.value != '') {
				this.authenticateFromDeviceButtonModel.disabled = false;
				this.controller.modelChanged(this.authenticateFromDeviceButtonModel);
				this.createDeviceAccountButtonModel.disabled = false;
				this.controller.modelChanged(this.createDeviceAccountButtonModel);
			}
		}
	}

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
		this.emailInputFieldModel.value = this.palmProfile.alias;
		this.controller.modelChanged(this.emailInputFieldModel);
		if (this.emailInputFieldModel.value != '') {
			this.emailAvailableButtonModel.disabled = false;
			this.controller.modelChanged(this.emailAvailableButtonModel);
			this.deviceInUseButtonModel.disabled = false;
			this.controller.modelChanged(this.deviceInUseButtonModel);
			this.passwordInputFieldModel.disabled = false;
			this.controller.modelChanged(this.passwordInputFieldModel);
			if (this.passwordInputFieldModel.value != '') {
				this.authenticateFromDeviceButtonModel.disabled = false;
				this.controller.modelChanged(this.authenticateFromDeviceButtonModel);
				this.createDeviceAccountButtonModel.disabled = false;
				this.controller.modelChanged(this.createDeviceAccountButtonModel);
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
	default:
		this.overrideMcc = false; this.overrideMnc = false;
		break;
	}
};

ActivationAssistant.prototype.emailChanged = function(event)
{
	if (event.value != '') {
		this.emailAvailableButtonModel.disabled = false;
		this.controller.modelChanged(this.emailAvailableButtonModel);
		this.deviceInUseButtonModel.disabled = false;
		this.controller.modelChanged(this.deviceInUseButtonModel);
		this.passwordInputFieldModel.disabled = false;
		this.controller.modelChanged(this.passwordInputFieldModel);
		if (this.passwordInputFieldModel.value != '') {
			this.authenticateFromDeviceButtonModel.disabled = false;
			this.controller.modelChanged(this.authenticateFromDeviceButtonModel);
			this.createDeviceAccountButtonModel.disabled = false;
			this.controller.modelChanged(this.createDeviceAccountButtonModel);
		}
	}
	else {
		this.emailAvailableButtonModel.disabled = true;
		this.controller.modelChanged(this.emailAvailableButtonModel);
		this.deviceInUseButtonModel.disabled = true;
		this.controller.modelChanged(this.deviceInUseButtonModel);
		this.passwordInputFieldModel.disabled = true;
		this.controller.modelChanged(this.passwordInputFieldModel);
		this.authenticateFromDeviceButtonModel.disabled = true;
		this.controller.modelChanged(this.authenticateFromDeviceButtonModel);
		this.createDeviceAccountButtonModel.disabled = true;
		this.controller.modelChanged(this.createDeviceAccountButtonModel);
	}
};

ActivationAssistant.prototype.emailAvailableTap = function(event)
{
	var callback = this.emailAvailableHandler;

	var url = this.locationServerUrl+"?email="+encodeURIComponent(this.emailInputFieldModel.value);

	Mojo.Log.warn("request %j", url);

	this.requestWebService = new Ajax.Request(url, {
			method: 'POST',
			contentType: 'application/json',
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

	this.updateSpinner(true);

	this.emailAvailableButtonModel.disabled = true;
	this.controller.modelChanged(this.emailAvailableButtonModel);
};

ActivationAssistant.prototype.emailAvailable = function(payload)
{
	this.requestWebService = false;

	this.updateSpinner(false);

	this.emailAvailableButtonModel.disabled = false;
	this.controller.modelChanged(this.emailAvailableButtonModel);

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (emailAvailable):</b><br>'+payload.errorText);
		return;
	}

	if (payload.response.getdomain) {
		this.controller.stageController.pushScene("item", "Email Available", payload.response.getdomain);
	}
};

ActivationAssistant.prototype.deviceInUseTap = function(event)
{
	var callback = this.deviceInUseHandler;

	var url = this.accountServerUrl+"isDeviceInUse";
	var body = {
		"InDeviceInUse": {
			"emailAddress": this.emailInputFieldModel.value,
			"deviceID": this.deviceProfile.deviceId,
			"deviceModel": this.deviceProfile.deviceModel
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

	this.updateSpinner(true);

	this.deviceInUseButtonModel.disabled = true;
	this.controller.modelChanged(this.deviceInUseButtonModel);
};

ActivationAssistant.prototype.deviceInUse = function(payload)
{
	this.requestWebService = false;

	this.updateSpinner(false);

	this.deviceInUseButtonModel.disabled = false;
	this.controller.modelChanged(this.deviceInUseButtonModel);

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (deviceInUse):</b><br>'+payload.errorText);
		return;
	}

	if (payload.response.OutDeviceInUse) {
		this.controller.stageController.pushScene("item", "Device In Use", payload.response.OutDeviceInUse);
	}
};

ActivationAssistant.prototype.passwordChanged = function(event)
{
	if (event.value != '') {
		this.authenticateFromDeviceButtonModel.disabled = false;
		this.controller.modelChanged(this.authenticateFromDeviceButtonModel);
		this.createDeviceAccountButtonModel.disabled = false;
		this.controller.modelChanged(this.createDeviceAccountButtonModel);
	}
	else {
		this.authenticateFromDeviceButtonModel.disabled = true;
		this.controller.modelChanged(this.authenticateFromDeviceButtonModel);
		this.createDeviceAccountButtonModel.disabled = true;
		this.controller.modelChanged(this.createDeviceAccountButtonModel);
	}
};

ActivationAssistant.prototype.authenticateFromDeviceTap = function(event)
{
	this.controller.showAlertDialog({
			allowHTMLMessage:	true,
			title:				'Authenticate From Device',
			message:			"Are you sure? This will replace the current Palm Profile on your device, which may have an unknown impact on your apps and data in your Palm Profile.",
			choices:			[{label:$L("Authenticate"), value:'authenticate', type:'negative'},{label:$L("Cancel"), value:'cancel', type:'dismiss'}],
			onChoose:			this.authenticateFromDeviceAckHandler
		});
};

ActivationAssistant.prototype.authenticateFromDeviceAck = function(value)
{
	if (value != "authenticate") return;
	
	this.authenticationInfo = false;

	var callback = this.authenticateFromDeviceHandler;

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
				"deviceID": this.deviceProfile.deviceId,
				"phoneNumber": this.deviceProfile.phoneNumber,
				"nduID": this.deviceProfile.nduId,
				"deviceModel": this.deviceProfile.deviceModel,
				"firmwareVersion": this.deviceProfile.firmwareVersion,
				"network": this.deviceProfile.network,
				"platform": this.deviceProfile.platform,
				"homeMcc": this.overrideMcc || this.deviceProfile.homeMcc,
				"homeMnc": this.overrideMnc || this.deviceProfile.homeMnc,
				"currentMcc": this.overrideMcc || this.deviceProfile.currentMcc,
				"currentMnc": this.overrideMnc || this.deviceProfile.currentMnc
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

	this.updateSpinner(true);

	this.authenticateFromDeviceButtonModel.disabled = true;
	this.controller.modelChanged(this.authenticateFromDeviceButtonModel);
};

ActivationAssistant.prototype.authenticateFromDevice = function(payload)
{
	this.requestWebService = false;

	this.updateSpinner(false);

	this.authenticateFromDeviceButtonModel.disabled = false;
	this.controller.modelChanged(this.authenticateFromDeviceButtonModel);

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (authenticateFromDevice):</b><br>'+payload.errorText);
		return;
	}

	if (payload.response.AuthenticateInfoEx) {
		var info = payload.response.AuthenticateInfoEx;
		this.authenticationInfo = info;

		if (this.palmProfile) {
			this.requestPalmService = ImpostahService.impersonate(this.authenticationUpdateHandler,
														  "com.palm.configurator", "com.palm.db",
														  "merge", {
															  "objects" : [
			{ "_id": "com.palm.palmprofile.token",
			  "alias": info.accountAlias, "authenticatedTime": info.authenticationTime,
			  "jabberId": info.jabberId, "state": info.accountState, "token": info.token,
			  "tokenexpireTime": info.expirationTime, "uniqueId": info.uniqueId }
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

		this.updateSpinner(true);

		this.authenticateFromDeviceButtonModel.disabled = true;
		this.controller.modelChanged(this.authenticateFromDeviceButtonModel);

	}
};

ActivationAssistant.prototype.authenticationUpdate = function(payload)
{
	if (this.requestPalmService) this.requestPalmService.cancel();
	this.requestPalmService = false;

	this.updateSpinner(false);

	this.authenticateFromDeviceButtonModel.disabled = false;
	this.controller.modelChanged(this.authenticateFromDeviceButtonModel);

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (authenticationUpdate):</b><br>'+payload.errorText);
		return;
	}

	if (this.authenticationInfo) {
		this.controller.stageController.pushScene("item", "Authenticate From Device", this.authenticationInfo);
	}

	this.palmProfile = false;
	this.updateSpinner(true);
	PalmProfile.getPalmProfile(this.getPalmProfile.bind(this), true);
};

ActivationAssistant.prototype.createDeviceAccountTap = function(event)
{
	this.controller.showAlertDialog({
			allowHTMLMessage:	true,
			title:				'Create Device Account',
			message:			"Are you sure? This will replace the current Palm Profile on your device, which may have an unknown impact on your apps and data in your Palm Profile.",
			choices:			[{label:$L("Create"), value:'create', type:'negative'},{label:$L("Cancel"), value:'cancel', type:'dismiss'}],
			onChoose:			this.createDeviceAccountAckHandler
		});
};

ActivationAssistant.prototype.createDeviceAccountAck = function(value)
{
	if (value != "create") return;

	this.authenticationInfo = false;

	var callback = this.createDeviceAccountHandler;

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
				"carrier": this.deviceProfile.carrier,
				"dataNetwork": this.deviceProfile.dataNetwork,
				"deviceID": this.deviceProfile.deviceId,
				"phoneNumber": this.deviceProfile.phoneNumber,
				"nduID": this.deviceProfile.nduId,
				"deviceModel": this.deviceProfile.deviceModel,
				"firmwareVersion": this.deviceProfile.firmwareVersion,
				"network": this.deviceProfile.network,
				"platform": this.deviceProfile.platform,
				"homeMcc": this.overrideMcc || this.deviceProfile.homeMcc,
				"homeMnc": this.overrideMnc || this.deviceProfile.homeMnc,
				"currentMcc": this.overrideMcc || this.deviceProfile.currentMcc,
				"currentMnc": this.overrideMnc || this.deviceProfile.currentMnc
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

	this.updateSpinner(true);

	this.createDeviceAccountButtonModel.disabled = true;
	this.controller.modelChanged(this.createDeviceAccountButtonModel);
};

ActivationAssistant.prototype.createDeviceAccount = function(payload)
{
	this.requestWebService = false;

	this.updateSpinner(false);

	this.createDeviceAccountButtonModel.disabled = false;
	this.controller.modelChanged(this.createDeviceAccountButtonModel);

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (createDeviceAccount):</b><br>'+payload.errorText);
		return;
	}

	if (payload.response.AuthenticateInfoEx) {
		// this.controller.stageController.pushScene("item", "Authentication Info", payload.response.AuthenticateInfoEx);
		var info = payload.response.AuthenticateInfoEx;
		this.authenticationInfo = info;

		if (this.palmProfile) {
			this.requestPalmService = ImpostahService.impersonate(this.authenticationUpdateHandler,
														  "com.palm.configurator", "com.palm.db",
														  "merge", {
															  "objects" : [
			{ "_id": "com.palm.palmprofile.token",
			  "alias": info.accountAlias, "authenticatedTime": info.authenticationTime,
			  "jabberId": info.jabberId, "state": info.accountState, "token": info.token,
			  "tokenexpireTime": info.expirationTime, "uniqueId": info.uniqueId }
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
		
		this.updateSpinner(true);

		this.createDeviceAccountButtonModel.disabled = true;
		this.controller.modelChanged(this.createDeviceAccountButtonModel);

	}
};

ActivationAssistant.prototype.profileCreation = function(payload)
{
	if (this.requestPalmService) this.requestPalmService.cancel();
	this.requestPalmService = false;

	this.updateSpinner(false);

	this.createDeviceAccountButtonModel.disabled = false;
	this.controller.modelChanged(this.createDeviceAccountButtonModel);

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (profileCreation):</b><br>'+payload.errorText);
		return;
	}

	if (this.authenticationInfo) {
		this.controller.stageController.pushScene("item", "Create Device Account", this.authenticationInfo);
	}

	this.palmProfile = false;
	this.updateSpinner(true);
	PalmProfile.getPalmProfile(this.getPalmProfile.bind(this), true);
};

ActivationAssistant.prototype.updateSpinner = function(active)
{
	if (active)  {
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
	this.controller.stopListening(this.countrySelector, Mojo.Event.propertyChange,
								  this.countryChangedHandler);
	this.controller.stopListening(this.emailInputField, Mojo.Event.propertyChange,
								  this.emailChangedHandler);
	this.controller.stopListening(this.emailAvailableButton,  Mojo.Event.tap,
								  this.emailAvailableTapHandler);
	this.controller.stopListening(this.deviceInUseButton,  Mojo.Event.tap,
								  this.deviceInUseTapHandler);
	this.controller.stopListening(this.passwordInputField, Mojo.Event.propertyChange,
								  this.passwordChangedHandler);
	this.controller.stopListening(this.authenticateFromDeviceButton,  Mojo.Event.tap,
								  this.authenticateFromDeviceTapHandler);
	this.controller.stopListening(this.createDeviceAccountButton,  Mojo.Event.tap,
								  this.createDeviceAccountTapHandler);
};

// Local Variables:
// tab-width: 4
// End:
