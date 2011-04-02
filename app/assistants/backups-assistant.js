function BackupsAssistant()
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

	this.getAuthTokenButtonModel = {
		label: $L("Get Auth Token"),
		disabled: true
	};

	this.manifestSelectorModel = {
		label: $L("Backup Manifests"),
		disabled: true,
		choices: [ ]
	};

	this.showManifestButtonModel = {
		label: $L("Show Backup Manifest"),
		disabled: true
	};
};

BackupsAssistant.prototype.setup = function()
{
	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	// get elements
	this.iconElement =			this.controller.get('icon');
	this.iconElement.style.display = 'none';
	this.spinnerElement = 		this.controller.get('spinner');
	this.palmProfileButton = this.controller.get('palmProfileButton');
	this.getAuthTokenButton = this.controller.get('getAuthTokenButton');
	this.manifestSelector = this.controller.get('manifestSelector');
	this.showManifestButton = this.controller.get('showManifestButton');
	
	// setup handlers
	this.getDeviceProfileHandler =	this.getDeviceProfile.bindAsEventListener(this);
	this.getPalmProfileHandler =	this.getPalmProfile.bindAsEventListener(this);
	this.palmProfileTapHandler = this.palmProfileTap.bindAsEventListener(this);
	this.getAuthTokenTapHandler = this.getAuthTokenTap.bindAsEventListener(this);
	this.getAuthTokenHandler = this.getAuthToken.bindAsEventListener(this);
	this.showManifestTapHandler = this.showManifestTap.bindAsEventListener(this);
	this.showManifestHandler = this.showManifest.bindAsEventListener(this);
	
	// setup wigets
	this.spinnerModel = {spinning: true};
	this.controller.setupWidget('spinner', {spinnerSize: 'small'}, this.spinnerModel);
	this.controller.setupWidget('palmProfileButton', { }, this.palmProfileButtonModel);
	this.controller.listen(this.palmProfileButton, Mojo.Event.tap, this.palmProfileTapHandler);
	this.controller.setupWidget('getAuthTokenButton', { }, this.getAuthTokenButtonModel);
	this.controller.listen(this.getAuthTokenButton, Mojo.Event.tap, this.getAuthTokenTapHandler);
	this.controller.setupWidget('manifestSelector', { }, this.manifestSelectorModel);
	this.controller.setupWidget('showManifestButton', { }, this.showManifestButtonModel);
	this.controller.listen(this.showManifestButton, Mojo.Event.tap, this.showManifestTapHandler);
	
	// %%% FIXME %%%
	this.storageServerUrl = "https://sta.palmws.com/storageauth/";
	this.deviceProfile = false;
	this.palmProfile = false;

	this.requestDeviceProfile = ImpostahService.impersonate(this.getDeviceProfileHandler,
															"com.palm.configurator",
															"com.palm.deviceprofile",
															"getDeviceProfile", {});
	this.requestPalmProfile = ImpostahService.impersonate(this.getPalmProfileHandler,
														  "com.palm.configurator",
														  "com.palm.db",
														  "get", {"ids":["com.palm.palmprofile.token"]});

	this.updateSpinner();
};

BackupsAssistant.prototype.getDeviceProfile = function(payload)
{
	if (this.requestDeviceProfile) this.requestDeviceProfile.cancel();
	this.requestDeviceProfile = false;

	this.updateSpinner();

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (getDeviceProfile):</b><br>'+payload.errorText);
		return;
	}

	this.deviceProfile = payload.deviceInfo;

	this.updateButtons();

};

BackupsAssistant.prototype.getPalmProfile = function(payload)
{
	if (this.requestPalmProfile) this.requestPalmProfile.cancel();
	this.requestPalmProfile = false;

	this.updateSpinner();

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (getPalmProfile):</b><br>'+payload.errorText);
		return;
	}

	this.palmProfile = payload.results[0];

	this.updateButtons();
};

BackupsAssistant.prototype.palmProfileTap = function(event)
{
	if (this.palmProfile) {
		this.controller.stageController.pushScene("item", "Palm Profile", this.palmProfile);
	}
};

BackupsAssistant.prototype.getAuthTokenTap = function(event)
{
	var callback = this.getAuthTokenHandler;

	var deviceId = this.deviceProfile.deviceId;
	if (deviceId.indexOf("IMEI") === 0) {
		deviceId = deviceId.substring(0, deviceId.length - 2);
	}

	var url = (this.storageServerUrl+"?email="+encodeURIComponent(this.palmProfile.alias)+
			   "&deviceId="+ encodeURIComponent(deviceId)+
			   "&token="+encodeURIComponent(this.palmProfile.token));

	Mojo.Log.warn("request %s", url);

	this.requestWebService = new Ajax.Request(url, {
			method: 'POST',
			evalJSON: false, evalJS: false,
			onSuccess: function(response) {
				response = response.responseText;
				Mojo.Log.warn("onSuccess %s", response);
				if (!response) {
					Mojo.Log.warn("callback no value");
					callback({"returnValue":true}); // Empty replies are okay
				}
				else {
					Mojo.Log.warn("callback %s", response);
					callback({"returnValue":true, "response":response});
				}
			},
			onFailure: function(response) {
				Mojo.Log.warn("onFailure %j", response);
				callback({"returnValue":false, "errorText":response.status});
			},
			on0: function(response) {
				Mojo.Log.warn("on0 %j", response);
				callback({"returnValue":false, "errorText":response.status});
			}
	});

	this.updateSpinner();

	this.getAuthTokenButtonModel.disabled = true;
	this.controller.modelChanged(this.getAuthTokenButtonModel);
};

BackupsAssistant.prototype.getAuthToken = function(payload)
{
	this.requestWebService = false;

	this.updateSpinner();

	this.getAuthTokenModel.disabled = false;
	this.controller.modelChanged(this.getAuthTokenButtonModel);

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (getAuthToken):</b><br>'+payload.errorText);
		return;
	}

	this.manifestSelectorModel.disabled = false;
	this.controller.modelChanged(this.manifestSelectorModel);
	this.showManifestButtonModel.disabled = false;
	this.controller.modelChanged(this.showManifestButtonModel);

	Mojo.Log.warn("getAuthToken %s", payload.response);

	if (payload.response) {
		this.controller.stageController.pushScene("item", "Auth Token", payload.response);
	}
};

BackupsAssistant.prototype.showManifestTap = function(event)
{
	var callback = this.showManifestHandler;

	var deviceId = this.deviceProfile.deviceId;
	if (deviceId.indexOf("IMEI") === 0) {
		deviceId = deviceId.substring(0, deviceId.length - 2);
	}

	var url = (this.storageServerUrl+"?email="+encodeURIComponent(this.palmProfile.alias)+
			   "&deviceId="+ encodeURIComponent(deviceId)+
			   "&token="+encodeURIComponent(this.palmProfile.token));

	Mojo.Log.warn("request %s", url);

	this.requestWebService = new Ajax.Request(url, {
			method: 'POST',
			evalJSON: false, evalJS: false,
			onSuccess: function(response) {
				response = response.responseText;
				Mojo.Log.warn("onSuccess %s", response);
				if (!response) {
					callback({"returnValue":true}); // Empty replies are okay
				}
				else {
					callback({"returnValue":true, "response":response});
				}
			},
			onFailure: function(response) {
				Mojo.Log.warn("onFailure %j", response);
				callback({"returnValue":false, "errorText":response.status});
			},
			on0: function(response) {
				Mojo.Log.warn("on0 %j", response);
				callback({"returnValue":false, "errorText":response.status});
			}
	});

	this.updateSpinner();

	this.showManifestButtonModel.disabled = true;
	this.controller.modelChanged(this.showManifestButtonModel);
};

BackupsAssistant.prototype.showManifest = function(payload)
{
	this.requestWebService = false;

	this.updateSpinner();

	this.showManifestModel.disabled = false;
	this.controller.modelChanged(this.showManifestButtonModel);

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (showManifest):</b><br>'+payload.errorText);
		return;
	}

	if (payload.response) {
		this.controller.stageController.pushScene("item", "Backup Manifest", payload.response);
	}
};

BackupsAssistant.prototype.updateSpinner = function()
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

BackupsAssistant.prototype.updateButtons = function()
{
	if (this.palmProfile) {
		this.palmProfileButtonModel.disabled = false;
		this.controller.modelChanged(this.palmProfileButtonModel);
	}

	if (!this.requestPalmProfile && this.deviceProfile) {
		this.getAuthTokenButtonModel.disabled = false;
		this.controller.modelChanged(this.getAuthTokenButtonModel);
	}
};

BackupsAssistant.prototype.errorMessage = function(msg)
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

BackupsAssistant.prototype.handleCommand = function(event)
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

BackupsAssistant.prototype.cleanup = function(event)
{
	this.controller.stopListening(this.palmProfileButton,  Mojo.Event.tap,
								  this.palmProfileTapHandler);
	this.controller.stopListening(this.getAuthTokenButton,  Mojo.Event.tap,
								  this.getAuthTokenTapHandler);
	this.controller.stopListening(this.showManifestButton,  Mojo.Event.tap,
								  this.showManifestTapHandler);
};

// Local Variables:
// tab-width: 4
// End:
