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
	this.paymentInfoButtonModel = {
		label: $L("Show Payment Info"),
		disabled: true
	};

 	this.billingCountriesButtonModel = {
		label: $L("Show Billing Countries"),
		disabled: true
	};

	this.appIdInputFieldModel = {
		label: $L("Application ID"),
		disabled: true
	};

	this.getAppInfoButtonModel = {
		label: $L("Get Application Info"),
		disabled: true
	};

	this.installAppButtonModel = {
		label: $L("Install Application"),
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
	this.paymentInfoButton = this.controller.get('paymentInfoButton');
	this.billingCountriesButton = this.controller.get('billingCountriesButton');
	this.appIdInputField = this.controller.get('appIdInputField');
	this.getAppInfoButton = this.controller.get('getAppInfoButton');
	this.installAppButton = this.controller.get('installAppButton');
	
	// setup handlers
	this.getPalmProfileHandler =	this.getPalmProfile.bindAsEventListener(this);
	this.palmProfileTapHandler = this.palmProfileTap.bindAsEventListener(this);
	this.getDeviceProfileHandler =	this.getDeviceProfile.bindAsEventListener(this);
	this.paidAppsTapHandler = this.paidAppsTap.bindAsEventListener(this);
	this.paidAppsHandler =	this.paidApps.bindAsEventListener(this);
	this.accessCountryTapHandler = this.accessCountryTap.bindAsEventListener(this);
	this.accessCountryHandler =	this.accessCountry.bindAsEventListener(this);
	this.paymentInfoTapHandler = this.paymentInfoTap.bindAsEventListener(this);
	this.paymentInfoHandler =	this.paymentInfo.bindAsEventListener(this);
	this.billingCountriesTapHandler = this.billingCountriesTap.bindAsEventListener(this);
	this.billingCountriesHandler =	this.billingCountries.bindAsEventListener(this);
	this.getAppInfoTapHandler = this.getAppInfoTap.bindAsEventListener(this);
	this.getAppInfoHandler =	this.getAppInfo.bindAsEventListener(this);
	this.installAppTapHandler = this.installAppTap.bindAsEventListener(this);
	this.installAppHandler =	this.installApp.bindAsEventListener(this);
	
	// setup wigets
	this.spinnerModel = {spinning: true};
	this.controller.setupWidget('spinner', {spinnerSize: 'small'}, this.spinnerModel);
	this.controller.setupWidget('palmProfileButton', { }, this.palmProfileButtonModel);
	this.controller.listen(this.palmProfileButton,  Mojo.Event.tap, this.palmProfileTapHandler);
	this.controller.setupWidget('paidAppsButton', { }, this.paidAppsButtonModel);
	this.controller.listen(this.paidAppsButton,  Mojo.Event.tap, this.paidAppsTapHandler);
	this.controller.setupWidget('accessCountryButton', { }, this.accessCountryButtonModel);
	this.controller.listen(this.accessCountryButton,  Mojo.Event.tap, this.accessCountryTapHandler);
	this.controller.setupWidget('paymentInfoButton', { }, this.paymentInfoButtonModel);
	this.controller.listen(this.paymentInfoButton,  Mojo.Event.tap, this.paymentInfoTapHandler);
	this.controller.setupWidget('billingCountriesButton', { }, this.billingCountriesButtonModel);
	this.controller.listen(this.billingCountriesButton,  Mojo.Event.tap, this.billingCountriesTapHandler);
	this.controller.setupWidget('appIdInputField', { 'textCase':Mojo.Widget.steModeLowerCase },
								this.appIdInputFieldModel);
	this.controller.setupWidget('getAppInfoButton', { }, this.getAppInfoButtonModel);
	this.controller.listen(this.getAppInfoButton, Mojo.Event.tap, this.getAppInfoTapHandler);
	this.controller.setupWidget('installAppButton', { }, this.installAppButtonModel);
	this.controller.listen(this.installAppButton, Mojo.Event.tap, this.installAppTapHandler);
	
	// %%% FIXME %%%
	this.paymentServerUrl = "https://pmt.palmws.com/palmcspmtext/services/paymentJ/";
	this.deviceProfile = false;
	this.palmProfile = false;
	this.appInfo = false;

	this.requestPalmProfile = ImpostahService.impersonate(this.getPalmProfileHandler,
														  "com.palm.configurator",
														  "com.palm.db",
														  "get", {"ids":["com.palm.palmprofile.token"]});

	this.updateSpinner();
};

AppCatalogAssistant.prototype.getPalmProfile = function(payload)
{
	if (this.requestPalmProfile) this.requestPalmProfile.cancel();
	this.requestPalmProfile = false;

	this.updateSpinner();

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (getPalmProfile):</b><br>'+payload.errorText);
		this.palmProfile = false;
		return;
	}

	this.palmProfile = payload.results[0];

	if (this.palmProfile) {
		this.palmProfileButtonModel.disabled = false;
		this.controller.modelChanged(this.palmProfileButtonModel);
	}

	this.requestDeviceProfile = ImpostahService.impersonate(this.getDeviceProfileHandler,
															"com.palm.configurator",
															"com.palm.deviceprofile",
															"getDeviceProfile", {});

	this.updateSpinner();

};

AppCatalogAssistant.prototype.getDeviceProfile = function(payload)
{
	if (this.requestDeviceProfile) this.requestDeviceProfile.cancel();
	this.requestDeviceProfile = false;

	this.updateSpinner();

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (getDeviceProfile):</b><br>'+payload.errorText);
		this.deviceProfile = false;
		return;
	}

	this.deviceProfile = payload.deviceInfo;

	if (this.deviceProfile) {
		this.paidAppsButtonModel.disabled = false;
		this.controller.modelChanged(this.paidAppsButtonModel);
		this.accessCountryButtonModel.disabled = false;
		this.controller.modelChanged(this.accessCountryButtonModel);
		this.paymentInfoButtonModel.disabled = false;
		this.controller.modelChanged(this.paymentInfoButtonModel);
		this.billingCountriesButtonModel.disabled = false;
		this.controller.modelChanged(this.billingCountriesButtonModel);
		this.appIdInputFieldModel.disabled = false;
		this.controller.modelChanged(this.appIdInputFieldModel);
		this.getAppInfoButtonModel.disabled = false;
		this.controller.modelChanged(this.getAppInfoButtonModel);
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

	this.paidAppsButtonModel.disabled = true;
	this.controller.modelChanged(this.paidAppsButtonModel);
};

AppCatalogAssistant.prototype.paidApps = function(payload)
{
	this.requestWebService = false;

	this.updateSpinner();

	this.paidAppsButtonModel.disabled = false;
	this.controller.modelChanged(this.paidAppsButtonModel);

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (paidApps):</b><br>'+payload.errorText);
		return;
	}

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

	this.accessCountryButtonModel.disabled = true;
	this.controller.modelChanged(this.accessCountryButtonModel);
};

AppCatalogAssistant.prototype.accessCountry = function(payload)
{
	this.requestWebService = false;

	this.updateSpinner();

	this.accessCountryButtonModel.disabled = false;
	this.controller.modelChanged(this.accessCountryButtonModel);

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (accessCountry):</b><br>'+payload.errorText);
		return;
	}

	if (payload.response.OutGetAppList) {
		var country = payload.response.OutGetAppList.country;
		this.controller.stageController.pushScene("item", "Access Country", country);
	}
};

AppCatalogAssistant.prototype.paymentInfoTap = function(event)
{
	var callback = this.paymentInfoHandler;

	var url = this.paymentServerUrl+"getCCPaymentInfos";
	var body = {
		"InGetCCPaymentInfos": {
			"authToken": this.palmProfile.token,
			"accountAlias": this.palmProfile.alias,
			"deviceId": this.deviceProfile.deviceId
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

	this.paymentInfoButtonModel.disabled = true;
	this.controller.modelChanged(this.paymentInfoButtonModel);
};

AppCatalogAssistant.prototype.paymentInfo = function(payload)
{
	this.requestWebService = false;

	this.updateSpinner();

	this.paymentInfoButtonModel.disabled = false;
	this.controller.modelChanged(this.paymentInfoButtonModel);

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (paymentInfo):</b><br>'+payload.errorText);
		return;
	}

	if (payload.response.OutGetCCPaymentInfos) {
		var payments = payload.response.OutGetCCPaymentInfos;
		this.controller.stageController.pushScene("item", "Payment Info", payments);
	}
};

AppCatalogAssistant.prototype.billingCountriesTap = function(event)
{
	var callback = this.billingCountriesHandler;

	var url = this.paymentServerUrl+"getBillToCountries";

	var body = {
		"InGetBillToCountries": {
			"authToken": this.palmProfile.token,
			"accountAlias": this.palmProfile.alias,
			"deviceId": this.deviceProfile.deviceId
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

	this.billingCountriesButtonModel.disabled = true;
	this.controller.modelChanged(this.billingCountriesButtonModel);
};

AppCatalogAssistant.prototype.billingCountries = function(payload)
{
	this.requestWebService = false;

	this.updateSpinner();

	this.billingCountriesButtonModel.disabled = false;
	this.controller.modelChanged(this.billingCountriesButtonModel);

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (billingCountries):</b><br>'+payload.errorText);
		return;
	}

	if (payload.response.OutGetBillToCountries) {
		var countries = payload.response.OutGetBillToCountries.billToCountries;
		this.controller.stageController.pushScene("item", "Billing Countries", countries);
	}
};

AppCatalogAssistant.prototype.getAppInfoTap = function(event)
{
	var callback = this.getAppInfoHandler;

	var url = this.palmProfile.accountServerUrl+"appDetail_ext2";
	var body = {
		"InGetAppDetailV2": {
			"accountTokenInfo": {
				"token": this.palmProfile.token,
				"deviceId": this.deviceProfile.deviceId,
				"email": this.palmProfile.alias,
				// "carrier": this.deviceProfile.carrier
			},
			"packageId": this.appIdInputFieldModel.value,
			// "locale": "en_us",
			// "appId": this.appInfo.id
		}
	};

	Mojo.Log.warn("request %j", body);

	this.appInfo = false;

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

	this.getAppInfoButtonModel.disabled = true;
	this.controller.modelChanged(this.getAppInfoButtonModel);
};

AppCatalogAssistant.prototype.getAppInfo = function(payload)
{
	this.requestWebService = false;

	this.updateSpinner();

	this.getAppInfoButtonModel.disabled = false;
	this.controller.modelChanged(this.getAppInfoButtonModel);

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (getAppInfo):</b><br>'+payload.errorText);
		return;
	}

	this.appInfo = payload.response.OutGetAppDetailV2.appDetail;

	if (this.appInfo) {
		this.installAppButtonModel.disabled = false;
		this.controller.modelChanged(this.installAppButtonModel);
		this.controller.stageController.pushScene("item", "App Info", this.appInfo);
	}

};

AppCatalogAssistant.prototype.installAppTap = function(event)
{
	var callback = this.installAppHandler;

	this.requestAppInstall = ImpostahService.impersonate(this.installAppHandler,
														 "com.palm.configurator",
														 "com.palm.appInstallService",
														 "install",{
															 "catalogId": this.appInfo.id,
															 "id": this.appInfo.publicApplicationId,
															 "title": this.appInfo.title,
															 "version": this.appInfo.version,
															 "vendor": this.appInfo.creator,
															 "vendorUrl": this.appInfo.homeURL,
															 "iconUrl": this.appInfo.appIcon,
															 "ipkUrl": this.appInfo.appLocation,
															 "authToken": this.palmProfile.token,
															 "deviceId": this.deviceProfile.deviceId,
															 "email": this.palmProfile.alias,
															 "noApp": this.appInfo.attributes.provides.noApp,
															 "dockMode": this.appInfo.attributes.provides.dockMode,
															 "universalSearch": this.appInfo.attributes.provides.universalSearch,
															 "loc_name": this.appInfo.title
														 });

	this.updateSpinner();

	this.installAppButtonModel.disabled = true;
	this.controller.modelChanged(this.installAppButtonModel);
};

AppCatalogAssistant.prototype.installApp = function(payload)
{
	this.requestAppInstall = false;

	this.updateSpinner();

	this.installAppButtonModel.disabled = false;
	this.controller.modelChanged(this.installAppButtonModel);

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (installApp):</b><br>'+payload.errorText);
		return;
	}

};

AppCatalogAssistant.prototype.updateSpinner = function()
{
	if (this.requestDeviceProfile || this.requestPalmProfile || this.requestWebService || this.requestAppInstall)  {
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
	this.controller.stopListening(this.paymentInfoButton,  Mojo.Event.tap,
								  this.paymentInfoTapHandler);
	this.controller.stopListening(this.billingCountriesButton,  Mojo.Event.tap,
								  this.billingCountriesTapHandler);
	this.controller.stopListening(this.getAppInfoButton,  Mojo.Event.tap,
								  this.getAppInfoTapHandler);
	this.controller.stopListening(this.installAppButton,  Mojo.Event.tap,
								  this.installAppTapHandler);
};

// Local Variables:
// tab-width: 4
// End:
