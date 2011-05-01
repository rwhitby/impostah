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

	this.showAppDetailsButtonModel = {
		label: $L("Show Application Details"),
		disabled: true
	};

	this.installAppButtonModel = {
		label: $L("Install Application"),
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
	this.appDetail = false;
	this.promoCodeInfo = false;

	this.requestPalmService = false;
	this.requestWebService = false;

	// %%% FIXME %%%
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
	this.overlay = 		this.controller.get('overlay'); this.overlay.hide();
	this.iconElement =			this.controller.get('icon');
	this.iconElement.style.display = 'none';
	this.spinnerElement = 		this.controller.get('spinner');
	this.appIdInputField = this.controller.get('appIdInputField');
	this.getAppInfoButton = this.controller.get('getAppInfoButton');
	this.showAppInfoButton = this.controller.get('showAppInfoButton');
	this.showAppDetailsButton = this.controller.get('showAppDetailsButton');
	this.installAppButton = this.controller.get('installAppButton');
	this.installStatus = this.controller.get('installStatus');
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
	this.showAppDetailsTapHandler = this.showAppDetailsTap.bindAsEventListener(this);
	this.getAppDetailsHandler =	this.getAppDetails.bindAsEventListener(this);
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
	this.controller.setupWidget('getAppInfoButton', { type: Mojo.Widget.activityButton }, this.getAppInfoButtonModel);
	this.controller.listen(this.getAppInfoButton, Mojo.Event.tap, this.getAppInfoTapHandler);
	this.controller.setupWidget('showAppInfoButton', { }, this.showAppInfoButtonModel);
	this.controller.listen(this.showAppInfoButton, Mojo.Event.tap, this.showAppInfoTapHandler);
	this.controller.setupWidget('showAppDetailsButton', { type: Mojo.Widget.activityButton }, this.showAppDetailsButtonModel);
	this.controller.listen(this.showAppDetailsButton, Mojo.Event.tap, this.showAppDetailsTapHandler);
	this.controller.setupWidget('installAppButton', { type: Mojo.Widget.activityButton }, this.installAppButtonModel);
	this.controller.listen(this.installAppButton, Mojo.Event.tap, this.installAppTapHandler);
	this.controller.setupWidget('paidAppsButton', { type: Mojo.Widget.activityButton }, this.paidAppsButtonModel);
	this.controller.listen(this.paidAppsButton,  Mojo.Event.tap, this.paidAppsTapHandler);
	this.controller.setupWidget('accessCountryButton', { type: Mojo.Widget.activityButton }, this.accessCountryButtonModel);
	this.controller.listen(this.accessCountryButton,  Mojo.Event.tap, this.accessCountryTapHandler);
	this.controller.setupWidget('paymentInfoButton', { type: Mojo.Widget.activityButton }, this.paymentInfoButtonModel);
	this.controller.listen(this.paymentInfoButton,  Mojo.Event.tap, this.paymentInfoTapHandler);
	this.controller.setupWidget('billingCountriesButton', { type: Mojo.Widget.activityButton }, this.billingCountriesButtonModel);
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
	this.controller.setupWidget('getCodeInfoButton', { type: Mojo.Widget.activityButton }, this.getCodeInfoButtonModel);
	this.controller.listen(this.getCodeInfoButton,  Mojo.Event.tap, this.getCodeInfoTapHandler);
	this.controller.setupWidget('checkCodeStatusButton', { type: Mojo.Widget.activityButton }, this.checkCodeStatusButtonModel);
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
		this.promoCodeInputFieldModel.disabled = false;
		this.controller.modelChanged(this.promoCodeInputFieldModel);
	}
	else {
		this.controller.showAlertDialog({
				allowHTMLMessage:	true,
				preventCancel:		true,
				title:				'Palm Profile Not Found',
				message:			'This device does not have an active Palm Profile associated with it.<br>An active Palm Profile is required to access App Catalog information.',
				choices:			[{label:$L("Ok"), value:'ok'}],
				onChoose:			function(e){}
			});
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
	this.showAppDetailsButtonModel.disabled = true;
	this.controller.modelChanged(this.showAppDetailsButtonModel);
	this.installAppButtonModel.disabled = true;
	this.controller.modelChanged(this.installAppButtonModel);
};

AppCatalogAssistant.prototype.getAppInfoTap = function(event)
{
	this.overlay.show();

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
};

AppCatalogAssistant.prototype.getAppInfo = function(payload)
{
	this.requestWebService = false;

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (getAppInfo):</b><br>'+payload.errorText);
		this.overlay.hide();
		this.getAppInfoButton.mojo.deactivate();
		return;
	}

	this.appInfo = payload.response.OutUpdateInfoList.appSummaryForUpdates;

	if (this.appInfo) {
		this.showAppInfoButtonModel.disabled = false;
		this.controller.modelChanged(this.showAppInfoButtonModel);
		this.showAppDetailsButtonModel.disabled = false;
		this.controller.modelChanged(this.showAppDetailsButtonModel);
		this.installAppButtonModel.disabled = false;
		this.controller.modelChanged(this.installAppButtonModel);
	}
	else {
		this.errorMessage('<b>Application '+this.appIdInputFieldModel.value+' not found</b>');
		this.getAppInfoButtonModel.disabled = true;
		this.controller.modelChanged(this.getAppInfoButtonModel);
	}

	this.overlay.hide();
	this.getAppInfoButton.mojo.deactivate();
};

AppCatalogAssistant.prototype.showAppInfoTap = function(event)
{
	if (this.appInfo) {
		this.controller.stageController.pushScene("item", "Application Info", this.appInfo,
												  this.appInfo.publicApplicationId);
	}
};

AppCatalogAssistant.prototype.showAppDetailsTap = function(event)
{
	this.overlay.show();

	var callback = this.getAppDetailsHandler;

	var url = this.palmProfile.accountServerUrl+"appDetail_ext2";
	var body = {
		"InGetAppDetailV2": {
			"accountTokenInfo": {
				"token": this.palmProfile.token,
				"deviceId": this.deviceProfile.deviceId,
				"email": this.palmProfile.alias,
				// "carrier": this.deviceProfile.carrier
			},
			"packageId": this.appInfo.publicApplicationId,
			// "locale": "en_us",
			"appId": this.appInfo.id,
		}
	};

	Mojo.Log.warn("request %j", body);

	this.appDetail = false;

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

AppCatalogAssistant.prototype.getAppDetails = function(payload)
{
	this.requestWebService = false;

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (getAppDetails):</b><br>'+payload.errorText);
		this.overlay.hide();
		this.showAppDetailsButton.mojo.deactivate();
		return;
	}

	this.appDetail = payload.response.OutGetAppDetailV2.appDetail;

	if (this.appDetail) {
		this.controller.stageController.pushScene("item", "Application Details", this.appDetail,
												  this.appInfo.publicApplicationId);
	}
	else {
		this.errorMessage('<b>Application '+this.appInfo.publicApplicationId+' not found</b>');
		this.showAppDetailsButtonModel.disabled = true;
		this.controller.modelChanged(this.showAppDetailsButtonModel);
	}

	this.overlay.hide();
	this.showAppDetailsButton.mojo.deactivate();
};

AppCatalogAssistant.prototype.installAppTap = function(event)
{
	this.overlay.show();

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
};

AppCatalogAssistant.prototype.installApp = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (installApp):</b><br>'+payload.errorText);

		if (this.requestPalmService) this.requestPalmService.cancel();
		this.requestPalmService = false;

		this.overlay.hide();
		this.installAppButton.mojo.deactivate();

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
			this.errorMessage('<b>Package Download Failed</b><br><br>Note that paid apps must be purchased before downloading.');
			this.overlay.hide();
			this.installAppButton.mojo.deactivate();
			break;
		case 10: // "installing"
			status = "Installing Package - "+payload.details.progress+"%";
			break;
		case 15: // "cancelled"
			status = "Package Install Cancelled";
			if (this.requestPalmService) this.requestPalmService.cancel();
			this.requestPalmService = false;
			this.overlay.hide();
			this.installAppButton.mojo.deactivate();
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
			this.overlay.hide();
			this.installAppButton.mojo.deactivate();
			break;
		}

		this.installStatus.innerHTML = status;
	}

};

AppCatalogAssistant.prototype.rescanApp = function(payload)
{
	if (this.requestPalmService) this.requestPalmService.cancel();
	this.requestPalmService = false;

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (rescanApp):</b><br>'+payload.errorText);
	}

	this.overlay.hide();
	this.installAppButton.mojo.deactivate();
};

AppCatalogAssistant.prototype.palmProfileTap = function(event)
{
	if (this.palmProfile) {
		this.controller.stageController.pushScene("item", "Palm Profile", this.palmProfile,
												  'com.palm.palmprofile.token');
	}
};

AppCatalogAssistant.prototype.paidAppsTap = function(event)
{
	this.overlay.show();

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
};

AppCatalogAssistant.prototype.paidApps = function(payload)
{
	this.requestWebService = false;

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (paidApps):</b><br>'+payload.errorText);
		this.overlay.hide();
		this.paidAppsButton.mojo.deactivate();
		return;
	}

	if (payload.response.OutGetAppCatUserFlags) {
		var payments = payload.response.OutGetAppCatUserFlags.enablePaymentSetup;
		this.controller.stageController.pushScene("item", "Paid Apps Access", payments, 'payments');
	}

	this.overlay.hide();
	this.paidAppsButton.mojo.deactivate();
};

AppCatalogAssistant.prototype.accessCountryTap = function(event)
{
	this.overlay.show();

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
};

AppCatalogAssistant.prototype.accessCountry = function(payload)
{
	this.requestWebService = false;

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (accessCountry):</b><br>'+payload.errorText);
		this.overlay.hide();
		this.accessCountryButton.mojo.deactivate();
		return;
	}

	if (payload.response.OutGetAppList) {
		var country = payload.response.OutGetAppList.country;
		this.controller.stageController.pushScene("item", "Access Country", country, 'country');
	}

	this.overlay.hide();
	this.accessCountryButton.mojo.deactivate();
};

AppCatalogAssistant.prototype.paymentInfoTap = function(event)
{
	this.overlay.show();

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
};

AppCatalogAssistant.prototype.paymentInfo = function(payload)
{
	this.requestWebService = false;

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (paymentInfo):</b><br>'+payload.errorText);
		this.overlay.hide();
		this.paymentInfoButton.mojo.deactivate();
		return;
	}

	if (payload.response.OutGetCCPaymentInfos) {
		var payments = payload.response.OutGetCCPaymentInfos;
		this.controller.stageController.pushScene("item", "Payment Info", payments, 'payments');
	}

	this.overlay.hide();
	this.paymentInfoButton.mojo.deactivate();
};

AppCatalogAssistant.prototype.billingCountriesTap = function(event)
{
	this.overlay.show();

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
};

AppCatalogAssistant.prototype.billingCountries = function(payload)
{
	this.requestWebService = false;

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (billingCountries):</b><br>'+payload.errorText);
		this.overlay.hide();
		this.billingCountriesButton.mojo.deactivate();
		return;
	}

	if (payload.response.OutGetBillToCountries) {
		var countries = payload.response.OutGetBillToCountries.billToCountries;
		this.controller.stageController.pushScene("item", "Billing Countries", countries, 'countries');
	}

	this.overlay.hide();
	this.billingCountriesButton.mojo.deactivate();
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
	this.overlay.show();

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
};

AppCatalogAssistant.prototype.getCodeInfo = function(payload)
{
	this.requestWebService = false;

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (getCodeInfo):</b><br>'+payload.errorText);
		this.overlay.hide();
		this.getCodeInfoButton.mojo.deactivate();
		return;
	}

	this.promoCodeInfo = payload.response.OutGetPromoCodeInfos;

	if (this.promoCodeInfo) {
		this.controller.stageController.pushScene("item", "Promo Code Info", this.promoCodeInfo,
												  this.promoCodeInputFieldModel.value);
		this.checkCodeStatusButtonModel.disabled = false;
		this.controller.modelChanged(this.checkCodeStatusButtonModel);
	}

	this.overlay.hide();
	this.getCodeInfoButton.mojo.deactivate();
};

AppCatalogAssistant.prototype.checkCodeStatusTap = function(event)
{
	this.overlay.show();

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
};

AppCatalogAssistant.prototype.checkCodeStatus = function(payload)
{
	this.requestWebService = false;

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (checkCodeStatus):</b><br>'+payload.errorText);
		this.overlay.hide();
		this.checkCodeStatusButton.mojo.deactivate();
		return;
	}

	if (payload.response.OutCheckPromoCodeStatus) {
		var status = payload.response.OutCheckPromoCodeStatus;
		this.controller.stageController.pushScene("item", "Promo Code Status", status,
												  this.promoCodeInputFieldModel.value);
	}

	this.overlay.hide();
	this.checkCodeStatusButton.mojo.deactivate();
};

AppCatalogAssistant.prototype.updateSpinner = function(active)
{
	if (active)  {
		this.iconElement.style.display = 'none';
		this.spinnerModel.spinning = true;
		this.controller.modelChanged(this.spinnerModel);
		this.overlay.show();
	}
	else {
		this.iconElement.style.display = 'inline';
		this.spinnerModel.spinning = false;
		this.controller.modelChanged(this.spinnerModel);
		this.overlay.hide();
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
	this.controller.stopListening(this.showAppInfoButton,  Mojo.Event.tap,
								  this.showAppInfoTapHandler);
	this.controller.stopListening(this.showAppDetailsButton,  Mojo.Event.tap,
								  this.showAppDetailsTapHandler);
	this.controller.stopListening(this.installAppButton,  Mojo.Event.tap,
								  this.installAppTapHandler);
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
