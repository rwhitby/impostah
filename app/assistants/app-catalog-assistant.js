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

	this.deviceInfoButtonModel = {
		label: $L("Show Device Info"),
		disabled: true
	};
	this.sessionInfoButtonModel = {
		label: $L("Show Session Info"),
		disabled: true
	};
	this.installedAppsButtonModel = {
		label: $L("Show Installed Apps"),
		disabled: true
	};
	this.purchasedAppsButtonModel = {
		label: $L("Show Purchased Apps"),
		disabled: true
	};
	this.availableAppsButtonModel = {
		label: $L("Show Available Apps"),
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
	this.countryListButtonModel = {
		label: $L("Check Country List"),
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

	this.deviceId = false;
	this.deviceProfile = false;
	this.palmProfile = false;
	this.accountServerUrl = false;
	this.catalogServerUrl = false;
	this.paymentServerUrl = false;
	this.appList = false;
	this.appCount = 0;
	this.appInfo = false;
	this.appDetail = false;
	this.promoCodeInfo = false;

	this.locale = "en_us";

	this.requestPalmService = false;
	this.requestWebService = false;
};

AppCatalogAssistant.prototype.setup = function()
{
	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	// get elements
	this.overlay = 		this.controller.get('overlay'); this.overlay.hide();
	this.spinnerElement = 		this.controller.get('spinner');
	this.appIdInputField = this.controller.get('appIdInputField');
	this.getAppInfoButton = this.controller.get('getAppInfoButton');
	this.showAppInfoButton = this.controller.get('showAppInfoButton');
	this.showAppDetailsButton = this.controller.get('showAppDetailsButton');
	this.installAppButton = this.controller.get('installAppButton');
	this.installStatus = this.controller.get('installStatus');
	this.deviceInfoButton = this.controller.get('deviceInfoButton');
	this.sessionInfoButton = this.controller.get('sessionInfoButton');
	this.installedAppsButton = this.controller.get('installedAppsButton');
	this.purchasedAppsButton = this.controller.get('purchasedAppsButton');
	this.availableAppsButton = this.controller.get('availableAppsButton');
	this.paidAppsButton = this.controller.get('paidAppsButton');
	this.accessCountryButton = this.controller.get('accessCountryButton');
	this.countryListButton = this.controller.get('countryListButton');
	this.promoCodeInputField = this.controller.get('promoCodeInputField');
	this.getCodeInfoButton = this.controller.get('getCodeInfoButton');
	this.checkCodeStatusButton = this.controller.get('checkCodeStatusButton');
	
	// setup back tap
	this.backElement = this.controller.get('icon');
	this.backTapHandler = this.backTap.bindAsEventListener(this);
	this.controller.listen(this.backElement,  Mojo.Event.tap, this.backTapHandler);
	
	// setup handlers
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
	this.deviceInfoTapHandler = this.deviceInfoTap.bindAsEventListener(this);
	this.deviceInfoHandler =	this.deviceInfo.bindAsEventListener(this);
	this.sessionInfoTapHandler = this.sessionInfoTap.bindAsEventListener(this);
	this.sessionInfoHandler =	this.sessionInfo.bindAsEventListener(this);
	this.installedAppsTapHandler = this.installedAppsTap.bindAsEventListener(this);
	this.installedAppsHandler =	this.installedApps.bindAsEventListener(this);
	this.purchasedAppsTapHandler = this.purchasedAppsTap.bindAsEventListener(this);
	this.purchasedAppsHandler =	this.purchasedApps.bindAsEventListener(this);
	this.availableAppsTapHandler = this.availableAppsTap.bindAsEventListener(this);
	this.availableAppsHandler =	this.availableApps.bindAsEventListener(this);
	this.paidAppsTapHandler = this.paidAppsTap.bindAsEventListener(this);
	this.paidAppsHandler =	this.paidApps.bindAsEventListener(this);
	this.accessCountryTapHandler = this.accessCountryTap.bindAsEventListener(this);
	this.accessCountryHandler =	this.accessCountry.bindAsEventListener(this);
	this.countryListTapHandler = this.countryListTap.bindAsEventListener(this);
	this.countryListHandler =	this.countryList.bindAsEventListener(this);
	this.promoCodeChangedHandler = this.promoCodeChanged.bindAsEventListener(this);
	this.getCodeInfoTapHandler = this.getCodeInfoTap.bindAsEventListener(this);
	this.getCodeInfoHandler =	this.getCodeInfo.bindAsEventListener(this);
	this.checkCodeStatusTapHandler = this.checkCodeStatusTap.bindAsEventListener(this);
	this.checkCodeStatusHandler =	this.checkCodeStatus.bindAsEventListener(this);
	
	// setup wigets
	this.spinnerModel = {spinning: true};
	this.controller.setupWidget('spinner', {spinnerSize: 'large'}, this.spinnerModel);
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
	this.controller.setupWidget('deviceInfoButton', { type: Mojo.Widget.activityButton }, this.deviceInfoButtonModel);
	this.controller.listen(this.deviceInfoButton,  Mojo.Event.tap, this.deviceInfoTapHandler);
	this.controller.setupWidget('sessionInfoButton', { type: Mojo.Widget.activityButton }, this.sessionInfoButtonModel);
	this.controller.listen(this.sessionInfoButton,  Mojo.Event.tap, this.sessionInfoTapHandler);
	this.controller.setupWidget('installedAppsButton', { type: Mojo.Widget.activityButton }, this.installedAppsButtonModel);
	this.controller.listen(this.installedAppsButton,  Mojo.Event.tap, this.installedAppsTapHandler);
	this.controller.setupWidget('purchasedAppsButton', { type: Mojo.Widget.activityButton }, this.purchasedAppsButtonModel);
	this.controller.listen(this.purchasedAppsButton,  Mojo.Event.tap, this.purchasedAppsTapHandler);
	this.controller.setupWidget('availableAppsButton', { type: Mojo.Widget.activityButton }, this.availableAppsButtonModel);
	this.controller.listen(this.availableAppsButton,  Mojo.Event.tap, this.availableAppsTapHandler);
	this.controller.setupWidget('paidAppsButton', { type: Mojo.Widget.activityButton }, this.paidAppsButtonModel);
	this.controller.listen(this.paidAppsButton,  Mojo.Event.tap, this.paidAppsTapHandler);
	this.controller.setupWidget('accessCountryButton', { type: Mojo.Widget.activityButton }, this.accessCountryButtonModel);
	this.controller.listen(this.accessCountryButton,  Mojo.Event.tap, this.accessCountryTapHandler);
	this.controller.setupWidget('countryListButton', { type: Mojo.Widget.activityButton }, this.countryListButtonModel);
	this.controller.listen(this.countryListButton,  Mojo.Event.tap, this.countryListTapHandler);
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
	this.availableAppsButtonModel.label = $L("Show Available Apps");
	this.controller.modelChanged(this.availableAppsButtonModel);
	this.deviceId = false;
	this.updateSpinner(true);
	DeviceProfile.getDeviceId(this.getDeviceId.bind(this), false);
};

AppCatalogAssistant.prototype.getDeviceId = function(returnValue, deviceId, errorText)
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

AppCatalogAssistant.prototype.getDeviceProfile = function(returnValue, deviceProfile, errorText)
{
	this.updateSpinner(false);

	if (returnValue === false) {
		this.errorMessage('<b>Service Error (getDeviceProfile):</b><br>'+errorText);
		return;
	}

	this.deviceProfile = deviceProfile;

	this.palmProfile = false;
	this.accountServerUrl = false;
	this.catalogServerUrl = false;
	this.paymentServerUrl = false;

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
		this.deviceInfoButtonModel.disabled = false;
		this.controller.modelChanged(this.deviceInfoButtonModel);
		this.sessionInfoButtonModel.disabled = false;
		this.controller.modelChanged(this.sessionInfoButtonModel);
		this.installedAppsButtonModel.disabled = false;
		this.controller.modelChanged(this.installedAppsButtonModel);
		this.purchasedAppsButtonModel.disabled = false;
		this.controller.modelChanged(this.purchasedAppsButtonModel);
		this.availableAppsButtonModel.disabled = false;
		this.controller.modelChanged(this.availableAppsButtonModel);
		this.paidAppsButtonModel.disabled = false;
		this.controller.modelChanged(this.paidAppsButtonModel);
		this.accessCountryButtonModel.disabled = false;
		this.controller.modelChanged(this.accessCountryButtonModel);
		this.countryListButtonModel.disabled = false;
		this.controller.modelChanged(this.countryListButtonModel);

		this.updateSpinner(true);
		AccountServer.getAccountServerUrl(this.getAccountServerUrl.bind(this), false);
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

AppCatalogAssistant.prototype.getAccountServerUrl = function(returnValue, accountServerUrl, errorText)
{
	this.updateSpinner(false);

	if (returnValue === false) {
		this.errorMessage('<b>Service Error (getAccountServerUrl):</b><br>'+errorText);
		return;
	}

	this.accountServerUrl = accountServerUrl;
	if (this.accountServerUrl) {
		var matches = /([^&]*):\/\/([^&/]*)\/([^&]*)/.exec(this.accountServerUrl);
		this.catalogServerUrl = matches[1]+"://"+matches[2]+"/appcatalog/2.0/";
	}

	this.updateSpinner(true);
	PaymentServer.getPaymentServerUrl(this.getPaymentServerUrl.bind(this), this.accountServerUrl, false);
};

AppCatalogAssistant.prototype.getPaymentServerUrl = function(returnValue, paymentServerUrl, errorText)
{
	this.updateSpinner(false);

	if (returnValue === false) {
		this.errorMessage('<b>Service Error (getPaymentServerUrl):</b><br>'+errorText);
		return;
	}

	this.paymentServerUrl = paymentServerUrl;

	if (this.paymentServerUrl) {
		this.promoCodeInputFieldModel.disabled = false;
		this.controller.modelChanged(this.promoCodeInputFieldModel);
	}
	else {
		this.controller.showAlertDialog({
				allowHTMLMessage:	true,
				preventCancel:		true,
				title:				'Payment Server Not Found',
				message:			'This device does not have an active Payment Server associated with it.<br>An active Palm Profile is required to access Payment Server information.',
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

	var url = this.accountServerUrl+"getListOfUpdatableApps";
	var body = {
		"InGetUpdatableApps": {
			"accountTokenInfo": {
				"token": this.palmProfile.token,
				"deviceId": this.deviceId,
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
												  this.appInfo.publicApplicationId, false);
	}
};

AppCatalogAssistant.prototype.showAppDetailsTap = function(event)
{
	this.overlay.show();

	var callback = this.getAppDetailsHandler;

	var url = this.accountServerUrl+"appDetail_ext2";
	var body = {
		"InGetAppDetailV2": {
			"accountTokenInfo": {
				"token": this.palmProfile.token,
				"deviceId": this.deviceId,
				"email": this.palmProfile.alias,
				// "carrier": this.deviceProfile.carrier
			},
			"packageId": this.appInfo.publicApplicationId,
			"locale": this.locale,
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
												  this.appInfo.publicApplicationId, false);
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
															 "deviceId": this.deviceId,
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
												  'com.palm.palmprofile.token', false);
	}
};

AppCatalogAssistant.prototype.deviceInfoTap = function(event)
{
	this.overlay.show();

	var callback = this.deviceInfoHandler;

	var url = this.catalogServerUrl+"user/profile/devices/"+this.deviceId;

	var headers = {
		"Authorization": "PalmAuth token="+this.palmProfile.token,
		"X-Palm-Device-Id": this.deviceId,
		"X-Palm-Profile-Email": this.palmProfile.alias,
		"X-Palm-AppCat-Caller-ID": "acc",
		"X-Palm-AppCat-Caller-Version": "5.0.2200"
	};

	Mojo.Log.warn("request %j", headers);

	this.requestWebService = new Ajax.Request(url, {
			method: 'GET',
			contentType: 'application/json',
			requestHeaders: headers,
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
						callback({"returnValue":true, "response":response.body.response});
					}
				}
			},
			onFailure: function(response) {
				Mojo.Log.warn("onFailure %j", response);
				if (response.responseJSON) {
					callback({"returnValue":false, "errorText":Object.toJSON(response.responseJSON)});
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

AppCatalogAssistant.prototype.deviceInfo = function(payload)
{
	this.requestWebService = false;

	Mojo.Log.warn("payload %j", payload);

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (deviceInfo):</b><br>'+payload.errorText);
		this.overlay.hide();
		this.deviceInfoButton.mojo.deactivate();
		return;
	}

	if (payload.response) {
		var info = payload.response;
		this.controller.stageController.pushScene("item", "Device Info", info, 'info', false);
	}

	this.overlay.hide();
	this.deviceInfoButton.mojo.deactivate();
};

AppCatalogAssistant.prototype.sessionInfoTap = function(event)
{
	this.overlay.show();

	var callback = this.sessionInfoHandler;

	var url = this.catalogServerUrl+this.locale+"/user/session";

	var headers = {
		"Authorization": "PalmAuth token="+this.palmProfile.token,
		"X-Palm-Device-Id": this.deviceId,
		"X-Palm-Profile-Email": this.palmProfile.alias,
		"X-Palm-AppCat-Caller-ID": "acc",
		"X-Palm-AppCat-Caller-Version": "5.0.2200"
	};

	Mojo.Log.warn("request %j", headers);

	this.requestWebService = new Ajax.Request(url, {
			method: 'GET',
			contentType: 'application/json',
			requestHeaders: headers,
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
						callback({"returnValue":true, "response":response.results.body.response});
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

AppCatalogAssistant.prototype.sessionInfo = function(payload)
{
	this.requestWebService = false;

	Mojo.Log.warn("payload %j", payload);

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (sessionInfo):</b><br>'+payload.errorText);
		this.overlay.hide();
		this.sessionInfoButton.mojo.deactivate();
		return;
	}

	if (payload.response) {
		var info = payload.response;
		this.controller.stageController.pushScene("item", "Session Info", info, 'info', false);
	}

	this.overlay.hide();
	this.sessionInfoButton.mojo.deactivate();
};

AppCatalogAssistant.prototype.installedAppsTap = function(event)
{
	this.overlay.show();

	var callback = this.installedAppsHandler;

	var url = this.accountServerUrl+"getUserInstalledApps_ext2";
	var body = {
		"InGetUserAppsV2": {
			"accountTokenInfo": {
				"token": this.palmProfile.token,
				"deviceId": this.deviceId,
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

AppCatalogAssistant.prototype.installedApps = function(payload)
{
	this.requestWebService = false;

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (installedApps):</b><br>'+payload.errorText);
		this.overlay.hide();
		this.installedAppsButton.mojo.deactivate();
		return;
	}

	if (payload.response.OutGetUserInstalledAppsV2 != undefined) {
		var apps = payload.response.OutGetUserInstalledAppsV2.userApps;
		var list = {};
		if (apps) {
			for (i = 0; i < apps.length; i++) {
				list[apps[i].title] = apps[i];
			}
		}
		this.controller.stageController.pushScene("item", "Installed Apps", list, 'apps', false);
	}

	this.overlay.hide();
	this.installedAppsButton.mojo.deactivate();
};

AppCatalogAssistant.prototype.purchasedAppsTap = function(event)
{
	this.overlay.show();

	var callback = this.purchasedAppsHandler;

	var url = this.catalogServerUrl+this.locale+"/user/session";

	var headers = {
		"Authorization": "PalmAuth token="+this.palmProfile.token,
		"X-Palm-Device-Id": this.deviceId,
		"X-Palm-Profile-Email": this.palmProfile.alias,
		"X-Palm-AppCat-Caller-ID": "acc",
		"X-Palm-AppCat-Caller-Version": "5.0.2200"
	};

	Mojo.Log.warn("request %j", headers);

	this.requestWebService = new Ajax.Request(url, {
			method: 'GET',
			contentType: 'application/json',
			requestHeaders: headers,
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
						callback({"returnValue":true, "response":response.results.body.response});
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

AppCatalogAssistant.prototype.purchasedApps = function(payload)
{
	this.requestWebService = false;

	Mojo.Log.warn("payload %j", payload);

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (purchasedApps):</b><br>'+payload.errorText);
		this.overlay.hide();
		this.purchasedAppsButton.mojo.deactivate();
		return;
	}

	if (payload.response.purchasedApplications != undefined) {
		var apps = payload.response.purchasedApplications.apps || [];
		this.controller.stageController.pushScene("item", "Purchased Apps", apps, 'apps', false);
	}

	this.overlay.hide();
	this.purchasedAppsButton.mojo.deactivate();
};

AppCatalogAssistant.prototype.availableAppsTap = function(event)
{
	this.overlay.show();

	this.appList = {};
	this.appCount = 0;

	var callback = this.availableAppsHandler;

	var url = this.accountServerUrl+"appList_ext2";
	var body = {
		"InGetAppListV2": {
			"accountTokenInfo": {
				"token": this.palmProfile.token,
				"deviceId": this.deviceId,
				"email": this.palmProfile.alias
			},
			"startPosition": 0,
			"count":100,
			"sort":"NAME_ASC",
			"locale": "en_us",
			"packageIds": []
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

AppCatalogAssistant.prototype.availableApps = function(payload)
{
	this.requestWebService = false;

	Mojo.Log.warn("payload %j", payload);

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (availableApps):</b><br>'+payload.errorText);
		this.overlay.hide();
		this.availableAppsButton.mojo.deactivate();
		return;
	}

	if (payload.response.OutGetAppList != undefined) {
		var apps = payload.response.OutGetAppList.appList.appSummary || [];

		for (var i = 0; i < apps.length; i++) {
			this.appList[apps[i].title] = apps[i];
			this.appCount++;
		}

		this.availableAppsButtonModel.label = $L("Loading")+" ("+this.appCount+"/"+payload.response.OutGetAppList.appList.totalCount+")";
		this.controller.modelChanged(this.availableAppsButtonModel);

		//		if (this.appCount < payload.response.OutGetAppList.appList.totalCount) {
		if (this.appCount < 500) {
			var callback = this.availableAppsHandler;

			var url = this.accountServerUrl+"appList_ext2";
			var body = {
				"InGetAppListV2": {
					"accountTokenInfo": {
						"token": this.palmProfile.token,
						"deviceId": this.deviceId,
						"email": this.palmProfile.alias
					},
					"startPosition": this.appCount,
					"count":100,
					"sort":"NAME_ASC",
					"locale": "en_us",
					"packageIds": []
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
		}
		else {
			this.controller.stageController.pushScene("item", "Available Apps", this.appList, 'apps', false);
			this.overlay.hide();
			this.availableAppsButton.mojo.deactivate();
		}
	}
};

AppCatalogAssistant.prototype.paidAppsTap = function(event)
{
	this.overlay.show();

	var callback = this.paidAppsHandler;

	var url = this.accountServerUrl+"getAppCatUserFlags";
	var body = {
		"InGetAppCatUserFlags": {
			"accountTokenInfo": {
				"token": this.palmProfile.token,
				"deviceId": this.deviceId,
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
		this.controller.stageController.pushScene("item", "Paid Apps Access", payments, 'payments', false);
	}

	this.overlay.hide();
	this.paidAppsButton.mojo.deactivate();
};

AppCatalogAssistant.prototype.accessCountryTap = function(event)
{
	this.overlay.show();

	var callback = this.accessCountryHandler;

	var url = this.accountServerUrl+"appList_ext2";

	var body = {
		"InGetAppListV2": {
			"qid": "Blowfish2Query1",
			"locale": this.locale,
			"accountTokenInfo": {
				"token": this.palmProfile.token,
				"deviceId": this.deviceId,
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
		this.controller.stageController.pushScene("item", "Access Country", country, 'country', false);
	}

	this.overlay.hide();
	this.accessCountryButton.mojo.deactivate();
};

AppCatalogAssistant.prototype.countryListTap = function(event)
{
	this.overlay.show();

	var callback = this.countryListHandler;

	var url = this.catalogServerUrl+"support/firstUseCountryList";

	var headers = {
		"Authorization": "PalmAuth token="+this.palmProfile.token,
		"X-Palm-Device-Id": this.deviceId,
		"X-Palm-Profile-Email": this.palmProfile.alias,
		"X-Palm-AppCat-Caller-ID": "acc",
		"X-Palm-AppCat-Caller-Version": "5.0.2200"
	};

	Mojo.Log.warn("request %j", headers);

	this.requestWebService = new Ajax.Request(url, {
			method: 'GET',
			contentType: 'application/json',
			requestHeaders: headers,
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
						callback({"returnValue":true, "response":response.body.response});
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

AppCatalogAssistant.prototype.countryList = function(payload)
{
	this.requestWebService = false;

	Mojo.Log.warn("payload %j", payload);

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (countryList):</b><br>'+payload.errorText);
		this.overlay.hide();
		this.countryListButton.mojo.deactivate();
		return;
	}

	if (payload.response.countries) {
		var countries = payload.response.countries;
		var list = {};
		if (countries) {
			for (i = 0; i < countries.length; i++) {
				list[countries[i].id] = countries[i];
			}
		}
		this.controller.stageController.pushScene("item", "Country List", list, 'countries', false);
	}

	this.overlay.hide();
	this.countryListButton.mojo.deactivate();
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
			"deviceId": this.deviceId,
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
												  this.promoCodeInputFieldModel.value, false);
		if (this.promoCodeInfo.items.length) {
			this.checkCodeStatusButtonModel.disabled = false;
			this.controller.modelChanged(this.checkCodeStatusButtonModel);
		}
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
			"deviceId": this.deviceId,
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
												  this.promoCodeInputFieldModel.value, false);
	}

	this.overlay.hide();
	this.checkCodeStatusButton.mojo.deactivate();
};

AppCatalogAssistant.prototype.updateSpinner = function(active)
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

AppCatalogAssistant.prototype.backTap = function(event)
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
	this.controller.stopListening(this.backElement,  Mojo.Event.tap,
								  this.backTapHandler);
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
	this.controller.stopListening(this.deviceInfoButton,  Mojo.Event.tap,
								  this.deviceInfoTapHandler);
	this.controller.stopListening(this.sessionInfoButton,  Mojo.Event.tap,
								  this.sessionInfoTapHandler);
	this.controller.stopListening(this.installedAppsButton,  Mojo.Event.tap,
								  this.installedAppsTapHandler);
	this.controller.stopListening(this.purchasedAppsButton,  Mojo.Event.tap,
								  this.purchasedAppsTapHandler);
	this.controller.stopListening(this.availableAppsButton,  Mojo.Event.tap,
								  this.availableAppsTapHandler);
	this.controller.stopListening(this.paidAppsButton,  Mojo.Event.tap,
								  this.paidAppsTapHandler);
	this.controller.stopListening(this.accessCountryButton,  Mojo.Event.tap,
								  this.accessCountryTapHandler);
	this.controller.stopListening(this.countryListButton,  Mojo.Event.tap,
								  this.countryListTapHandler);
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
