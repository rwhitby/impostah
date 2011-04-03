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

	this.restoreBackupButtonModel = {
		label: $L("Restore Backup"),
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
	this.restoreBackupButton = this.controller.get('restoreBackupButton');
	this.backupStatus = this.controller.get('backupStatus');
	
	// setup handlers
	this.getDeviceProfileHandler =	this.getDeviceProfile.bindAsEventListener(this);
	this.getPalmProfileHandler =	this.getPalmProfile.bindAsEventListener(this);
	this.palmProfileTapHandler = this.palmProfileTap.bindAsEventListener(this);
	this.getAuthTokenTapHandler = this.getAuthTokenTap.bindAsEventListener(this);
	this.getAuthTokenHandler = this.getAuthToken.bindAsEventListener(this);
	this.getManifestListHandler = this.getManifestList.bindAsEventListener(this);
	this.showManifestTapHandler = this.showManifestTap.bindAsEventListener(this);
	this.showManifestHandler = this.showManifest.bindAsEventListener(this);
	this.restoreBackupTapHandler = this.restoreBackupTap.bindAsEventListener(this);
	this.restoreBackupAckHandler = this.restoreBackupAck.bindAsEventListener(this);
	this.restoreBackupGetHandler = this.restoreBackupGet.bindAsEventListener(this);
	this.restoreBackupSetHandler = this.restoreBackupSet.bindAsEventListener(this);
	this.restoreBackupStatusHandler = this.restoreBackupStatus.bindAsEventListener(this);
	
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
	this.controller.setupWidget('restoreBackupButton', { }, this.restoreBackupButtonModel);
	this.controller.listen(this.restoreBackupButton, Mojo.Event.tap, this.restoreBackupTapHandler);
	
	// %%% FIXME %%%
	this.authServerUrl = "https://sta.palmws.com/storageauth/";
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

	var url = (this.authServerUrl+"?email="+encodeURIComponent(this.palmProfile.alias)+
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

	this.getAuthTokenButtonModel.disabled = true;
	this.controller.modelChanged(this.getAuthTokenButtonModel);
};

BackupsAssistant.prototype.getAuthToken = function(payload)
{
	this.requestWebService = false;

	this.updateSpinner();

	this.getAuthTokenButtonModel.disabled = false;
	this.controller.modelChanged(this.getAuthTokenButtonModel);

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (getAuthToken):</b><br>'+payload.errorText);
		return;
	}

	Mojo.Log.warn("getAuthToken %s", payload.response);

	if (payload.response) {
		this.storageAuthToken = payload.response.substring(0, payload.response.length-2);
		this.authServerUrl = "https://sta.palmws.com/storageauth/";
		var fields = this.storageAuthToken.split(":", 5);
		Mojo.Log.warn("fields %j", fields);
		if (fields) {
			var host = fields[1];
			Mojo.Log.warn("host %s", host);
			if (host) {
				this.storageServerUrl = "https://"+host+".backup.st.palmws.com/storage/";
				this.retrieveManifestList();
			}
		}
	}
};

BackupsAssistant.prototype.retrieveManifestList = function()
{
	var callback = this.getManifestListHandler;

	var url = this.storageServerUrl+"manifests/";

	var authorization = "PalmDevice "+this.storageAuthToken;

	Mojo.Log.warn("request %s %s", url, authorization);

	this.requestWebService = new Ajax.Request(url, {
			method: 'GET',
			requestHeaders: {
				"authorization": authorization
			},
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

	this.getAuthTokenButtonModel.disabled = true;
	this.controller.modelChanged(this.getAuthTokenButtonModel);
};

BackupsAssistant.prototype.getManifestList = function(payload)
{
	this.requestWebService = false;

	this.updateSpinner();

	this.getAuthTokenButtonModel.disabled = false;
	this.controller.modelChanged(this.getAuthTokenButtonModel);

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (getManifestList):</b><br>'+payload.errorText);
		return;
	}

	this.manifestSelectorModel.disabled = false;
	this.controller.modelChanged(this.manifestSelectorModel);
	this.showManifestButtonModel.disabled = false;
	this.controller.modelChanged(this.showManifestButtonModel);
	this.restoreBackupButtonModel.disabled = false;
	this.controller.modelChanged(this.restoreBackupButtonModel);

	Mojo.Log.warn("getManifestList %j", payload.response);

	if (payload.response) {
		var manifests = payload.response;
		// this.controller.stageController.pushScene("item", "Manifest List", manifests);
		this.manifestSelectorModel.choices = [];
		for (i = 0; i < manifests.length; i++) {
			var manifest = manifests[i];
			var label = manifest["Last-Modified"];
			var value = manifest["Name"];
			this.manifestSelectorModel.choices.push({"label": label, "value": value});
			this.manifestSelectorModel.value = value;
		}
		this.controller.modelChanged(this.manifestSelectorModel);
	}
};

BackupsAssistant.prototype.showManifestTap = function(event)
{
	var callback = this.showManifestHandler;

	var url = this.storageServerUrl+"manifests/"+this.manifestSelectorModel.value;

	var authorization = "PalmDevice "+this.storageAuthToken;

	Mojo.Log.warn("request %s %s", url, authorization);

	this.requestWebService = new Ajax.Request(url, {
			method: 'GET',
			requestHeaders: {
				"authorization": authorization
			},
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

	this.showManifestButtonModel.disabled = true;
	this.controller.modelChanged(this.showManifestButtonModel);
};

BackupsAssistant.prototype.showManifest = function(payload)
{
	this.requestWebService = false;

	this.updateSpinner();

	this.showManifestButtonModel.disabled = false;
	this.controller.modelChanged(this.showManifestButtonModel);

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (showManifest):</b><br>'+payload.errorText);
		return;
	}

	if (payload.response) {
		this.controller.stageController.pushScene("item", "Backup Manifest", payload.response);
	}
};

BackupsAssistant.prototype.restoreBackupTap = function(event)
{
	this.controller.showAlertDialog({
			allowHTMLMessage:	true,
			title:				'Restore Backup',
			message:			"Are you sure? This will attempt to replace all the current Palm Profile data on your device, which may have an unknown impact on your apps and data.",
			choices:			[{label:$L("Restore"), value:'restore', type:'negative'},{label:$L("Cancel"), value:'cancel', type:'dismiss'}],
			onChoose:			this.restoreBackupAckHandler
		});
};

BackupsAssistant.prototype.restoreBackupAck = function(value)
{
	if (value != "restore") return;

	this.updateSpinner();

	this.restoreBackupButtonModel.disabled = true;
	this.controller.modelChanged(this.restoreBackupButtonModel);

	this.requestDb8 = ImpostahService.impersonate(this.restoreBackupGetHandler,
												  "com.palm.configurator", "com.palm.db",
												  "find", {
													  "query" : {
														  "from": "com.palm.service.backup.prefs:1"
													  }
												  });
};

BackupsAssistant.prototype.restoreBackupGet = function(payload)
{
	if (this.requestDb8) this.requestDb8.cancel();
	this.requestDb8 = false;

	this.updateSpinner();

	this.restoreBackupButtonModel.disabled = false;
	this.controller.modelChanged(this.restoreBackupButtonModel);

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (restoreBackup):</b><br>'+payload.errorText);
		return;
	}

	if (payload.results) {
		if (payload.results.length) {
			this.requestDb8 = ImpostahService.impersonate(this.restoreBackupSetHandler,
														  "com.palm.configurator", "com.palm.db",
														  "merge", {
															  "objects" : [
			{ "_id": payload.results[0]._id, "overrideManifestName": this.manifestSelectorModel.value }
																		   ]
														  });

			this.updateSpinner();

			this.restoreBackupButtonModel.disabled = true;
			this.controller.modelChanged(this.restoreBackupButtonModel);
		}
	}

};

BackupsAssistant.prototype.restoreBackupSet = function(payload)
{
	if (this.requestDb8) this.requestDb8.cancel();
	this.requestDb8 = false;

	this.updateSpinner();

	this.restoreBackupButtonModel.disabled = false;
	this.controller.modelChanged(this.restoreBackupButtonModel);

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (restoreBackup):</b><br>'+payload.errorText);
		return;
	}

	if (payload.results) {
		this.requestBackup = ImpostahService.impersonate(this.restoreBackupStatusHandler,
													  "com.palm.configurator", "com.palm.service.backup",
														 "startRestore", {
															 "subscribe" : true
														 });

		this.updateSpinner();

		this.restoreBackupButtonModel.disabled = true;
		this.controller.modelChanged(this.restoreBackupButtonModel);
	}
};

BackupsAssistant.prototype.restoreBackupStatus = function(payload)
{
	Mojo.Log.info("payload: %j", payload);

	this.backupStatus.innerHTML = payload.STATUS;

	if (payload.returnValue === false || payload.STATUS == "Failed" || payload.STATUS == "Complete") {

		if (payload.returnValue === false) {
			this.errorMessage('<b>Service Error (restoreBackup):</b><br>'+payload.errorText);
		}

		if (payload.STATUS == "Failed") {
			this.errorMessage('<b>Restore Failed</b>');
		}

		if (payload.STATUS == "Complete") {
			this.errorMessage('<b>Restore Complete</b>');
		}

		if (this.requestBackup) this.requestBackup.cancel();
		this.requestBackup = false;

		this.updateSpinner();

		this.restoreBackupButtonModel.disabled = false;
		this.controller.modelChanged(this.restoreBackupButtonModel);

		return;
	}

	this.backupStatus.innerHTML = payload.STATUS + ": " + Math.round(payload.percent/2) +"%";

};

BackupsAssistant.prototype.updateSpinner = function()
{
	if (this.requestDeviceProfile || this.requestPalmProfile ||
		this.requestWebService || this.requestDb8 || this.requestBackup )  {
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
