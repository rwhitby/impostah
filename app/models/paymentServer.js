function paymentServer()
{
    this.paymentServerUrl = false;
    this.callback = false;

    this.requestPalmService = false;
    this.requestWebService = false;
};

paymentServer.prototype.getPaymentServerUrl = function(callback, accountServerUrl, reload)
{
    this.callback = callback;

    if (this.paymentServerUrl && !reload) {
	if (this.callback !== false) {
	    this.callback(true, this.paymentServerUrl, '');
	}
	return;
    }

    this.paymentServerUrl = false;

    var callback = this._gotPreferences.bindAsEventListener(this);

    var url = accountServerUrl+"getPreferences";
    var body = {
	"InPreferences": {
	    "preferenceKey": "APPLICATIONS, PAYMENT",
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

paymentServer.prototype._gotPreferences = function(payload)
{
    this.requestWebService = false;

    if (payload.returnValue === false) {
	if (this.callback !== false) {
	    this.callback(false, false, payload.errorText);
	}
	return;
    }
    else {
	this.paramInfo = payload.response.OutParameterInfo.parameterInfos;
	if (this.paramInfo && this.paramInfo.category == "SETTINGS" && this.paramInfo.key == "PAYMENT_URL") {
	    this.paymentServerUrl = this.paramInfo.value;
	}
	if (this.callback !== false) {
	    this.callback(true, this.paymentServerUrl, '');
	}
    }
};
