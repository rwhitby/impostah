function deviceProfile()
{
    this.deviceProfile = false;
    this.callback = false;

    this.requestPalmService = false;
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

    if (this.requestPalmService) this.requestPalmService.cancel();
    this.requestPalmService = ImpostahService.impersonate(this._gotDeviceProfile.bind(this),
							  "com.palm.configurator",
							  "com.palm.deviceprofile",
							  "getDeviceProfile", {});
};

deviceProfile.prototype._gotDeviceProfile = function(payload)
{
    if (this.requestPalmService) this.requestPalmService.cancel();
    this.requestPalmService = false;

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


