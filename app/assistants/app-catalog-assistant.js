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
		value: '',
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

	this.promoCodeInputFieldModel = {
		label: $L("Promo Code"),
		value: '',
		disabled: true
	};

	this.getCodeInfoButtonModel = {
		label: $L("Get Code Info"),
		disabled: true
	};

 	this.checkCodeStatusButtonModel = {
		label: $L("Check Code Status"),
		disabled: true
	};

	this.palmProfile = false;
	this.deviceProfile = false;
	this.appInfo = false;
	this.promoCodeInfo = false;

	this.requestPalmService = false;
	this.requestWebService = false;

	// %%% FIXME %%%
	// palm://com.palm.accountservices/getServerUrl '{}'
	// {"serverUrl":"https://ps.palmws.com/palmcsext/services/deviceJ/","returnValue":true}
	this.accountServerUrl = "https://ps.palmws.com/palmcsext/services/deviceJ/";
	// https://ps.palmws.com/palmcsext/services/deviceJ/getPreferences
	// {"InPreferences":{"preferenceKey":"APPLICATIONS, PAYMENT","category":""}}
	// {"OutParameterInfo":{"parameterInfos":{"category":"SETTINGS","key":"PAYMENT_URL","value":"https://pmt.palmws.com/palmcspmtext/services/paymentJ/"},"size":1}}
	this.paymentServerUrl = "https://pmt.palmws.com/palmcspmtext/services/paymentJ/";
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
	this.promoCodeInputField = this.controller.get('promoCodeInputField');
	this.getCodeInfoButton = this.controller.get('getCodeInfoButton');
	this.checkCodeStatusButton = this.controller.get('checkCodeStatusButton');
	
	// setup handlers
	this.iconTapHandler = this.iconTap.bindAsEventListener(this);
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
	this.promoCodeChangedHandler = this.promoCodeChanged.bindAsEventListener(this);
	this.getCodeInfoTapHandler = this.getCodeInfoTap.bindAsEventListener(this);
	this.getCodeInfoHandler =	this.getCodeInfo.bindAsEventListener(this);
	this.checkCodeStatusTapHandler = this.checkCodeStatusTap.bindAsEventListener(this);
	this.checkCodeStatusHandler =	this.checkCodeStatus.bindAsEventListener(this);
	
	// setup wigets
	this.spinnerModel = {spinning: true};
	this.controller.setupWidget('spinner', {spinnerSize: 'small'}, this.spinnerModel);
	this.controller.listen(this.iconElement,  Mojo.Event.tap, this.iconTapHandler);
	this.controller.listen(this.spinnerElement,  Mojo.Event.tap, this.iconTapHandler);
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
	this.controller.setupWidget('promoCodeInputField', {
			autoFocus: true,
				autoReplace: false,
				hintText: 'Enter promo code ...',
				changeOnKeyPress: true,
				textCase: Mojo.Widget.steModeLowerCase,
				focusMode: Mojo.Widget.focusSelectMode },
		this.promoCodeInputFieldModel);
	this.controller.listen(this.promoCodeInputField, Mojo.Event.propertyChange, this.promoCodeChangedHandler);
	this.controller.setupWidget('getCodeInfoButton', { }, this.getCodeInfoButtonModel);
	this.controller.listen(this.getCodeInfoButton,  Mojo.Event.tap, this.getCodeInfoTapHandler);
	this.controller.setupWidget('checkCodeStatusButton', { }, this.checkCodeStatusButtonModel);
	this.controller.listen(this.checkCodeStatusButton,  Mojo.Event.tap, this.checkCodeStatusTapHandler);
};

AppCatalogAssistant.prototype.activate = function()
{
	this.deviceProfile = false;
	this.updateSpinner(true);
	DeviceProfile.getDeviceProfile(this.getDeviceProfile.bind(this), false);
};

AppCatalogAssistant.prototype.getDeviceProfile = function(returnValue, deviceProfile, errorText)
{
	this.updateSpinner(false);

	if (returnValue === false) {
		this.errorMessage('<b>Service Error (getDeviceProfile):</b><br>'+errorText);
		return;
	}

	this.deviceProfile = deviceProfile;

	this.palmProfile = false;
	this.updateSpinner(true);
	PalmProfile.getPalmProfile(this.getPalmProfile.bind(this), false);
};

AppCatalogAssistant.prototype.getPalmProfile = function(returnValue, palmProfile, errorText)
{
	this.updateSpinner(false);

	if (returnValue === false) {
		this.errorMessage('<b>Service Error (getPalmProfile):</b><br>'+errorText);
		return;
	}

	this.palmProfile = palmProfile;

	if (this.palmProfile) {
		this.palmProfileButtonModel.disabled = false;
		this.controller.modelChanged(this.palmProfileButtonModel);
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

	this.updateSpinner(true);

	this.getAppInfoButtonModel.disabled = true;
	this.controller.modelChanged(this.getAppInfoButtonModel);
};

AppCatalogAssistant.prototype.getAppInfo = function(payload)
{
	this.requestWebService = false;

	this.updateSpinner(false);

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
	else {
		this.errorMessage('<b>Application '+this.appIdInputFieldModel.value+' not found</b>');
		this.getAppInfoButtonModel.disabled = true;
		this.controller.modelChanged(this.getAppInfoButtonModel);
	}

};

AppCatalogAssistant.prototype.showAppInfoTap = function(event)
{
	if (this.appInfo) {
		this.controller.stageController.pushScene("item", "Application Info", this.appInfo);
	}
};

AppCatalogAssistant.prototype.installAppTap = function(event)
{
	var callback = this.installAppHandler;

	if (this.requestPalmService) this.requestPalmService.cancel();
	this.requestPalmService = ImpostahService.impersonate(this.installAppHandler,
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

	this.updateSpinner(true);

	this.installAppButtonModel.disabled = true;
	this.controller.modelChanged(this.installAppButtonModel);
};

AppCatalogAssistant.prototype.installApp = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (installApp):</b><br>'+payload.errorText);

		if (this.requestPalmService) this.requestPalmService.cancel();
		this.requestPalmService = false;

		this.updateSpinner(false);

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
			if (this.requestPalmService) this.requestPalmService.cancel();
			this.requestPalmService = false;
			this.updateSpinner(false);
			this.errorMessage('<b>Package Download Failed</b><br><br>Note that paid apps must be purchased before downloading.');
			this.installAppButtonModel.disabled = false;
			this.controller.modelChanged(this.installAppButtonModel);
			break;
		case 10: // "installing"
			status = "Installing Package - "+payload.details.progress+"%";
			break;
		case 15: // "cancelled"
			status = "Package Install Cancelled";
			if (this.requestPalmService) this.requestPalmService.cancel();
			this.requestPalmService = false;
			this.updateSpinner(false);
			this.installAppButtonModel.disabled = false;
			this.controller.modelChanged(this.installAppButtonModel);
			break;
		case 11: // "installed"
			status = "Package Installed";
			if (this.requestPalmService) this.requestPalmService.cancel();
			this.requestPalmService = ImpostahService.impersonate(this.rescanAppHandler,
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
			if (this.requestPalmService) this.requestPalmService.cancel();
			this.requestPalmService = false;
			this.updateSpinner(false);
			this.installAppButtonModel.disabled = false;
			this.controller.modelChanged(this.installAppButtonModel);
			break;
		}

		this.installStatus.innerHTML = status;
	}

};

AppCatalogAssistant.prototype.rescanApp = function(payload)
{
	if (this.requestPalmService) this.requestPalmService.cancel();
	this.requestPalmService = false;

	this.updateSpinner(false);

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

	this.updateSpinner(true);

	this.paidAppsButtonModel.disabled = true;
	this.controller.modelChanged(this.paidAppsButtonModel);
};

AppCatalogAssistant.prototype.paidApps = function(payload)
{
	this.requestWebService = false;

	this.updateSpinner(false);

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

	this.updateSpinner(true);

	this.accessCountryButtonModel.disabled = true;
	this.controller.modelChanged(this.accessCountryButtonModel);
};

AppCatalogAssistant.prototype.accessCountry = function(payload)
{
	this.requestWebService = false;

	this.updateSpinner(false);

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

	this.updateSpinner(true);

	this.paymentInfoButtonModel.disabled = true;
	this.controller.modelChanged(this.paymentInfoButtonModel);
};

AppCatalogAssistant.prototype.paymentInfo = function(payload)
{
	this.requestWebService = false;

	this.updateSpinner(false);

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

	this.updateSpinner(true);

	this.billingCountriesButtonModel.disabled = true;
	this.controller.modelChanged(this.billingCountriesButtonModel);
};

AppCatalogAssistant.prototype.billingCountries = function(payload)
{
	this.requestWebService = false;

	this.updateSpinner(false);

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

AppCatalogAssistant.prototype.promoCodeChanged = function(event)
{
	if (event.value != '') {
		this.getCodeInfoButtonModel.disabled = false;
		this.controller.modelChanged(this.getCodeInfoButtonModel);
	}
	else {
		this.getCodeInfoButtonModel.disabled = true;
		this.controller.modelChanged(this.getCodeInfoButtonModel);
	}
	this.checkCodeStatusButtonModel.disabled = true;
	this.controller.modelChanged(this.checkCodeStatusButtonModel);
};

AppCatalogAssistant.prototype.getCodeInfoTap = function(event)
{
	var callback = this.getCodeInfoHandler;

	var url = this.paymentServerUrl+"getPromoCodeInfos";
	var body = {
		"InGetPromoCodeInfos": {
			"authToken": this.palmProfile.token,
			"accountAlias": this.palmProfile.alias,
			"deviceId": this.deviceProfile.deviceId,
			"code": this.promoCodeInputFieldModel.value
		}
	};

	Mojo.Log.warn("request %j", body);

	this.promoCodeInfo = false;

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

	this.getCodeInfoButtonModel.disabled = true;
	this.controller.modelChanged(this.getCodeInfoButtonModel);
};

AppCatalogAssistant.prototype.getCodeInfo = function(payload)
{
	this.requestWebService = false;

	this.updateSpinner(false);

	this.getCodeInfoButtonModel.disabled = false;
	this.controller.modelChanged(this.getCodeInfoButtonModel);

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (getCodeInfo):</b><br>'+payload.errorText);
		return;
	}

	this.promoCodeInfo = payload.response.OutGetPromoCodeInfos;

	if (this.promoCodeInfo) {
		this.controller.stageController.pushScene("item", "Promo Code Info", this.promoCodeInfo);
		this.checkCodeStatusButtonModel.disabled = false;
		this.controller.modelChanged(this.checkCodeStatusButtonModel);
	}
};

AppCatalogAssistant.prototype.checkCodeStatusTap = function(event)
{
	var callback = this.checkCodeStatusHandler;

	var url = this.paymentServerUrl+"checkPromoCodeStatus";

	var body = {
		"InCheckPromoCodeStatus": {
			"authToken": this.palmProfile.token,
			"accountAlias": this.palmProfile.alias,
			"deviceId": this.deviceProfile.deviceId,
			"code": this.promoCodeInputFieldModel.value,
			"id": this.promoCodeInfo.items[0].id,
			"version": this.promoCodeInfo.items[0].version
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

	this.checkCodeStatusButtonModel.disabled = true;
	this.controller.modelChanged(this.checkCodeStatusButtonModel);
};

AppCatalogAssistant.prototype.checkCodeStatus = function(payload)
{
	this.requestWebService = false;

	this.updateSpinner(false);

	this.checkCodeStatusButtonModel.disabled = false;
	this.controller.modelChanged(this.checkCodeStatusButtonModel);

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (checkCodeStatus):</b><br>'+payload.errorText);
		return;
	}

	if (payload.response.OutCheckPromoCodeStatus) {
		var status = payload.response.OutCheckPromoCodeStatus;
		this.controller.stageController.pushScene("item", "Promo Code Status", status);
	}
};

AppCatalogAssistant.prototype.updateSpinner = function(active)
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

AppCatalogAssistant.prototype.iconTap = function(event)
{
	this.controller.stageController.popScene();
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
	this.controller.stopListening(this.iconElement,  Mojo.Event.tap,
								  this.iconTapHandler);
	this.controller.stopListening(this.spinnerElement,  Mojo.Event.tap,
								  this.iconTapHandler);
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
	this.controller.stopListening(this.promoCodeInputField, Mojo.Event.propertyChange,
								  this.promoCodeChangedHandler);
	this.controller.stopListening(this.getCodeInfoButton,  Mojo.Event.tap,
								  this.getCodeInfoTapHandler);
	this.controller.stopListening(this.checkCodeStatusButton,  Mojo.Event.tap,
								  this.checkCodeStatusTapHandler);
};

// Local Variables:
// tab-width: 4
// End:
