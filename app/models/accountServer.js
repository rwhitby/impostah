function accountServer()
{
    this.accountServerUrl = false;
    this.callback = false;

    this.requestPalmService = false;
};

accountServer.prototype.getAccountServerUrl = function(callback, reload)
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
    this.requestPalmService = ImpostahService.impersonate(this._gotAccountServerUrl.bind(this),
							  "com.palm.configurator",
							  "com.palm.accountservices",
							  "getServerUrl", {});
};

accountServer.prototype._gotAccountServerUrl = function(payload)
{
    if (this.requestPalmService) this.requestPalmService.cancel();
    this.requestPalmService = false;

    if (payload.returnValue === false) {
	if (this.callback !== false) {
	    this.callback(false, false, payload.errorText);
	}
    }
    else {
	if (payload.serverUrl) {
	    this.accountServerUrl = payload.serverUrl;
	}
	if (this.callback !== false) {
	    this.callback(true, this.accountServerUrl, '');
	}
    }
};


