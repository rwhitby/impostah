function accountServer()
{
    this.accountServerUrl = false;
    this.callback = false;

    this.requestPalmService = false;
};

accountServer.prototype.getAccountServerUrl = function(callback, email, reload)
{
    this.callback = callback;

    if (this.accountServerUrl && !reload) {
	if (this.callback !== false) {
	    this.callback(true, this.accountServerUrl, '');
	}
	return;
    }

    this.accountServerUrl = false;

    if (this.requestPalmService) this.requestPalmService.cancel();
    this.requestPalmService = ImpostahService.impersonate(this._gotEmailAvailable.bind(this),
							  "com.palm.configurator",
							  "com.palm.accountservices",
							  "isEmailAvailable", {"email":email});
};

accountServer.prototype._gotEmailAvailable = function(payload)
{
    if (this.requestPalmService) this.requestPalmService.cancel();
    this.requestPalmService = false;

    if (payload.returnValue === false) {
	if (this.callback !== false) {
	    this.callback(false, false, payload.errorText);
	}
	return;
    }

    if (this.requestPalmService) this.requestPalmService.cancel();
    this.requestPalmService = ImpostahService.impersonate(this._gotLocationHost.bind(this),
							  "com.palm.configurator",
							  "com.palm.systemservice",
							  "getPreferences", {"keys":["locationHost"]});
};

accountServer.prototype._gotLocationHost = function(payload)
{
    if (this.requestPalmService) this.requestPalmService.cancel();
    this.requestPalmService = false;

    if (payload.returnValue === false) {
	if (this.callback !== false) {
	    this.callback(false, false, payload.errorText);
	}
    }
    else {
	if (payload.locationHost) {
	    this.accountServerUrl = "https://" + payload.locationHost + "/palmcsext/services/deviceJ/";
	}
	if (this.callback !== false) {
	    this.callback(true, this.accountServerUrl, '');
	}
    }
};


