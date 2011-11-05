function PalmProfileAssistant()
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

	this.manageOverridesButtonModel = {
		label: $L("Palm Profile Overrides"),
		disabled: true
	};

	this.resetPalmProfileButtonModel = {
		label: $L("Reset Palm Profile"),
		disabled: true
	};

	this.getAccountInfoButtonModel = {
		label: $L("Show Account Info"),
		disabled: true
	};

	this.palmProfile = false;
	this.reloadPalmProfile = false;

	this.accountInfo = false;

	this.requestPalmService = false;
	this.requestWebService = false;
};

PalmProfileAssistant.prototype.setup = function()
{
	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	// get elements
	this.overlay = this.controller.get('overlay'); this.overlay.hide();
	this.spinnerElement = this.controller.get('spinner');
	this.palmProfileButton = this.controller.get('palmProfileButton');
	this.manageOverridesButton = this.controller.get('manageOverridesButton');
	this.resetPalmProfileButton = this.controller.get('resetPalmProfileButton');
	this.getAccountInfoButton = this.controller.get('getAccountInfoButton');
	
	if (Mojo.Environment.DeviceInfo.platformVersionMajor == 1) {
		this.manageOverridesButton.style.display = 'none';
		this.resetPalmProfileButton.style.display = 'none';
	}

	// setup back tap
	this.backElement = this.controller.get('icon');
	this.backTapHandler = this.backTap.bindAsEventListener(this);
	this.controller.listen(this.backElement,  Mojo.Event.tap, this.backTapHandler);
	
	// setup handlers
	this.palmProfileTapHandler = this.palmProfileTap.bindAsEventListener(this);
	this.manageOverridesTapHandler = this.manageOverridesTap.bindAsEventListener(this);
	this.resetPalmProfileTapHandler = this.resetPalmProfileTap.bindAsEventListener(this);
	this.resetPalmProfileAckHandler = this.resetPalmProfileAck.bind(this);
	this.palmProfileDeletedHandler = this.palmProfileDeleted.bindAsEventListener(this);
	this.palmProfileDeletionAckHandler = this.palmProfileDeletionAck.bind(this);
	this.palmProfileDeletionDoneHandler = this.palmProfileDeletionDone.bindAsEventListener(this);
	this.getAccountInfoTapHandler = this.getAccountInfoTap.bindAsEventListener(this);
	this.getAccountInfoHandler = this.getAccountInfo.bind(this);
	
	// setup wigets
	this.spinnerModel = {spinning: true};
	this.controller.setupWidget('spinner', {spinnerSize: 'large'}, this.spinnerModel);
	this.controller.setupWidget('palmProfileButton', { }, this.palmProfileButtonModel);
	this.controller.listen(this.palmProfileButton, Mojo.Event.tap, this.palmProfileTapHandler);
	this.controller.setupWidget('manageOverridesButton', { }, this.manageOverridesButtonModel);
	this.controller.listen(this.manageOverridesButton,  Mojo.Event.tap, this.manageOverridesTapHandler);
	this.controller.setupWidget('resetPalmProfileButton', { type: Mojo.Widget.activityButton },
								this.resetPalmProfileButtonModel);
	this.controller.listen(this.resetPalmProfileButton, Mojo.Event.tap, this.resetPalmProfileTapHandler);
	this.controller.setupWidget('getAccountInfoButton', { type: Mojo.Widget.activityButton }, this.getAccountInfoButtonModel);
	this.controller.listen(this.getAccountInfoButton, Mojo.Event.tap, this.getAccountInfoTapHandler);
}

PalmProfileAssistant.prototype.activate = function()
{
	this.palmProfile = false;
	this.accountServerUrl = false;
	this.updateSpinner(true);
	PalmProfile.getPalmProfile(this.getPalmProfile.bind(this), this.reloadPalmProfile);
};

PalmProfileAssistant.prototype.dirtyPalmProfile = function()
{
	this.reloadPalmProfile = true;
};

PalmProfileAssistant.prototype.getPalmProfile = function(returnValue, palmProfile, errorText)
{
	this.updateSpinner(false);

	if (returnValue === false) {
		this.errorMessage('<b>Service Error (getPalmProfile):</b><br>'+errorText);
		return;
	}

	this.palmProfile = palmProfile;
	this.reloadPalmProfile = false;

	if (this.palmProfile) {
		this.palmProfileButtonModel.disabled = false;
		this.controller.modelChanged(this.palmProfileButtonModel);
		this.manageOverridesButtonModel.disabled = false;
		this.controller.modelChanged(this.manageOverridesButtonModel);
		this.resetPalmProfileButtonModel.disabled = false;
		this.controller.modelChanged(this.resetPalmProfileButtonModel);
		this.getAccountInfoButtonModel.disabled = false;
		this.controller.modelChanged(this.getAccountInfoButtonModel);

		this.updateSpinner(true);
		AccountServer.getAccountServerUrl(this.getAccountServerUrl.bind(this), false);
	}
	else {
		this.controller.showAlertDialog({
				allowHTMLMessage:	true,
				preventCancel:		true,
				title:				'Palm Profile Not Found',
				message:			'This device does not have an active Palm Profile associated with it.<br>Use the Activation scene to activate a Palm Profile on this device.',
				choices:			[{label:$L("Ok"), value:'ok'}],
				onChoose:			function(e){}
			});
	}
};

PalmProfileAssistant.prototype.getAccountServerUrl = function(returnValue, accountServerUrl, errorText)
{
	this.updateSpinner(false);

	if (returnValue === false) {
		this.errorMessage('<b>Service Error (getAccountServerUrl):</b><br>'+errorText);
		return;
	}

	this.accountServerUrl = accountServerUrl;
};

PalmProfileAssistant.prototype.palmProfileTap = function(event)
{
	if (this.palmProfile) {
		this.controller.stageController.pushScene("item", "Palm Profile", this.palmProfile,
												  'com.palm.palmprofile.token', false);
	}
};

PalmProfileAssistant.prototype.manageOverridesTap = function(event)
{
	if (this.palmProfile) {
		var attributes = this.palmProfile;
		delete attributes['_id']; delete attributes['_kind']; delete attributes['_rev'];
		this.controller.stageController.pushScene("overrides", "Palm Profile Overrides", attributes,
												  "org.webosinternals.impostah.palmprofile",
												  this.dirtyPalmProfile.bind(this));
	}
};

PalmProfileAssistant.prototype.resetPalmProfileTap = function(event)
{
	this.overlay.show();

	this.controller.showAlertDialog({
			allowHTMLMessage:	true,
			title:				'Reset Palm Profile',
			message:			"Are you sure? Applications you installed and all application settings and data will be erased.",
			choices:			[{label:$L("Delete"), value:'delete', type:'negative'},{label:$L("Cancel"), value:'cancel', type:'dismiss'}],
			onChoose:			this.resetPalmProfileAckHandler
		});
};

PalmProfileAssistant.prototype.resetPalmProfileAck = function(value)
{
	if (value != "delete") {
		this.overlay.hide();
		this.resetPalmProfileButton.mojo.deactivate();
		return;
	}

	this.palmProfile = false;

	this.palmProfileButtonModel.disabled = true;
	this.controller.modelChanged(this.palmProfileButtonModel);
	this.manageOverridesButtonModel.disabled = true;
	this.controller.modelChanged(this.manageOverridesButtonModel);
	this.resetPalmProfileButtonModel.disabled = true;
	this.controller.modelChanged(this.resetPalmProfileButtonModel);

	if (this.requestPalmService) this.requestPalmService.cancel();
	this.requestPalmService = ImpostahService.impersonate(this.palmProfileDeletedHandler,
														  "com.palm.configurator",
														  "com.palm.db",
														  "del", {"ids":["com.palm.palmprofile.token"], "purge":true});

};

PalmProfileAssistant.prototype.palmProfileDeleted = function(payload)
{
	if (this.requestPalmService) this.requestPalmService.cancel();
	this.requestPalmService = false;

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (deletePalmProfile):</b><br>'+payload.errorText);
		this.overlay.hide();
		this.resetPalmProfileButton.mojo.deactivate();
		return;
	}

	this.controller.showAlertDialog({
			allowHTMLMessage:	true,
				preventCancel:		true,
				title:				'Reset Palm Profile',
				message:			"Your Palm Profile has been reset. Your device will now restart.",
				choices:			[{label:$L("Ok"), value:'ok'},
									 {label:$L("Cancel"), value:'cancel'}
									 ],
				onChoose:			this.palmProfileDeletionAckHandler
				});
};

PalmProfileAssistant.prototype.palmProfileDeletionAck = function(value)
{
	if (this.requestPalmService) this.requestPalmService.cancel();
	if (value != "ok") {
		this.overlay.hide();
		this.resetPalmProfileButton.mojo.deactivate();
		this.dirtyPalmProfile();
		this.activate();
	}
	else {
		this.requestPalmService = ImpostahService.removeFirstUseFlag(this.palmProfileDeletionDoneHandler);
	}
};

PalmProfileAssistant.prototype.palmProfileDeletionDone = function(payload)
{
	if (this.requestPalmService) this.requestPalmService.cancel();
	this.requestPalmService = false;

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (removeFirstUseFlag):</b><br>'+payload.errorText);
		this.overlay.hide();
		this.resetPalmProfileButton.mojo.deactivate();
		return;
	}

	this.requestPalmService = ImpostahService.restartLuna();
};

PalmProfileAssistant.prototype.getAccountInfoTap = function(event)
{
	this.overlay.show();

	var callback = this.getAccountInfoHandler;

	var url = this.accountServerUrl+"getAccountInfoAggregate";
	var body = {
		"InAccountInfoAggretate": {
			"locale": "en_us",
			"token": this.palmProfile.token,
			"email": this.palmProfile.alias
		}
	};

	Mojo.Log.warn("request %j", body);

	this.accountInfo = false;

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

PalmProfileAssistant.prototype.getAccountInfo = function(payload)
{
	this.requestWebService = false;

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (getAccountInfo):</b><br>'+payload.errorText);
		this.overlay.hide();
		this.getAccountInfoButton.mojo.deactivate();
		return;
	}

	this.accountInfo = payload.response.OutAccountInfoAggregate;

	if (this.accountInfo) {
		this.controller.stageController.pushScene("item", "Account Info", this.accountInfo,
												  this.palmProfile.alias);
	}

	this.overlay.hide();
	this.getAccountInfoButton.mojo.deactivate();
};

PalmProfileAssistant.prototype.updateSpinner = function(active)
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

PalmProfileAssistant.prototype.errorMessage = function(msg)
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

PalmProfileAssistant.prototype.backTap = function(event)
{
	this.controller.stageController.popScene();
};

PalmProfileAssistant.prototype.handleCommand = function(event)
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

PalmProfileAssistant.prototype.cleanup = function(event)
{
	this.controller.stopListening(this.backElement,  Mojo.Event.tap,
								  this.backTapHandler);
	this.controller.stopListening(this.palmProfileButton,  Mojo.Event.tap,
								  this.palmProfileTapHandler);
	this.controller.stopListening(this.manageOverridesButton,  Mojo.Event.tap,
								  this.manageOverridesTapHandler);
	this.controller.stopListening(this.resetPalmProfileButton,  Mojo.Event.tap,
								  this.resetPalmProfileTapHandler);
	this.controller.stopListening(this.getAccountInfoButton,  Mojo.Event.tap,
								  this.getAccountInfoTapHandler);
};

// Local Variables:
// tab-width: 4
// End:
