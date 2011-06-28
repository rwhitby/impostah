function backupServer()
{
    this.metadataUrl = false;
    this.storageAuthUrl = false;
    this.storageUrl = false;
    this.callback = false;

    this.requestPalmService = false;
    this.requestWebService = false;
};

backupServer.prototype.getBackupServerUrls = function(callback, accountServerUrl, reload)
{
    this.callback = callback;

    if (this.metadataUrl && this.storageAuthUrl && this.storageUrl && !reload) {
	if (this.callback !== false) {
	    this.callback(true, this.metadataUrl, this.storageAuthUrl, this.storageUrl, '');
	}
	return;
    }

    this.metadataUrl = false;
    this.storageAuthUrl = false;
    this.storageUrl = false;

    var callback = this._gotPreferences.bindAsEventListener(this);

    var url = accountServerUrl+"getPreferences";
    var body = {
	"InPreferences": {
	    "preferenceKey": "APPLICATIONS, BKUP2_SRV",
	    "category": ""
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

backupServer.prototype._gotPreferences = function(payload)
{
    this.requestWebService = false;

    if (payload.returnValue === false) {
	if (this.callback !== false) {
	    this.callback(false, false, payload.errorText);
	}
	return;
    }
    else {
	this.paramInfos = payload.response.OutParameterInfo.parameterInfos;
	for (i = 0; i < this.paramInfos.length; i++) {
	    if (this.paramInfos[i].category == "SETTINGS") {
		if (this.paramInfos[i].key == "METADATA_URL") {
		    this.metadataUrl = this.paramInfos[i].value;
		}
		if (this.paramInfos[i].key == "STORAGE_AUTH_URL") {
		    this.storageAuthUrl = this.paramInfos[i].value;
		}
		if (this.paramInfos[i].key == "STORAGE_URL") {
		    this.storageUrl = this.paramInfos[i].value;
		}
	    }
	}
	if (this.callback !== false) {
	    this.callback(true, this.metadataUrl, this.storageAuthUrl, this.storageUrl, '');
	}
    }
};
