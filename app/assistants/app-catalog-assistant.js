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
	
	this.appIdInputFieldModel = {
		label: $L("Application ID"),
		disabled: true
	};

	this.getAppInfoButtonModel = {
		label: $L("Get Application Info"),
		disabled: true
	};

	this.showAppInfoButtonModel = {
		label: $L("Show Application Info"),
		disabled: true
	};

	this.installAppButtonModel = {
		label: $L("Install Application"),
		disabled: true
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

};

AppCatalogAssistant.prototype.setup = function()
{
	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	// get elements
	this.iconElement =			this.controller.get('icon');
	this.iconElement.style.display = 'none';
	this.spinnerElement = 		this.controller.get('spinner');
	this.appIdInputField = this.controller.get('appIdInputField');
	this.getAppInfoButton = this.controller.get('getAppInfoButton');
	this.showAppInfoButton = this.controller.get('showAppInfoButton');
	this.installAppButton = this.controller.get('installAppButton');
	this.installStatus = this.controller.get('installStatus');
	this.palmProfileButton = this.controller.get('palmProfileButton');
	this.paidAppsButton = this.controller.get('paidAppsButton');
	this.accessCountryButton = this.controller.get('accessCountryButton');
	this.paymentInfoButton = this.controller.get('paymentInfoButton');
	this.billingCountriesButton = this.controller.get('billingCountriesButton');
	
	// setup handlers
	this.getPalmProfileHandler =	this.getPalmProfile.bindAsEventListener(this);
	this.getDeviceProfileHandler =	this.getDeviceProfile.bindAsEventListener(this);
	this.appIdChangedHandler = this.appIdChanged.bindAsEventListener(this);
	this.getAppInfoTapHandler = this.getAppInfoTap.bindAsEventListener(this);
	this.getAppInfoHandler =	this.getAppInfo.bindAsEventListener(this);
	this.showAppInfoTapHandler = this.showAppInfoTap.bindAsEventListener(this);
	this.installAppTapHandler = this.installAppTap.bindAsEventListener(this);
	this.installAppHandler =	this.installApp.bindAsEventListener(this);
	this.rescanAppHandler =	this.rescanApp.bindAsEventListener(this);
	this.palmProfileTapHandler = this.palmProfileTap.bindAsEventListener(this);
	this.paidAppsTapHandler = this.paidAppsTap.bindAsEventListener(this);
	this.paidAppsHandler =	this.paidApps.bindAsEventListener(this);
	this.accessCountryTapHandler = this.accessCountryTap.bindAsEventListener(this);
	this.accessCountryHandler =	this.accessCountry.bindAsEventListener(this);
	this.paymentInfoTapHandler = this.paymentInfoTap.bindAsEventListener(this);
	this.paymentInfoHandler =	this.paymentInfo.bindAsEventListener(this);
	this.billingCountriesTapHandler = this.billingCountriesTap.bindAsEventListener(this);
	this.billingCountriesHandler =	this.billingCountries.bindAsEventListener(this);
	
	// setup wigets
	this.spinnerModel = {spinning: true};
	this.controller.setupWidget('spinner', {spinnerSize: 'small'}, this.spinnerModel);
	this.controller.setupWidget('appIdInputField', {
			autoFocus: true,
				autoReplace: false,
				hintText: 'Enter geo.restricted.app id ...',
				changeOnKeyPress: true,
				textCase: Mojo.Widget.steModeLowerCase,
				focusMode: Mojo.Widget.focusSelectMode },
		this.appIdInputFieldModel);
	this.controller.listen(this.appIdInputField, Mojo.Event.propertyChange, this.appIdChangedHandler);
	this.controller.setupWidget('getAppInfoButton', { }, this.getAppInfoButtonModel);
	this.controller.listen(this.getAppInfoButton, Mojo.Event.tap, this.getAppInfoTapHandler);
	this.controller.setupWidget('showAppInfoButton', { }, this.showAppInfoButtonModel);
	this.controller.listen(this.showAppInfoButton, Mojo.Event.tap, this.showAppInfoTapHandler);
	this.controller.setupWidget('installAppButton', { }, this.installAppButtonModel);
	this.controller.listen(this.installAppButton, Mojo.Event.tap, this.installAppTapHandler);
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
	
	// %%% FIXME %%%
	this.paymentServerUrl = "https://pmt.palmws.com/palmcspmtext/services/paymentJ/";
	this.palmProfile = false;
	this.deviceProfile = false;
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
		this.appIdInputFieldModel.disabled = false;
		this.controller.modelChanged(this.appIdInputFieldModel);
		this.paidAppsButtonModel.disabled = false;
		this.controller.modelChanged(this.paidAppsButtonModel);
		this.accessCountryButtonModel.disabled = false;
		this.controller.modelChanged(this.accessCountryButtonModel);
		this.paymentInfoButtonModel.disabled = false;
		this.controller.modelChanged(this.paymentInfoButtonModel);
		this.billingCountriesButtonModel.disabled = false;
		this.controller.modelChanged(this.billingCountriesButtonModel);
	}
};

AppCatalogAssistant.prototype.appIdChanged = function(event)
{
	if (event.value != '') {
		this.getAppInfoButtonModel.disabled = false;
		this.controller.modelChanged(this.getAppInfoButtonModel);
	}
	else {
		this.getAppInfoButtonModel.disabled = true;
		this.controller.modelChanged(this.getAppInfoButtonModel);
	}

	this.showAppInfoButtonModel.disabled = true;
	this.controller.modelChanged(this.showAppInfoButtonModel);
	this.installAppButtonModel.disabled = true;
	this.controller.modelChanged(this.installAppButtonModel);
};

AppCatalogAssistant.prototype.getAppInfoTap = function(event)
{
	var callback = this.getAppInfoHandler;

	var url = this.palmProfile.accountServerUrl+"getListOfUpdatableApps";
	var body = {
		"InGetUpdatableApps": {
			"accountTokenInfo": {
				"token": this.palmProfile.token,
				"deviceId": this.deviceProfile.deviceId,
				"email": this.palmProfile.alias,
				// "carrier": this.deviceProfile.carrier
			},
			"packageIds": [this.appIdInputFieldModel.value],
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
	this.showAppInfoButtonModel.disabled = true;
	this.controller.modelChanged(this.showAppInfoButtonModel);
	this.installAppButtonModel.disabled = true;
	this.controller.modelChanged(this.installAppButtonModel);
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

	this.appInfo = payload.response.OutUpdateInfoList.appSummaryForUpdates;

	if (this.appInfo) {
		this.getAppInfoButtonModel.disabled = false;
		this.controller.modelChanged(this.getAppInfoButtonModel);
		this.showAppInfoButtonModel.disabled = false;
		this.controller.modelChanged(this.showAppInfoButtonModel);
		this.installAppButtonModel.disabled = false;
		this.controller.modelChanged(this.installAppButtonModel);
	}

};

AppCatalogAssistant.prototype.showAppInfoTap = function(event)
{
	if (this.appInfo) {
		this.controller.stageController.pushScene("item", "App Info", this.appInfo);
	}
};

AppCatalogAssistant.prototype.installAppTap = function(event)
{
	var callback = this.installAppHandler;

	this.requestAppInstall = ImpostahService.impersonate(this.installAppHandler,
														 "com.palm.app.swmanager",
														 "com.palm.appInstallService",
														 "install",{
															 "catalogId": this.appInfo.id,
															 "id": this.appInfo.publicApplicationId,
															 // we don't have access to the real title
															 "title": this.appInfo.publicApplicationId,
															 "version": this.appInfo.appVersion,
															 "vendor": this.appInfo.vendor,
															 "vendorUrl": this.appInfo.homeURL,
															 "iconUrl": this.appInfo.appIcon,
															 "ipkUrl": this.appInfo.packageUrl,
															 "authToken": this.palmProfile.token,
															 "deviceId": this.deviceProfile.deviceId,
															 "email": this.palmProfile.alias,
															 "subscribe": true
														 });

	this.updateSpinner();

	this.installAppButtonModel.disabled = true;
	this.controller.modelChanged(this.installAppButtonModel);
};

AppCatalogAssistant.prototype.installApp = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (installApp):</b><br>'+payload.errorText);

		this.requestAppInstall = false;
		
		this.updateSpinner();

		this.installAppButtonModel.disabled = false;
		this.controller.modelChanged(this.installAppButtonModel);

		return;
	}

	var status = "";

	if (payload.statusValue) {
		switch (payload.statusValue) {
		case 1: // "icon download current"
			status = "Downloading Icon - "+payload.details.progress+"%";
			break;
		case 5: // "icon download complete"
			status = "Icon Downloaded";
			break;
		case 7: // "ipk download current"
		case 8: // "ipk download current"
			status = "Downloading Package - "+payload.details.progress+"%";
			break;
		case 20: // "ipk download paused"
			status = "Package Download Paused - "+payload.details.progress+"%";
			break;
		case 9: // "ipk download complete"
			status = "Package Downloaded";
			break;
		case 16: // "download failed"
			status = "Package Download Failed";
			if (this.requestAppInstall) this.requestAppInstall.cancel();
			this.requestAppInstall = false;
			this.updateSpinner();
			this.installAppButtonModel.disabled = false;
			this.controller.modelChanged(this.installAppButtonModel);
			break;
		case 10: // "installing"
			status = "Installing Package - "+payload.details.progress+"%";
			break;
		case 15: // "cancelled"
			status = "Package Install Cancelled";
			if (this.requestAppInstall) this.requestAppInstall.cancel();
			this.requestAppInstall = false;
			this.updateSpinner();
			this.installAppButtonModel.disabled = false;
			this.controller.modelChanged(this.installAppButtonModel);
			break;
		case 11: // "installed"
			status = "Package Installed";
			if (this.requestAppInstall) this.requestAppInstall.cancel();
			this.requestAppInstall = ImpostahService.impersonate(this.rescanAppHandler,
																 "com.palm.app.swmanager",
																 "com.palm.applicationManager",
																 "rescan",{
																	 "id": this.appInfo.publicApplicationId
																 });
			break;
		default:
			status = ("statusValue: "+payload.statusValue+
					  ", state: "+payload.details.state+
					  ", progress: "+payload.details.progress+
					  ", reason: "+payload.details.reason);
			this.errorMessage('<b>Service Error (installApp):</b><br>'+status);
			if (this.requestAppInstall) this.requestAppInstall.cancel();
			this.requestAppInstall = false;
			this.updateSpinner();
			this.installAppButtonModel.disabled = false;
			this.controller.modelChanged(this.installAppButtonModel);
			break;
		}

		this.installStatus.innerHTML = status;
	}

};

AppCatalogAssistant.prototype.rescanApp = function(payload)
{
	this.requestAppInstall = false;
		
	this.updateSpinner();

	this.installAppButtonModel.disabled = false;
	this.controller.modelChanged(this.installAppButtonModel);

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (rescanApp):</b><br>'+payload.errorText);
		return;
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
	this.controller.stopListening(this.appIdInputField, Mojo.Event.propertyChange,
								  this.appIdChangedHandler);
	this.controller.stopListening(this.getAppInfoButton,  Mojo.Event.tap,
								  this.getAppInfoTapHandler);
	this.controller.stopListening(this.installAppButton,  Mojo.Event.tap,
								  this.installAppTapHandler);
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
};

// Local Variables:
// tab-width: 4
// End: