function CreditCardAssistant()
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

	this.paymentInfoButtonModel = {
		label: $L("Show Payment Info"),
		disabled: true
	};

 	this.billingCountriesButtonModel = {
		label: $L("Show Billing Countries"),
		disabled: true
	};
};

CreditCardAssistant.prototype.setup = function()
{
	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	// get elements
	this.iconElement =			this.controller.get('icon');
	this.iconElement.style.display = 'none';
	this.spinnerElement = 		this.controller.get('spinner');
	this.palmProfileButton = this.controller.get('palmProfileButton');
	this.paymentInfoButton = this.controller.get('paymentInfoButton');
	this.billingCountriesButton = this.controller.get('billingCountriesButton');
	
	// setup handlers
	this.getPalmProfileHandler =	this.getPalmProfile.bindAsEventListener(this);
	this.palmProfileTapHandler = this.palmProfileTap.bindAsEventListener(this);
	this.getDeviceProfileHandler =	this.getDeviceProfile.bindAsEventListener(this);
	this.paymentInfoTapHandler = this.paymentInfoTap.bindAsEventListener(this);
	this.paymentInfoHandler =	this.paymentInfo.bindAsEventListener(this);
	this.billingCountriesTapHandler = this.billingCountriesTap.bindAsEventListener(this);
	this.billingCountriesHandler =	this.billingCountries.bindAsEventListener(this);
	
	// setup wigets
	this.spinnerModel = {spinning: true};
	this.controller.setupWidget('spinner', {spinnerSize: 'small'}, this.spinnerModel);
	this.controller.setupWidget('palmProfileButton', { }, this.palmProfileButtonModel);
	this.controller.listen(this.palmProfileButton,  Mojo.Event.tap, this.palmProfileTapHandler);
	this.controller.setupWidget('paymentInfoButton', { }, this.paymentInfoButtonModel);
	this.controller.listen(this.paymentInfoButton,  Mojo.Event.tap, this.paymentInfoTapHandler);
	this.controller.setupWidget('billingCountriesButton', { }, this.billingCountriesButtonModel);
	this.controller.listen(this.billingCountriesButton,  Mojo.Event.tap, this.billingCountriesTapHandler);
	
	// %%% FIXME %%%
	this.paymentServerUrl = "https://pmt.palmws.com/palmcspmtext/services/paymentJ/";
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

CreditCardAssistant.prototype.getDeviceProfile = function(payload)
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
		this.paymentInfoButtonModel.disabled = false;
		this.controller.modelChanged(this.paymentInfoButtonModel);

		this.billingCountriesButtonModel.disabled = false;
		this.controller.modelChanged(this.billingCountriesButtonModel);
	}
};

CreditCardAssistant.prototype.getPalmProfile = function(payload)
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
		this.paymentInfoButtonModel.disabled = false;
		this.controller.modelChanged(this.paymentInfoButtonModel);

		this.billingCountriesButtonModel.disabled = false;
		this.controller.modelChanged(this.billingCountriesButtonModel);
	}
};

CreditCardAssistant.prototype.palmProfileTap = function(event)
{
	if (this.palmProfile) {
		this.controller.stageController.pushScene("item", "Palm Profile", this.palmProfile);
	}
};

CreditCardAssistant.prototype.paymentInfoTap = function(event)
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

	this.requestPaymentInfo = new Ajax.Request(url, {
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
						callback({"returnValue":false, "errorText":exception});
					}
					else {
						callback({"returnValue":true, "response":response});
					}
				}
			},
			onFailure: function(response) {
				Mojo.Log.info("onFailure %j", response);
				if (response.responseJSON && response.responseJSON.JSONException) {
					callback({"returnValue":false, "errorText":response.responseJSON.JSONException});
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

	this.paymentInfoButtonModel.disabled = true;
	this.controller.modelChanged(this.paymentInfoButtonModel);
};

CreditCardAssistant.prototype.paymentInfo = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (paymentInfo):</b><br>'+payload.errorText);
		return;
	}

	this.requestPaymentInfo = false;

	this.updateSpinner();

	this.paymentInfoButtonModel.disabled = false;
	this.controller.modelChanged(this.paymentInfoButtonModel);

	if (payload.response.OutGetCCPaymentInfos) {
		var payments = payload.response.OutGetCCPaymentInfos;
		this.controller.stageController.pushScene("item", "Payment Info", payments);
	}
};

CreditCardAssistant.prototype.billingCountriesTap = function(event)
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

	this.requestBillingCountries = new Ajax.Request(url, {
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
						callback({"returnValue":false, "errorText":exception});
					}
					else {
						callback({"returnValue":true, "response":response});
					}
				}
			},
			onFailure: function(response) {
				Mojo.Log.info("onFailure %j", response);
				if (response.responseJSON && response.responseJSON.JSONException) {
					callback({"returnValue":false, "errorText":response.responseJSON.JSONException});
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

	this.billingCountriesButtonModel.disabled = true;
	this.controller.modelChanged(this.billingCountriesButtonModel);
};

CreditCardAssistant.prototype.billingCountries = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (billingCountries):</b><br>'+payload.errorText);
		return;
	}

	this.requestBillingCountries = false;

	this.updateSpinner();

	this.billingCountriesButtonModel.disabled = false;
	this.controller.modelChanged(this.billingCountriesButtonModel);

	if (payload.response.OutGetBillToCountries) {
		var countries = payload.response.OutGetBillToCountries.billToCountries;
		this.controller.stageController.pushScene("item", "Billing Countries", countries);
	}
};

CreditCardAssistant.prototype.updateSpinner = function()
{
	if (this.requestDeviceProfile || this.requestPalmProfile || this.requestPaymentInfo || this.requestBillingCountries)  {
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

CreditCardAssistant.prototype.errorMessage = function(msg)
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

CreditCardAssistant.prototype.handleCommand = function(event)
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

CreditCardAssistant.prototype.cleanup = function(event)
{
	this.controller.stopListening(this.palmProfileButton,  Mojo.Event.tap,
								  this.palmProfileTapHandler);
	this.controller.stopListening(this.paymentInfoButton,  Mojo.Event.tap,
								  this.paymentInfoTapHandler);
	this.controller.stopListening(this.billingCountriesButton,  Mojo.Event.tap,
								  this.billingCountriesTapHandler);
};

// Local Variables:
// tab-width: 4
// End:
