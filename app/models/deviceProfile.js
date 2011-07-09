function deviceProfile()
{
    this.deviceProfile = false;
    this.deviceId = false;
    this.callback = false;

    this.requestDeviceProfile = false;
    this.requestDeviceId = false;

    this.locationHost = false;
    this.requestLocationHost = false;
};

deviceProfile.prototype.getDeviceProfile = function(callback, reload)
{
    this.callback = callback;

    if (this.deviceProfile && !reload) {
	if (this.callback !== false) {
	    this.callback(true, this.deviceProfile, '');
	}
	return;
    }

    this.deviceProfile = false;

    if (this.requestDeviceProfile) this.requestDeviceProfile.cancel();
    this.requestDeviceProfile = ImpostahService.impersonate(this._gotDeviceProfile.bind(this),
							  "com.palm.configurator",
							  "com.palm.deviceprofile",
							  "getDeviceProfile", {});
};

deviceProfile.prototype._gotDeviceProfile = function(payload)
{
    if (this.requestDeviceProfile) this.requestDeviceProfile.cancel();
    this.requestDeviceProfile = false;

    if (payload.returnValue === false) {
	if (this.callback !== false) {
	    this.callback(false, false, payload.errorText);
	}
    }
    else {
	this.deviceProfile = payload.deviceInfo;
	if (this.callback !== false) {
	    this.callback(true, this.deviceProfile, '');
	}
    }
};

deviceProfile.prototype.getDeviceId = function(callback, reload)
{
    this.callback = callback;

    if (this.deviceId && !reload) {
	if (this.callback !== false) {
	    this.callback(true, this.deviceId, '');
	}
	return;
    }

    this.deviceId = false;

    if (this.requestDeviceId) this.requestDeviceId.cancel();
    this.requestDeviceId = ImpostahService.impersonate(this._gotDeviceId.bind(this),
							  "com.palm.configurator",
							  "com.palm.deviceprofile",
							  "getDeviceId", {});
};

deviceProfile.prototype._gotDeviceId = function(payload)
{
    if (this.requestDeviceId) this.requestDeviceId.cancel();
    this.requestDeviceId = false;

    if (payload.returnValue === false) {
	if (this.callback !== false) {
	    this.callback(false, false, payload.errorText);
	}
    }
    else {
	this.deviceId = payload.deviceId;
	if (this.callback !== false) {
	    this.callback(true, this.deviceId, '');
	}
    }
};

deviceProfile.prototype.getLocationHost = function(callback, reload)
{
    this.callback = callback;

    if (this.locationHost && !reload) {
	if (this.callback !== false) {
	    this.callback(true, this.locationHost, '');
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

deviceProfile.prototype._gotLocationHost = function(payload)
{
    if (this.requestLocationHost) this.requestLocationHost.cancel();
    this.requestLocationHost = false;

    if (payload.returnValue === false) {
	if (this.callback !== false) {
	    this.callback(false, false, payload.errorText);
	}
    }
    else {
	this.locationHost = payload.locationHost;
	if (this.callback !== false) {
	    this.callback(true, this.locationHost, '');
	}
    }
};

deviceProfile.prototype.setLocationHost = function(callback, locationHost)
{
    this.callback = callback;

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
};

deviceProfile.prototype._setLocationHost = function(payload)
{
    if (this.requestLocationHost) this.requestLocationHost.cancel();
    this.requestLocationHost = false;

    if (payload.returnValue === false) {
	if (this.callback !== false) {
	    this.callback(false, payload.errorText);
	}
    }
    else {
	if (this.callback !== false) {
	    this.callback(true, '');
	}
    }
};

