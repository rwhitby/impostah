function AppCatalogAssistant()
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

	this.paidAppsButtonModel = {
		label: $L("Check Paid Apps Access"),
		disabled: true
	};
	this.accessCountryButtonModel = {
		label: $L("Check Access Country"),
		disabled: true
	};
};

AppCatalogAssistant.prototype.setup = function()
{
	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	// get elements
	this.iconElement =			this.controller.get('icon');
	this.iconElement.style.display = 'none';
	this.spinnerElement = 		this.controller.get('spinner');
	this.palmProfileButton = this.controller.get('palmProfileButton');
	this.paidAppsButton = this.controller.get('paidAppsButton');
	this.accessCountryButton = this.controller.get('accessCountryButton');
	
	// setup handlers
	this.getPalmProfileHandler =	this.getPalmProfile.bindAsEventListener(this);
	this.palmProfileTapHandler = this.palmProfileTap.bindAsEventListener(this);
	this.getDeviceProfileHandler =	this.getDeviceProfile.bindAsEventListener(this);
	this.paidAppsTapHandler = this.paidAppsTap.bindAsEventListener(this);
	this.paidAppsHandler =	this.paidApps.bindAsEventListener(this);
	this.accessCountryTapHandler = this.accessCountryTap.bindAsEventListener(this);
	this.accessCountryHandler =	this.accessCountry.bindAsEventListener(this);
	
	// setup wigets
	this.spinnerModel = {spinning: true};
	this.controller.setupWidget('spinner', {spinnerSize: 'small'}, this.spinnerModel);
	this.controller.setupWidget('palmProfileButton', { }, this.palmProfileButtonModel);
	this.controller.listen(this.palmProfileButton,  Mojo.Event.tap, this.palmProfileTapHandler);
	this.controller.setupWidget('paidAppsButton', { }, this.paidAppsButtonModel);
	this.controller.listen(this.paidAppsButton,  Mojo.Event.tap, this.paidAppsTapHandler);
	this.controller.setupWidget('accessCountryButton', { }, this.accessCountryButtonModel);
	this.controller.listen(this.accessCountryButton,  Mojo.Event.tap, this.accessCountryTapHandler);
	
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

AppCatalogAssistant.prototype.getDeviceProfile = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (getDeviceProfile):</b><br>'+payload.errorText);
		return;
	}

	if (this.requestDeviceProfile) this.requestDeviceProfile.cancel();
	this.requestDeviceProfile = false;

	this.updateSpinner();

	this.deviceProfile = payload.deviceInfo;

	if (this.palmProfile && this.deviceProfile) {
		this.paidAppsButtonModel.disabled = false;
		this.controller.modelChanged(this.paidAppsButtonModel);

		this.accessCountryButtonModel.disabled = false;
		this.controller.modelChanged(this.accessCountryButtonModel);
	}
};

AppCatalogAssistant.prototype.getPalmProfile = function(payload)
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

	if (this.palmProfile && this.deviceProfile) {
		this.paidAppsButtonModel.disabled = false;
		this.controller.modelChanged(this.paidAppsButtonModel);

		this.accessCountryButtonModel.disabled = false;
		this.controller.modelChanged(this.accessCountryButtonModel);
	}
};

AppCatalogAssistant.prototype.palmProfileTap = function(event)
{
	if (this.palmProfile) {
		this.controller.stageController.pushScene("item", "Palm Profile", this.palmProfile);
	}
};

AppCatalogAssistant.prototype.paidAppsTap = function(event)
{
	var callback = this.paidAppsHandler;

	var url = this.palmProfile.accountServerUrl+"getAppCatUserFlags";
	var body = {
		"InGetAppCatUserFlags": {
			"accountTokenInfo": {
				"token": this.palmProfile.token,
				"deviceId": this.deviceProfile.deviceId,
				"email": this.palmProfile.alias
			}
		}
	};

	Mojo.Log.warn("request %j", body);

	this.requestPaidApps = new Ajax.Request(url, {
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

	this.paidAppsButtonModel.disabled = true;
	this.controller.modelChanged(this.paidAppsButtonModel);
};

AppCatalogAssistant.prototype.paidApps = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (paidApps):</b><br>'+payload.errorText);
		return;
	}

	this.requestPaidApps = false;

	this.updateSpinner();

	this.paidAppsButtonModel.disabled = false;
	this.controller.modelChanged(this.paidAppsButtonModel);

	if (payload.response.OutGetAppCatUserFlags) {
		var payments = payload.response.OutGetAppCatUserFlags.enablePaymentSetup;
		this.controller.stageController.pushScene("item", "Paid Apps Access", payments);
	}
};

AppCatalogAssistant.prototype.accessCountryTap = function(event)
{
	var callback = this.accessCountryHandler;

	var url = this.palmProfile.accountServerUrl+"appList_ext2";

	var body = {
		"InGetAppListV2": {
			"qid": "Blowfish2Query1",
			"locale":"en_us",
			"accountTokenInfo": {
				"token": this.palmProfile.token,
				"deviceId": this.deviceProfile.deviceId,
				"email": this.palmProfile.alias
			}
		}
	};

	Mojo.Log.warn("request %j", body);

	this.requestAccessCountry = new Ajax.Request(url, {
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

	this.accessCountryButtonModel.disabled = true;
	this.controller.modelChanged(this.accessCountryButtonModel);
};

AppCatalogAssistant.prototype.accessCountry = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (accessCountry):</b><br>'+payload.errorText);
		return;
	}

	this.requestAccessCountry = false;

	this.updateSpinner();

	this.accessCountryButtonModel.disabled = false;
	this.controller.modelChanged(this.accessCountryButtonModel);

	if (payload.response.OutGetAppList) {
		var country = payload.response.OutGetAppList.country;
		this.controller.stageController.pushScene("item", "Access Country", country);
	}
};

AppCatalogAssistant.prototype.updateSpinner = function()
{
	if (this.requestDeviceProfile || this.requestPalmProfile || this.requestPaidApps || this.requestAccessCountry)  {
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

AppCatalogAssistant.prototype.errorMessage = function(msg)
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

AppCatalogAssistant.prototype.handleCommand = function(event)
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

AppCatalogAssistant.prototype.cleanup = function(event)
{
	this.controller.stopListening(this.palmProfileButton,  Mojo.Event.tap,
								  this.palmProfileTapHandler);
	this.controller.stopListening(this.paidAppsButton,  Mojo.Event.tap,
								  this.paidAppsTapHandler);
	this.controller.stopListening(this.accessCountryButton,  Mojo.Event.tap,
								  this.accessCountryTapHandler);
};

// Local Variables:
// tab-width: 4
// End:
