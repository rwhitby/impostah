function DeviceExploreAssistant()
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
	
	this.telephonyPlatformButtonModel = {
		label: $L("Telephony Platform"),
		disabled: true
	};

	this.palmProfileButtonModel = {
		label: $L("Palm Profile"),
		disabled: true
	};

	this.deviceProfileButtonModel = {
		label: $L("Device Profile"),
		disabled: true
	};

	this.testButtonModel = {
		label: $L("Test"),
		disabled: true
	};
};

DeviceExploreAssistant.prototype.setup = function()
{
	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	// get elements
	this.iconElement =			this.controller.get('icon');
	this.iconElement.style.display = 'none';
	this.spinnerElement = 		this.controller.get('spinner');
	this.telephonyPlatformButton = this.controller.get('telephonyPlatformButton');
	this.palmProfileButton = this.controller.get('palmProfileButton');
	this.deviceProfileButton = this.controller.get('deviceProfileButton');
	this.testButton = this.controller.get('testButton');
	
	// setup handlers
	this.getTelephonyPlatformHandler =	this.getTelephonyPlatform.bindAsEventListener(this);
	this.telephonyPlatformTapHandler = this.telephonyPlatformTap.bindAsEventListener(this);
	this.getPalmProfileHandler =	this.getPalmProfile.bindAsEventListener(this);
	this.palmProfileTapHandler = this.palmProfileTap.bindAsEventListener(this);
	this.getDeviceProfileHandler =	this.getDeviceProfile.bindAsEventListener(this);
	this.deviceProfileTapHandler = this.deviceProfileTap.bindAsEventListener(this);
	this.testTapHandler = this.testTap.bindAsEventListener(this);
	this.testHandler =	this.test.bindAsEventListener(this);
	
	// setup wigets
	this.spinnerModel = {spinning: true};
	this.controller.setupWidget('spinner', {spinnerSize: 'small'}, this.spinnerModel);
	this.controller.setupWidget('telephonyPlatformButton', { }, this.telephonyPlatformButtonModel);
	this.controller.listen(this.telephonyPlatformButton,  Mojo.Event.tap, this.telephonyPlatformTapHandler);
	this.controller.setupWidget('deviceProfileButton', { }, this.deviceProfileButtonModel);
	this.controller.listen(this.deviceProfileButton,  Mojo.Event.tap, this.deviceProfileTapHandler);
	this.controller.setupWidget('palmProfileButton', { }, this.palmProfileButtonModel);
	this.controller.listen(this.palmProfileButton,  Mojo.Event.tap, this.palmProfileTapHandler);
	this.controller.setupWidget('testButton', { }, this.testButtonModel);
	this.controller.listen(this.testButton,  Mojo.Event.tap, this.testTapHandler);
	
	this.telephonyPlatform = false;
	this.deviceProfile = false;
	this.palmProfile = false;

	this.request1 = ImpostahService.impersonate(this.getTelephonyPlatformHandler, "com.palm.configurator",
											   "com.palm.telephony",
											   "platformQuery", {});
	this.request2 = ImpostahService.impersonate(this.getDeviceProfileHandler, "com.palm.configurator",
											   "com.palm.deviceprofile",
											   "getDeviceProfile", {});
	this.request3 = ImpostahService.impersonate(this.getPalmProfileHandler, "com.palm.configurator",
											   "com.palm.db",
												"get", {"ids":["com.palm.palmprofile.token"]});
};

DeviceExploreAssistant.prototype.getTelephonyPlatform = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (getTelephonyPlatform):</b><br>'+payload.errorText);
		return;
	}

	this.telephonyPlatform = payload.extended;

	if (this.telephonyPlatform && this.palmProfile && this.deviceProfile) {
		this.iconElement.style.display = 'inline';
		this.spinnerModel.spinning = false;
		this.controller.modelChanged(this.spinnerModel);

		this.testButtonModel.disabled = false;
		this.controller.modelChanged(this.testButtonModel);
	}

	this.telephonyPlatformButtonModel.disabled = false;
	this.controller.modelChanged(this.telephonyPlatformButtonModel);
};

DeviceExploreAssistant.prototype.telephonyPlatformTap = function(event)
{
	if (this.telephonyPlatform) {
		this.controller.stageController.pushScene("item", "Telephony Platform", this.telephonyPlatform);
	}
};

DeviceExploreAssistant.prototype.getDeviceProfile = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (getDeviceProfile):</b><br>'+payload.errorText);
		return;
	}

	this.deviceProfile = payload.deviceInfo;

	if (this.telephonyPlatform && this.palmProfile && this.deviceProfile) {
		this.iconElement.style.display = 'inline';
		this.spinnerModel.spinning = false;
		this.controller.modelChanged(this.spinnerModel);

		this.testButtonModel.disabled = false;
		this.controller.modelChanged(this.testButtonModel);
	}

	this.deviceProfileButtonModel.disabled = false;
	this.controller.modelChanged(this.deviceProfileButtonModel);
};

DeviceExploreAssistant.prototype.deviceProfileTap = function(event)
{
	if (this.deviceProfile) {
		this.controller.stageController.pushScene("item", "Device Profile", this.deviceProfile);
	}
};

DeviceExploreAssistant.prototype.getPalmProfile = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (getPalmProfile):</b><br>'+payload.errorText);
		return;
	}

	this.palmProfile = payload.results[0];

	if (this.telephonyPlatform && this.palmProfile && this.deviceProfile) {
		this.iconElement.style.display = 'inline';
		this.spinnerModel.spinning = false;
		this.controller.modelChanged(this.spinnerModel);

		this.testButtonModel.disabled = false;
		this.controller.modelChanged(this.testButtonModel);
	}

	this.palmProfileButtonModel.disabled = false;
	this.controller.modelChanged(this.palmProfileButtonModel);
};

DeviceExploreAssistant.prototype.palmProfileTap = function(event)
{
	if (this.palmProfile) {
		this.controller.stageController.pushScene("item", "Device Profile", this.palmProfile);
	}
};

DeviceExploreAssistant.prototype.testTap = function(event)
{
	var callback = this.testHandler;

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

	var request = new Ajax.Request(url, {
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
};

DeviceExploreAssistant.prototype.test = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (test):</b><br>'+payload.errorText);
		return;
	}

	if (payload.response) {
		this.controller.stageController.pushScene("item", "Test Response", payload.response);
	}
};

DeviceExploreAssistant.prototype.errorMessage = function(msg)
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

DeviceExploreAssistant.prototype.handleCommand = function(event)
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

DeviceExploreAssistant.prototype.cleanup = function(event)
{
	this.controller.stopListening(this.telephonyPlatformButton,  Mojo.Event.tap,
								  this.telephonyPlatformTapHandler);
	this.controller.stopListening(this.deviceProfileButton,  Mojo.Event.tap,
								  this.deviceProfileTapHandler);
	this.controller.stopListening(this.palmProfileButton,  Mojo.Event.tap,
								  this.palmProfileTapHandler);
	this.controller.stopListening(this.testButton,  Mojo.Event.tap,
								  this.testTapHandler);
};

// Local Variables:
// tab-width: 4
// End:
