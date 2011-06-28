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

	this.deviceId = false;
	this.deviceProfile = false;
	this.palmProfile = false;
	this.metadataUrl = false;
	this.storageAuthUrl = false;
	this.storageUrl = false;

	this.requestPalmService = false;
	this.requestWebService = false;
};

BackupsAssistant.prototype.setup = function()
{
	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	// get elements
	this.overlay = this.controller.get('overlay'); this.overlay.hide();
	this.spinnerElement = this.controller.get('spinner');
	this.manifestSelector = this.controller.get('manifestSelector');
	this.showManifestButton = this.controller.get('showManifestButton');
	this.restoreBackupButton = this.controller.get('restoreBackupButton');
	this.backupStatus = this.controller.get('backupStatus');
	
	// setup back tap
	this.backElement = this.controller.get('icon');
	this.backTapHandler = this.backTap.bindAsEventListener(this);
	this.controller.listen(this.backElement,  Mojo.Event.tap, this.backTapHandler);
	
	// setup handlers
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
	this.controller.setupWidget('spinner', {spinnerSize: 'large'}, this.spinnerModel);
	this.controller.setupWidget('manifestSelector', { }, this.manifestSelectorModel);
	this.controller.setupWidget('showManifestButton', { }, this.showManifestButtonModel);
	this.controller.listen(this.showManifestButton, Mojo.Event.tap, this.showManifestTapHandler);
	this.controller.setupWidget('restoreBackupButton', { }, this.restoreBackupButtonModel);
	this.controller.listen(this.restoreBackupButton, Mojo.Event.tap, this.restoreBackupTapHandler);
};

BackupsAssistant.prototype.activate = function()
{
	this.deviceId = false;
	this.updateSpinner(true);
	DeviceProfile.getDeviceId(this.getDeviceId.bind(this), false);
};

BackupsAssistant.prototype.getDeviceId = function(returnValue, deviceId, errorText)
{
	this.updateSpinner(false);

	if (returnValue === false) {
		this.errorMessage('<b>Service Error (getDeviceProfile):</b><br>'+errorText);
		return;
	}

	this.deviceId = deviceId;

	this.deviceProfile = false;
	this.updateSpinner(true);
	DeviceProfile.getDeviceProfile(this.getDeviceProfile.bind(this), false);
};

BackupsAssistant.prototype.getDeviceProfile = function(returnValue, deviceProfile, errorText)
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

BackupsAssistant.prototype.getPalmProfile = function(returnValue, palmProfile, errorText)
{
	this.updateSpinner(false);

	if (returnValue === false) {
		this.errorMessage('<b>Service Error (getPalmProfile):</b><br>'+errorText);
		return;
	}

	this.palmProfile = palmProfile;

	if (this.palmProfile) {
		this.metadataUrl = false;
		this.storageAuthUrl = false;
		this.storageUrl = false;
		this.updateSpinner(true);
		BackupServer.getBackupServerUrls(this.getBackupServerUrls.bind(this), this.palmProfile.accountServerUrl, false);
	}
	else {
		this.controller.showAlertDialog({
				allowHTMLMessage:	true,
				preventCancel:		true,
				title:				'Palm Profile Not Found',
				message:			'This device does not have an active Palm Profile associated with it.<br>An active Palm Profile is required to access Backup information.',
				choices:			[{label:$L("Ok"), value:'ok'}],
				onChoose:			function(e){}
			});
	}
};

BackupsAssistant.prototype.getBackupServerUrls = function(returnValue, metadataUrl, storageAuthUrl, storageUrl, errorText)
{
	this.updateSpinner(false);

	if (returnValue === false) {
		this.errorMessage('<b>Service Error (getBackupServerUrls):</b><br>'+errorText);
		return;
	}

	this.metadataUrl = metadataUrl;
	this.storageAuthUrl = storageAuthUrl;
	this.storageUrl = storageUrl;

	if (this.storageAuthUrl && this.storageUrl) {
		this.getAuthTokenStart();
	}
	else {
		this.controller.showAlertDialog({
				allowHTMLMessage:	true,
				preventCancel:		true,
				title:				'Backup Server Not Found',
				message:			'This device does not have an active Backup Server associated with it.<br>An active Palm Profile is required to access Backup Server information.',
				choices:			[{label:$L("Ok"), value:'ok'}],
				onChoose:			function(e){}
			});
	}
};

BackupsAssistant.prototype.getAuthTokenStart = function()
{
	var callback = this.getAuthTokenHandler;

	var deviceId = this.deviceId;
	if (deviceId.indexOf("IMEI") === 0) {
		deviceId = deviceId.substring(0, deviceId.length - 2);
	}

	var url = (this.storageAuthUrl+"?email="+encodeURIComponent(this.palmProfile.alias)+
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
	this.updateSpinner(true);
};

BackupsAssistant.prototype.getAuthToken = function(payload)
{
	this.requestWebService = false;
	this.updateSpinner(false);

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (getAuthToken):</b><br>'+payload.errorText);
		return;
	}

	Mojo.Log.warn("getAuthToken %s", payload.response);

	if (payload.response) {
		this.storageAuthToken = payload.response.substring(0, payload.response.length-2);
		var fields = this.storageAuthToken.split(":", 5);
		if (fields) {
			var host = fields[1];
			if (host) {
				this.storageHostUrl = "https://"+host+"."+this.storageUrl.substring(8)+"/";
				this.retrieveManifestList();
			}
		}
	}
};

BackupsAssistant.prototype.retrieveManifestList = function()
{
	var callback = this.getManifestListHandler;

	var url = this.storageHostUrl+"manifests/";

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
	this.updateSpinner(true);
};

BackupsAssistant.prototype.getManifestList = function(payload)
{
	this.requestWebService = false;
	this.updateSpinner(false);

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (getManifestList):</b><br>'+payload.errorText);
		return;
	}

	Mojo.Log.warn("getManifestList %j", payload.response);

	if (payload.response && payload.response.length) {
		var manifests = payload.response;
		this.manifestSelectorModel.choices = [];
		for (i = 0; i < manifests.length; i++) {
			var manifest = manifests[i];
			var label = manifest["Last-Modified"];
			var value = manifest["Name"];
			this.manifestSelectorModel.choices.push({"label": label, "value": value});
			this.manifestSelectorModel.value = value;
		}
		this.manifestSelectorModel.disabled = false;
		this.controller.modelChanged(this.manifestSelectorModel);
		this.showManifestButtonModel.disabled = false;
		this.controller.modelChanged(this.showManifestButtonModel);
		this.restoreBackupButtonModel.disabled = false;
		this.controller.modelChanged(this.restoreBackupButtonModel);
	}
};

BackupsAssistant.prototype.showManifestTap = function(event)
{
	var callback = this.showManifestHandler;

	var url = this.storageHostUrl+"manifests/"+this.manifestSelectorModel.value;

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
	this.updateSpinner(true);

	this.showManifestButtonModel.disabled = true;
	this.controller.modelChanged(this.showManifestButtonModel);
};

BackupsAssistant.prototype.showManifest = function(payload)
{
	this.requestWebService = false;
	this.updateSpinner(false);

	this.showManifestButtonModel.disabled = false;
	this.controller.modelChanged(this.showManifestButtonModel);

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (showManifest):</b><br>'+payload.errorText);
		return;
	}

	if (payload.response) {
		this.controller.stageController.pushScene("item", "Backup Manifest", payload.response, 'backup', false);
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

	if (this.requestPalmService) this.requestPalmService.cancel();
	this.requestPalmService = ImpostahService.impersonate(this.restoreBackupGetHandler,
												  "com.palm.configurator", "com.palm.db",
												  "find", {
													  "query" : {
														  "from": "com.palm.service.backup.prefs:1"
													  }
												  });
	this.updateSpinner(true);

	this.restoreBackupButtonModel.disabled = true;
	this.controller.modelChanged(this.restoreBackupButtonModel);
};

BackupsAssistant.prototype.restoreBackupGet = function(payload)
{
	if (this.requestPalmService) this.requestPalmService.cancel();
	this.requestPalmService = false;
	this.updateSpinner(false);

	this.restoreBackupButtonModel.disabled = false;
	this.controller.modelChanged(this.restoreBackupButtonModel);

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (restoreBackup):</b><br>'+payload.errorText);
		return;
	}

	if (payload.results) {
		if (payload.results.length) {
			this.requestPalmService = ImpostahService.impersonate(this.restoreBackupSetHandler,
																  "com.palm.configurator", "com.palm.db",
																  "merge", {
																	  "objects" : [
			{ "_id": payload.results[0]._id, "overrideManifestName": this.manifestSelectorModel.value }
																				   ]
																  });
			this.updateSpinner(true);

			this.restoreBackupButtonModel.disabled = true;
			this.controller.modelChanged(this.restoreBackupButtonModel);
		}
	}

};

BackupsAssistant.prototype.restoreBackupSet = function(payload)
{
	if (this.requestPalmService) this.requestPalmService.cancel();
	this.requestPalmService = false;
	this.updateSpinner(false);

	this.restoreBackupButtonModel.disabled = false;
	this.controller.modelChanged(this.restoreBackupButtonModel);

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (restoreBackup):</b><br>'+payload.errorText);
		return;
	}

	if (payload.results) {
		this.requestPalmService = ImpostahService.impersonate(this.restoreBackupStatusHandler,
															  "com.palm.configurator", "com.palm.service.backup",
															  "startRestore", {
																  "subscribe" : true
															  });
		this.updateSpinner(true);

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

		if (this.requestPalmService) this.requestPalmService.cancel();
		this.requestPalmService = false;
		this.updateSpinner(false);

		this.restoreBackupButtonModel.disabled = false;
		this.controller.modelChanged(this.restoreBackupButtonModel);

		return;
	}

	this.backupStatus.innerHTML = payload.STATUS + ": " + Math.round(payload.percent/2) +"%";

};

BackupsAssistant.prototype.updateSpinner = function(active)
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

BackupsAssistant.prototype.backTap = function(event)
{
	this.controller.stageController.popScene();
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
	this.controller.stopListening(this.backElement,  Mojo.Event.tap,
								  this.backTapHandler);
	this.controller.stopListening(this.showManifestButton,  Mojo.Event.tap,
								  this.showManifestTapHandler);
};

// Local Variables:
// tab-width: 4
// End:
