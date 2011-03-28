function WebServicesExploreAssistant()
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
		label: $L("Palm Profile"),
		disabled: true
	};

	this.deviceProfileButtonModel = {
		label: $L("Device Profile"),
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
};

WebServicesExploreAssistant.prototype.setup = function()
{
	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	// get elements
	this.iconElement =			this.controller.get('icon');
	this.iconElement.style.display = 'none';
	this.spinnerElement = 		this.controller.get('spinner');
	this.palmProfileButton = this.controller.get('palmProfileButton');
	this.deviceProfileButton = this.controller.get('deviceProfileButton');
	this.emailInputField = this.controller.get('emailInputField');
	this.deviceInUseButton = this.controller.get('deviceInUseButton');
	this.passwordInputField = this.controller.get('passwordInputField');
	this.authenticateFromDeviceButton = this.controller.get('authenticateFromDeviceButton');
	
	// setup handlers
	this.getPalmProfileHandler =	this.getPalmProfile.bindAsEventListener(this);
	this.palmProfileTapHandler = this.palmProfileTap.bindAsEventListener(this);
	this.getDeviceProfileHandler =	this.getDeviceProfile.bindAsEventListener(this);
	this.deviceProfileTapHandler = this.deviceProfileTap.bindAsEventListener(this);
	this.deviceInUseTapHandler = this.deviceInUseTap.bindAsEventListener(this);
	this.deviceInUseHandler =	this.deviceInUse.bindAsEventListener(this);
	this.authenticateFromDeviceTapHandler = this.authenticateFromDeviceTap.bindAsEventListener(this);
	this.authenticateFromDeviceAckHandler = this.authenticateFromDeviceAck.bind(this);
	this.authenticateFromDeviceHandler =	this.authenticateFromDevice.bindAsEventListener(this);
	this.authenticationUpdateHandler =	this.authenticationUpdate.bindAsEventListener(this);
	
	// setup wigets
	this.spinnerModel = {spinning: true};
	this.controller.setupWidget('spinner', {spinnerSize: 'small'}, this.spinnerModel);
	this.controller.setupWidget('deviceProfileButton', { }, this.deviceProfileButtonModel);
	this.controller.listen(this.deviceProfileButton,  Mojo.Event.tap, this.deviceProfileTapHandler);
	this.controller.setupWidget('palmProfileButton', { }, this.palmProfileButtonModel);
	this.controller.listen(this.palmProfileButton,  Mojo.Event.tap, this.palmProfileTapHandler);
	this.controller.setupWidget('emailInputField', { 'textCase':Mojo.Widget.steModeLowerCase }, this.emailInputFieldModel);
	// ???
	this.controller.setupWidget('deviceInUseButton', { }, this.deviceInUseButtonModel);
	this.controller.listen(this.deviceInUseButton,  Mojo.Event.tap, this.deviceInUseTapHandler);
	this.controller.setupWidget('passwordInputField', { 'textCase':Mojo.Widget.steModeLowerCase }, this.passwordInputFieldModel);
	// ???
	this.controller.setupWidget('authenticateFromDeviceButton', { }, this.authenticateFromDeviceButtonModel);
	this.controller.listen(this.authenticateFromDeviceButton,  Mojo.Event.tap, this.authenticateFromDeviceTapHandler);
	
	this.deviceProfile = false;
	this.palmProfile = false;

	this.requestPalmProfile = ImpostahService.impersonate(this.getPalmProfileHandler,
														  "com.palm.configurator",
														  "com.palm.db",
														  "get", {"ids":["com.palm.palmprofile.token"]});
	this.requestDeviceProfile = ImpostahService.impersonate(this.getDeviceProfileHandler,
															"com.palm.configurator",
															"com.palm.deviceprofile",
															"getDeviceProfile", {});
};

WebServicesExploreAssistant.prototype.getDeviceProfile = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (getDeviceProfile):</b><br>'+payload.errorText);
		return;
	}

	if (this.requestDeviceProfile) this.requestDeviceProfile.cancel();
	this.requestDeviceProfile = false;

	this.updateSpinner();

	this.deviceProfile = payload.deviceInfo;

	if (this.deviceProfile) {
		this.deviceProfileButtonModel.disabled = false;
		this.controller.modelChanged(this.deviceProfileButtonModel);
	}

	if (this.palmProfile) {
		this.emailInputFieldModel.disabled = false;
		this.emailInputFieldModel.value = this.palmProfile.alias;
		this.controller.modelChanged(this.emailInputFieldModel);
	}

	if (this.palmProfile && this.deviceProfile) {
		this.deviceInUseButtonModel.disabled = false;
		this.controller.modelChanged(this.deviceInUseButtonModel);
		this.passwordInputFieldModel.disabled = false;
		this.controller.modelChanged(this.passwordInputFieldModel);
		this.authenticateFromDeviceButtonModel.disabled = false;
		this.controller.modelChanged(this.authenticateFromDeviceButtonModel);
	}

};

WebServicesExploreAssistant.prototype.deviceProfileTap = function(event)
{
	if (this.deviceProfile) {
		this.controller.stageController.pushScene("item", "Device Profile", this.deviceProfile);
	}
};

WebServicesExploreAssistant.prototype.getPalmProfile = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (getPalmProfile):</b><br>'+payload.errorText);
		return;
	}

	if (this.requestPalmProfile) this.requestPalmProfile.cancel();
	this.requestPalmProfile = false;

	this.updateSpinner();

	this.palmProfile = payload.results[0];

	if (this.palmProfile) {
		this.palmProfileButtonModel.disabled = false;
		this.controller.modelChanged(this.palmProfileButtonModel);
	}

	if (this.palmProfile) {
		this.emailInputFieldModel.disabled = false;
		this.emailInputFieldModel.value = this.palmProfile.alias;
		this.controller.modelChanged(this.emailInputFieldModel);
	}

	if (this.palmProfile && this.deviceProfile) {
		this.deviceInUseButtonModel.disabled = false;
		this.controller.modelChanged(this.deviceInUseButtonModel);
		this.passwordInputFieldModel.disabled = false;
		this.controller.modelChanged(this.passwordInputFieldModel);
		this.authenticateFromDeviceButtonModel.disabled = false;
		this.controller.modelChanged(this.authenticateFromDeviceButtonModel);
	}
};

WebServicesExploreAssistant.prototype.palmProfileTap = function(event)
{
	if (this.palmProfile) {
		this.controller.stageController.pushScene("item", "Palm Profile", this.palmProfile);
	}
};

WebServicesExploreAssistant.prototype.deviceInUseTap = function(event)
{
	var callback = this.deviceInUseHandler;

	var url = this.palmProfile.accountServerUrl+"isDeviceInUse";
	var body = {
		"InDeviceInUse": {
			"emailAddress": this.emailInputFieldModel.value,
			"deviceID": this.deviceProfile.deviceId,
			"deviceModel": this.deviceProfile.deviceModel
		}
	};

	this.requestWebService = new Ajax.Request(url, {
			method: 'POST',
			contentType: 'application/json',
			postBody: Object.toJSON(body),
			evalJSON: 'force',
			onSuccess: function(response) {
				response = response.responseJSON;
				Mojo.Log.info("onSuccess %j", response);
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
				Mojo.Log.info("onFailure %j", response);
				if (response.responseJSON && response.responseJSON.JSONException) {
					callback({"returnValue":false, "errorText":Object.toJSON(response.responseJSON.JSONException)});
				}
				else {
					callback({"returnValue":false, "errorText":response.status});
				}
			},
			on0: function(response) {
				Mojo.Log.info("on0 %j", response);
				callback({"returnValue":false, "errorText":response.status});
			}
	});

	this.updateSpinner();

	this.deviceInUseButtonModel.disabled = true;
	this.controller.modelChanged(this.deviceInUseButtonModel);
};

WebServicesExploreAssistant.prototype.deviceInUse = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (deviceInUse):</b><br>'+payload.errorText);
		return;
	}

	this.requestWebService = false;

	this.updateSpinner();

	this.deviceInUseButtonModel.disabled = false;
	this.controller.modelChanged(this.deviceInUseButtonModel);

	if (payload.response.OutDeviceInUse) {
		this.controller.stageController.pushScene("item", "Device In Use", payload.response.OutDeviceInUse);
	}
};

WebServicesExploreAssistant.prototype.authenticateFromDeviceTap = function(event)
{
	this.controller.showAlertDialog({
			allowHTMLMessage:	true,
			title:				'Authenticate From Device',
			message:			"Are you sure? This will replace the current Palm Profile on your device, which may have an unknown impact on your apps and data in your Palm Profile.",
			choices:			[{label:$L("Authenticate"), value:'authenticate', type:'negative'},{label:$L("Cancel"), value:'cancel', type:'dismiss'}],
			onChoose:			this.authenticateFromDeviceAckHandler
		});
};

WebServicesExploreAssistant.prototype.authenticateFromDeviceAck = function(value)
{
	if (value != "authenticate") return;

	var callback = this.authenticateFromDeviceHandler;

	var url = this.palmProfile.accountServerUrl+"authenticateFromDevice";
	var body = {
		"InAuthenticateFromDevice": {
			// "application": "ASClient",
			"accountAlias": this.emailInputFieldModel.value,
			"password": this.passwordInputFieldModel.value,
			"device": {
				// "serialNumber": this.deviceProfile.serialNumber,
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

	this.requestWebService = new Ajax.Request(url, {
			method: 'POST',
			contentType: 'application/json',
			postBody: Object.toJSON(body),
			evalJSON: 'force',
			onSuccess: function(response) {
				response = response.responseJSON;
				Mojo.Log.info("onSuccess %j", response);
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
				Mojo.Log.info("onFailure %j", response);
				if (response.responseJSON && response.responseJSON.JSONException) {
					callback({"returnValue":false, "errorText":Object.toJSON(response.responseJSON.JSONException)});
				}
				else {
					callback({"returnValue":false, "errorText":response.status});
				}
			},
			on0: function(response) {
				Mojo.Log.info("on0 %j", response);
				callback({"returnValue":false, "errorText":response.status});
			}
	});

	this.updateSpinner();

	this.authenticateFromDeviceButtonModel.disabled = true;
	this.controller.modelChanged(this.authenticateFromDeviceButtonModel);
};

WebServicesExploreAssistant.prototype.authenticateFromDevice = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (authenticateFromDevice):</b><br>'+payload.errorText);
		return;
	}

	this.requestWebService = false;

	this.updateSpinner();

	this.authenticateFromDeviceButtonModel.disabled = false;
	this.controller.modelChanged(this.authenticateFromDeviceButtonModel);

	if (payload.response.AuthenticateInfoEx) {
		// this.controller.stageController.pushScene("item", "Authentication Info", payload.response.AuthenticateInfoEx);
		var info = payload.response.AuthenticateInfoEx;
		if (this.requestDb8) this.requestDb8.cancel();
		this.requestDb8 = ImpostahService.impersonate(this.authenticationUpdateHandler,
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
};

WebServicesExploreAssistant.prototype.authenticationUpdate = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (authenticationUpdate):</b><br>'+payload.errorText);
		return;
	}

	this.controller.stageController.pushScene("item", "Authentication Update", payload);
};

WebServicesExploreAssistant.prototype.updateSpinner = function()
{
	if (this.requestDeviceProfile || this.requestPalmProfile || this.requestWebService)  {
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

WebServicesExploreAssistant.prototype.errorMessage = function(msg)
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

WebServicesExploreAssistant.prototype.handleCommand = function(event)
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

WebServicesExploreAssistant.prototype.cleanup = function(event)
{
	this.controller.stopListening(this.deviceProfileButton,  Mojo.Event.tap,
								  this.deviceProfileTapHandler);
	this.controller.stopListening(this.palmProfileButton,  Mojo.Event.tap,
								  this.palmProfileTapHandler);
	this.controller.stopListening(this.deviceInUseButton,  Mojo.Event.tap,
								  this.deviceInUseTapHandler);
	this.controller.stopListening(this.authenticateFromDeviceButton,  Mojo.Event.tap,
								  this.authenticateFromDeviceTapHandler);
};

// Local Variables:
// tab-width: 4
// End:
