function accountServer()
{
    this.locationHost = false;
    this.locationHostCallback = false;
    this.requestLocationHost = false;

    this.accountServerUrl = false;
    this.accountServerUrlCallback = false;
    this.requestAccountServerUrl = false;
};

accountServer.prototype.getLocationHost = function(callback, reload)
{
    this.locationHostCallback = callback;

    if (this.locationHost && !reload) {
	if (this.locationHostCallback !== false) {
	    this.locationHostCallback(true, this.locationHost, '');
	}
	return;
    }

    this.locationHost = false;

    if (this.requestLocationHost) this.requestLocationHost.cancel();
    this.requestLocationHost = ImpostahService.impersonate(this._gotLocationHost.bind(this),
							   "com.palm.configurator",
							   "com.palm.systemservice",
							   "getPreferences", { "keys": ["locationHost"] });
};

accountServer.prototype._gotLocationHost = function(payload)
{
    if (this.requestLocationHost) this.requestLocationHost.cancel();
    this.requestLocationHost = false;

    if (payload.returnValue === false) {
	if (this.locationHostCallback !== false) {
	    this.locationHostCallback(false, false, payload.errorText);
	}
    }
    else {
	this.locationHost = payload.locationHost;

	if (this.locationHostCallback !== false) {
	    this.locationHostCallback(true, this.locationHost, '');
	}
    }
};

accountServer.prototype.setLocationHost = function(callback, locationHost)
{
    this.locationHostCallback = callback;

    this.locationHost = false;

    var locationDomain = locationHost.substring(locationHost.indexOf(".") + 1);

    if (this.requestLocationHost) this.requestLocationHost.cancel();
    this.requestLocationHost = ImpostahService.impersonate(this._setLocationHost.bind(this),
							   "com.palm.configurator",
							   "com.palm.systemservice",
							   "setPreferences", {
							       "locationHost" : locationHost,
							       "locationDomain" : locationDomain
							   });

    // Clear the cache of the accountServerUrl, since it may change
    this.accountServerUrl = false;
};

accountServer.prototype._setLocationHost = function(payload)
{
    if (this.requestLocationHost) this.requestLocationHost.cancel();
    this.requestLocationHost = false;

    if (payload.returnValue === false) {
	if (this.locationHostCallback !== false) {
	    this.locationHostCallback(false, payload.errorText);
	}
	return;
    }

    if (this.requestLocationHost) this.requestLocationHost.cancel();
    this.requestLocationHost = ImpostahService.restartUpdateDaemon(this._updateDaemonRestarted.bind(this));
};

accountServer.prototype._updateDaemonRestarted = function(payload)
{
    if (this.requestLocationHost) this.requestLocationHost.cancel();
    this.requestLocationHost = false;

    // Ignore the return value from the restart call, since it may not have been running.

    if (this.locationHostCallback !== false) {
	this.locationHostCallback(true, '');
    }
};

accountServer.prototype.getAccountServerUrl = function(callback, reload)
{
    this.accountServerUrlCallback = callback;

    if (this.accountServerUrl && !reload) {
	if (this.accountServerUrlCallback !== false) {
	    this.accountServerUrlCallback(true, this.accountServerUrl, '');
	}
	return;
    }

    this.accountServerUrl = false;

    if (this.requestAccountServerUrl) this.requestAccountServerUrl.cancel();
    this.requestAccountServerUrl = ImpostahService.impersonate(this._gotAccountServerUrl.bind(this),
							  "com.palm.configurator",
							  "com.palm.accountservices",
							  "getServerUrl", {});
};

accountServer.prototype._gotAccountServerUrl = function(payload)
{
    if (this.requestAccountServerUrl) this.requestAccountServerUrl.cancel();
    this.requestAccountServerUrl = false;

    if (payload.returnValue === false) {
	if (this.accountServerUrlCallback !== false) {
	    this.accountServerUrlCallback(false, false, payload.errorText);
	}
    }
    else {
	if (payload.serverUrl) {
	    this.accountServerUrl = payload.serverUrl;
	}
	if (this.accountServerUrlCallback !== false) {
	    this.accountServerUrlCallback(true, this.accountServerUrl, '');
	}
    }
};
