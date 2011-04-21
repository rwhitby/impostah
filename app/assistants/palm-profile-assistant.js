function PalmProfileAssistant()
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
	
	this.palmProfileButtonModel = {
		label: $L("Show Palm Profile"),
		disabled: true
	};

	this.manageOverridesButtonModel = {
		label: $L("Palm Profile Overrides"),
		disabled: true
	};

	this.resetPalmProfileButtonModel = {
		label: $L("Reset Palm Profile"),
		disabled: true
	};

	this.emailInputFieldModel = {
		label: $L("Email Address"),
		disabled: true
	};

	this.deviceInUseButtonModel = {
		label: $L("Check Device In Use"),
		disabled: true
	};

	this.passwordInputFieldModel = {
		label: $L("Password"),
		disabled: true
	};

	this.authenticateFromDeviceButtonModel = {
		label: $L("Authenticate From Device"),
		disabled: true
	};

	this.deviceModelSelectorModel = {
		label: $L("Device Model"),
		disabled: true,
		choices: [
	{label:"Pre (CDMA)", value:'P100EWW'},
	{label:"Pre (EU UMTS)", value:'P100UEU'},
	{label:"Pre (NA UMTS)", value:'P100UNA'},
	{label:"Pre Plus (CDMA)", value:'P101EWW'},
	{label:"Pre Plus (EU UMTS)", value:'P101UEU'},
	{label:"Pre Plus (NA UMTS)", value:'P101UNA'},
	{label:"Pre 2 (CDMA)", value:'P102EWW'},
	{label:"Pre 2 (EU UMTS)", value:'P102UEU'},
	{label:"Pre 2 (NA UMTS)", value:'P102UNA'},
	{label:"Pixi (CDMA)", value:'P120EWW'},
	{label:"Pixi (EU UMTS)", value:'P120UEU'},
	{label:"Pixi (NA UMTS)", value:'P120UNA'},
	{label:"Pixi Plus (CDMA)", value:'P121EWW'},
	{label:"Pixi Plus (EU UMTS)", value:'P121UEU'},
	{label:"Pixi Plus (NA UMTS)", value:'P121UNA'},
				  ]
	};

	this.carrierSelectorModel = {
		label: $L("Carrier"),
		disabled: true,
		choices: [
	{label:"AT&T", value:'ATT'},
	{label:"Global", value:'ROW'},
	{label:"Sprint", value:'Sprint'},
	{label:"Verizon", value:'Verizon'},
				  ]
	};

	this.createDeviceAccountButtonModel = {
		label: $L("Create Device Account"),
		disabled: true
	};

	this.deviceProfile = false;
	this.palmProfile = false;

	this.requestPalmService = false;
	this.requestWebService = false;

	// %%% FIXME %%%
	this.accountServerUrl = "https://ps.palmws.com/palmcsext/services/deviceJ/";
};

PalmProfileAssistant.prototype.setup = function()
{
	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	// get elements
	this.iconElement =			this.controller.get('icon');
	this.iconElement.style.display = 'none';
	this.spinnerElement = 		this.controller.get('spinner');
	this.palmProfileButton = this.controller.get('palmProfileButton');
	this.manageOverridesButton = this.controller.get('manageOverridesButton');
	this.resetPalmProfileButton = this.controller.get('resetPalmProfileButton');
	this.emailInputField = this.controller.get('emailInputField');
	this.deviceInUseButton = this.controller.get('deviceInUseButton');
	this.passwordInputField = this.controller.get('passwordInputField');
	this.authenticateFromDeviceButton = this.controller.get('authenticateFromDeviceButton');
	this.deviceModelSelector = this.controller.get('deviceModelSelector');
	this.carrierSelector = this.controller.get('carrierSelector');
	this.createDeviceAccountButton = this.controller.get('createDeviceAccountButton');
	
	// setup handlers
	this.getDeviceProfileHandler =	this.getDeviceProfile.bindAsEventListener(this);
	this.getPalmProfileHandler =	this.getPalmProfile.bindAsEventListener(this);
	this.palmProfileTapHandler = this.palmProfileTap.bindAsEventListener(this);
	this.manageOverridesTapHandler = this.manageOverridesTap.bindAsEventListener(this);
	this.resetPalmProfileTapHandler = this.resetPalmProfileTap.bindAsEventListener(this);
	this.resetPalmProfileAckHandler = this.resetPalmProfileAck.bind(this);
	this.palmProfileDeletedHandler = this.palmProfileDeleted.bindAsEventListener(this);
	this.palmProfileDeletionAckHandler = this.palmProfileDeletionAck.bind(this);
	this.palmProfileDeletionDoneHandler = this.palmProfileDeletionDone.bindAsEventListener(this);
	this.deviceInUseTapHandler = this.deviceInUseTap.bindAsEventListener(this);
	this.deviceInUseHandler =	this.deviceInUse.bindAsEventListener(this);
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
	this.controller.setupWidget('palmProfileButton', { }, this.palmProfileButtonModel);
	this.controller.listen(this.palmProfileButton, Mojo.Event.tap, this.palmProfileTapHandler);
	this.controller.setupWidget('manageOverridesButton', { }, this.manageOverridesButtonModel);
	this.controller.listen(this.manageOverridesButton,  Mojo.Event.tap, this.manageOverridesTapHandler);
	this.controller.setupWidget('resetPalmProfileButton', { }, this.resetPalmProfileButtonModel);
	this.controller.listen(this.resetPalmProfileButton, Mojo.Event.tap, this.resetPalmProfileTapHandler);
	this.controller.setupWidget('emailInputField', { 'textCase':Mojo.Widget.steModeLowerCase },
								this.emailInputFieldModel);
	this.controller.setupWidget('deviceInUseButton', { }, this.deviceInUseButtonModel);
	this.controller.listen(this.deviceInUseButton, Mojo.Event.tap, this.deviceInUseTapHandler);
	this.controller.setupWidget('passwordInputField', { 'textCase':Mojo.Widget.steModeLowerCase },
								this.passwordInputFieldModel);
	this.controller.setupWidget('authenticateFromDeviceButton', { }, this.authenticateFromDeviceButtonModel);
	this.controller.listen(this.authenticateFromDeviceButton, Mojo.Event.tap, this.authenticateFromDeviceTapHandler);
	this.controller.setupWidget('deviceModelSelector', { }, this.deviceModelSelectorModel);
	this.controller.setupWidget('carrierSelector', { }, this.carrierSelectorModel);
	this.controller.setupWidget('createDeviceAccountButton', { }, this.createDeviceAccountButtonModel);
	this.controller.listen(this.createDeviceAccountButton, Mojo.Event.tap, this.createDeviceAccountTapHandler);
}

PalmProfileAssistant.prototype.activate = function()
{
	this.deviceProfile = false;

	if (this.requestPalmService) this.requestPalmService.cancel();
	this.requestPalmService = ImpostahService.impersonate(this.getDeviceProfileHandler,
														  "com.palm.configurator",
														  "com.palm.deviceprofile",
														  "getDeviceProfile", {});

	this.updateSpinner();
};

PalmProfileAssistant.prototype.getDeviceProfile = function(payload)
{
	if (this.requestPalmService) this.requestPalmService.cancel();
	this.requestPalmService = false;

	this.updateSpinner();

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (getDeviceProfile):</b><br>'+payload.errorText);
		return;
	}

	this.deviceProfile = payload.deviceInfo;

	if (this.deviceProfile) {
		this.emailInputFieldModel.disabled = false;
		this.controller.modelChanged(this.emailInputFieldModel);
		this.deviceInUseButtonModel.disabled = false;
		this.controller.modelChanged(this.deviceInUseButtonModel);
		this.passwordInputFieldModel.disabled = false;
		this.controller.modelChanged(this.passwordInputFieldModel);
		this.authenticateFromDeviceButtonModel.disabled = false;
		this.controller.modelChanged(this.authenticateFromDeviceButtonModel);
		this.deviceModelSelectorModel.disabled = false;
		this.deviceModelSelectorModel.value = this.deviceProfile.deviceModel;
		this.controller.modelChanged(this.deviceModelSelectorModel);
		this.carrierSelectorModel.disabled = false;
		this.carrierSelectorModel.value = this.deviceProfile.carrier;
		this.controller.modelChanged(this.carrierSelectorModel);
		this.createDeviceAccountButtonModel.disabled = false;
		this.controller.modelChanged(this.createDeviceAccountButtonModel);
	}

	this.palmProfile = false;

	this.requestPalmService = ImpostahService.impersonate(this.getPalmProfileHandler,
														  "com.palm.configurator",
														  "com.palm.db",
														  "get", {"ids":["com.palm.palmprofile.token"]});

	this.updateSpinner();

};

PalmProfileAssistant.prototype.getPalmProfile = function(payload)
{
	if (this.requestPalmService) this.requestPalmService.cancel();
	this.requestPalmService = false;

	this.updateSpinner();

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (getPalmProfile):</b><br>'+payload.errorText);
		return;
	}

	this.palmProfile = payload.results[0];

	if (this.palmProfile) {
		this.palmProfileButtonModel.disabled = false;
		this.controller.modelChanged(this.palmProfileButtonModel);
		this.manageOverridesButtonModel.disabled = false;
		this.controller.modelChanged(this.manageOverridesButtonModel);
		this.resetPalmProfileButtonModel.disabled = false;
		this.controller.modelChanged(this.resetPalmProfileButtonModel);
		this.emailInputFieldModel.disabled = false;
		this.emailInputFieldModel.value = this.palmProfile.alias;
		this.controller.modelChanged(this.emailInputFieldModel);
	}
};

PalmProfileAssistant.prototype.palmProfileTap = function(event)
{
	if (this.palmProfile) {
		this.controller.stageController.pushScene("item", "Palm Profile", this.palmProfile);
	}
};

PalmProfileAssistant.prototype.manageOverridesTap = function(event)
{
	if (this.palmProfile) {
		var attributes = this.palmProfile;
		delete attributes['_id']; delete attributes['_kind']; delete attributes['_rev'];
		this.controller.stageController.pushScene("overrides", "Palm Profile Overrides", attributes,
												  "org.webosinternals.impostah.palmprofile");
	}
};

PalmProfileAssistant.prototype.resetPalmProfileTap = function(event)
{
	this.controller.showAlertDialog({
			allowHTMLMessage:	true,
			title:				'Reset Palm Profile',
			message:			"Are you sure? Applications you installed and all application settings and data will be erased.",
			choices:			[{label:$L("Delete"), value:'delete', type:'negative'},{label:$L("Cancel"), value:'cancel', type:'dismiss'}],
			onChoose:			this.resetPalmProfileAckHandler
		});
};

PalmProfileAssistant.prototype.resetPalmProfileAck = function(value)
{
	if (value != "delete") return;

	this.palmProfile = false;

	if (this.requestPalmService) this.requestPalmService.cancel();
	this.requestPalmService = ImpostahService.impersonate(this.palmProfileDeletedHandler,
														  "com.palm.configurator",
														  "com.palm.db",
														  "del", {"ids":["com.palm.palmprofile.token"], "purge":true});

	this.updateSpinner();

	this.palmProfileButtonModel.disabled = true;
	this.controller.modelChanged(this.palmProfileButtonModel);

	this.resetPalmProfileButtonModel.disabled = true;
	this.controller.modelChanged(this.resetPalmProfileButtonModel);
};

PalmProfileAssistant.prototype.palmProfileDeleted = function(payload)
{
	if (this.requestPalmService) this.requestPalmService.cancel();
	this.requestPalmService = false;

	this.updateSpinner();

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (palmProfileDeleted):</b><br>'+payload.errorText);
		return;
	}

	this.controller.showAlertDialog({
			allowHTMLMessage:	true,
				preventCancel:		true,
				title:				'Reset Palm Profile',
				message:			"Your Palm Profile has been reset. Your device will now restart.",
				choices:			[{label:$L("Ok"), value:'ok'},
									 {label:$L("Cancel"), value:'cancel'}
									 ],
				onChoose:			this.palmProfileDeletionAckHandler
				});
};

PalmProfileAssistant.prototype.palmProfileDeletionAck = function(value)
{
	if (this.requestPalmService) this.requestPalmService.cancel();
	if (value != "ok") {
		this.requestPalmService = ImpostahService.impersonate(this.getPalmProfileHandler,
															  "com.palm.configurator",
															  "com.palm.db",
															  "get", {"ids":["com.palm.palmprofile.token"]});
	}
	else {
		this.requestPalmService = ImpostahService.removeFirstUseFlag(this.palmProfileDeletionDoneHandler);
	}

	this.updateSpinner();
};

PalmProfileAssistant.prototype.palmProfileDeletionDone = function(payload)
{
	if (this.requestPalmService) this.requestPalmService.cancel();
	this.requestPalmService = false;

	this.updateSpinner();

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (palmProfileDeletionDone):</b><br>'+payload.errorText);
		return;
	}

	this.requestPalmService = ImpostahService.restartLuna();
};

PalmProfileAssistant.prototype.deviceInUseTap = function(event)
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

	this.updateSpinner();

	this.deviceInUseButtonModel.disabled = true;
	this.controller.modelChanged(this.deviceInUseButtonModel);
};

PalmProfileAssistant.prototype.deviceInUse = function(payload)
{
	this.requestWebService = false;

	this.updateSpinner();

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

PalmProfileAssistant.prototype.authenticateFromDeviceTap = function(event)
{
	this.controller.showAlertDialog({
			allowHTMLMessage:	true,
			title:				'Authenticate From Device',
			message:			"Are you sure? This will replace the current Palm Profile on your device, which may have an unknown impact on your apps and data in your Palm Profile.",
			choices:			[{label:$L("Authenticate"), value:'authenticate', type:'negative'},{label:$L("Cancel"), value:'cancel', type:'dismiss'}],
			onChoose:			this.authenticateFromDeviceAckHandler
		});
};

PalmProfileAssistant.prototype.authenticateFromDeviceAck = function(value)
{
	if (value != "authenticate") return;

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
				// "dataNetwork": this.deviceProfile.dataNetwork,
				"deviceID": this.deviceProfile.deviceId,
				// "phoneNumber": this.deviceProfile.phoneNumber,
				"nduID": this.deviceProfile.nduId,
				"deviceModel": this.deviceProfile.deviceModel,
				// "firmwareVersion": this.deviceProfile.firmwareVersion,
				"network": this.deviceProfile.network,
				"platform": this.deviceProfile.platform,
				// "homeMcc": this.deviceProfile.homeMcc,
				// "homeMnc": this.deviceProfile.homeMnc,
				// "currentMcc": this.deviceProfile.currentMcc,
				// "currentMnc": this.deviceProfile.currentMnc
			},
			"romToken": {
				"buildVariant": this.deviceProfile.dmSets,
				// "serverAuthType": this.deviceProfile.serverAuthType,
				"serverPwd": this.deviceProfile.serverPwd,
				"serverNonce": this.deviceProfile.serverNonce,
				"clientCredential": this.deviceProfile.clientCredential,
				"clientPwd": this.deviceProfile.clientPwd,
				"clientNonce": this.deviceProfile.clientNonce,
				// "softwareBuildBranch": this.deviceProfile.softwareBuildBranch,
				// "swUpdateTarget": this.deviceProfile.swUpdateTarget,
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

	this.updateSpinner();

	this.authenticateFromDeviceButtonModel.disabled = true;
	this.controller.modelChanged(this.authenticateFromDeviceButtonModel);
};

PalmProfileAssistant.prototype.authenticateFromDevice = function(payload)
{
	this.requestWebService = false;

	this.updateSpinner();

	this.authenticateFromDeviceButtonModel.disabled = false;
	this.controller.modelChanged(this.authenticateFromDeviceButtonModel);

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (authenticateFromDevice):</b><br>'+payload.errorText);
		return;
	}

	if (payload.response.AuthenticateInfoEx) {
		// this.controller.stageController.pushScene("item", "Authentication Info", payload.response.AuthenticateInfoEx);
		var info = payload.response.AuthenticateInfoEx;

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

		this.updateSpinner();

		this.authenticateFromDeviceButtonModel.disabled = true;
		this.controller.modelChanged(this.authenticateFromDeviceButtonModel);

	}
};

PalmProfileAssistant.prototype.authenticationUpdate = function(payload)
{
	if (this.requestPalmService) this.requestPalmService.cancel();
	this.requestPalmService = false;

	this.updateSpinner();

	this.authenticateFromDeviceButtonModel.disabled = false;
	this.controller.modelChanged(this.authenticateFromDeviceButtonModel);

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (authenticationUpdate):</b><br>'+payload.errorText);
		return;
	}

	this.controller.stageController.pushScene("item", "Authentication Update", payload);

	this.requestPalmService = ImpostahService.impersonate(this.getPalmProfileHandler,
														  "com.palm.configurator",
														  "com.palm.db",
														  "get", {"ids":["com.palm.palmprofile.token"]});
};

PalmProfileAssistant.prototype.createDeviceAccountTap = function(event)
{
	this.controller.showAlertDialog({
			allowHTMLMessage:	true,
			title:				'Create Device Account',
			message:			"Are you sure? This will replace the current Palm Profile on your device, which may have an unknown impact on your apps and data in your Palm Profile.",
			choices:			[{label:$L("Create"), value:'create', type:'negative'},{label:$L("Cancel"), value:'cancel', type:'dismiss'}],
			onChoose:			this.createDeviceAccountAckHandler
		});
};

PalmProfileAssistant.prototype.createDeviceAccountAck = function(value)
{
	if (value != "create") return;

	var callback = this.createDeviceAccountHandler;

	var url = this.accountServerUrl+"createDeviceAccount";
	var body = {
		"InCreateDeviceAccount": {
			"account": {
				"email": this.emailInputFieldModel.value,
				"firstName": "Impostah",
				"lastName": "User",
				"language": "en",
				"country": "US"
			},
			"password": this.passwordInputFieldModel.value,
			"device": {
				"serialNumber": this.deviceProfile.serialNumber,
				"carrier": this.carrierSelectorModel.value,
				// "dataNetwork": this.deviceProfile.dataNetwork,
				"deviceID": this.deviceProfile.deviceId,
				// "phoneNumber": this.deviceProfile.phoneNumber,
				"nduID": this.deviceProfile.nduId,
				"deviceModel": this.deviceModelSelectorModel.value,
				// "firmwareVersion": this.deviceProfile.firmwareVersion,
				"network": this.deviceProfile.network,
				"platform": this.deviceProfile.platform,
				// "homeMcc": this.deviceProfile.homeMcc,
				// "homeMnc": this.deviceProfile.homeMnc,
				// "currentMcc": this.deviceProfile.currentMcc,
				// "currentMnc": this.deviceProfile.currentMnc
			},
			"romToken": {
				"buildVariant": this.deviceProfile.dmSets,
				// "serverAuthType": this.deviceProfile.serverAuthType,
				"serverPwd": this.deviceProfile.serverPwd,
				"serverNonce": this.deviceProfile.serverNonce,
				"clientCredential": this.deviceProfile.clientCredential,
				"clientPwd": this.deviceProfile.clientPwd,
				"clientNonce": this.deviceProfile.clientNonce,
				// "softwareBuildBranch": this.deviceProfile.softwareBuildBranch,
				// "swUpdateTarget": this.deviceProfile.swUpdateTarget,
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

	this.updateSpinner();

	this.createDeviceAccountButtonModel.disabled = true;
	this.controller.modelChanged(this.createDeviceAccountButtonModel);
};

PalmProfileAssistant.prototype.createDeviceAccount = function(payload)
{
	this.requestWebService = false;

	this.updateSpinner();

	this.createDeviceAccountButtonModel.disabled = false;
	this.controller.modelChanged(this.createDeviceAccountButtonModel);

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (createDeviceAccount):</b><br>'+payload.errorText);
		return;
	}

	if (payload.response.AuthenticateInfoEx) {
		// this.controller.stageController.pushScene("item", "Authentication Info", payload.response.AuthenticateInfoEx);
		var info = payload.response.AuthenticateInfoEx;

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
		
		this.updateSpinner();

		this.createDeviceAccountButtonModel.disabled = true;
		this.controller.modelChanged(this.createDeviceAccountButtonModel);

	}
};

PalmProfileAssistant.prototype.profileCreation = function(payload)
{
	if (this.requestPalmService) this.requestPalmService.cancel();
	this.requestPalmService = false;

	this.updateSpinner();

	this.createDeviceAccountButtonModel.disabled = false;
	this.controller.modelChanged(this.createDeviceAccountButtonModel);

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (profileCreation):</b><br>'+payload.errorText);
		return;
	}

	this.controller.stageController.pushScene("item", "Profile Creation", payload);

	this.requestPalmService = ImpostahService.impersonate(this.getPalmProfileHandler,
														  "com.palm.configurator",
														  "com.palm.db",
														  "get", {"ids":["com.palm.palmprofile.token"]});
};

PalmProfileAssistant.prototype.updateSpinner = function()
{
	if (this.requestPalmService || this.requestWebService)  {
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

PalmProfileAssistant.prototype.errorMessage = function(msg)
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

PalmProfileAssistant.prototype.handleCommand = function(event)
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

PalmProfileAssistant.prototype.cleanup = function(event)
{
	this.controller.stopListening(this.palmProfileButton,  Mojo.Event.tap,
								  this.palmProfileTapHandler);
	this.controller.stopListening(this.manageOverridesButton,  Mojo.Event.tap,
								  this.manageOverridesTapHandler);
	this.controller.stopListening(this.resetPalmProfileButton,  Mojo.Event.tap,
								  this.resetPalmProfileTapHandler);
	this.controller.stopListening(this.deviceInUseButton,  Mojo.Event.tap,
								  this.deviceInUseTapHandler);
	this.controller.stopListening(this.authenticateFromDeviceButton,  Mojo.Event.tap,
								  this.authenticateFromDeviceTapHandler);
	this.controller.stopListening(this.createDeviceAccountButton,  Mojo.Event.tap,
								  this.createDeviceAccountTapHandler);
};

// Local Variables:
// tab-width: 4
// End:
