function systemPreferences()
{
    this.systemPreferences = false;
    this.callback = false;

    this.requestSystemPreferences = false;
};

systemPreferences.prototype.getSystemPreferences = function(callback, reload)
{
    this.callback = callback;

    if (this.systemPreferences && !reload) {
		if (this.callback !== false) {
			this.callback(true, this.systemPreferences, '');
		}
		return;
    }

    this.systemPreferences = false;

    if (this.requestSystemPreferences) this.requestSystemPreferences.cancel();
    this.requestSystemPreferences = ImpostahService.listSystemPrefs(this._gotSystemPreferences.bind(this));
};

systemPreferences.prototype._gotSystemPreferences = function(payload)
{
    if (payload.returnValue === false) {

		if (this.requestSystemPreferences) this.requestSystemPreferences.cancel();
		this.requestSystemPreferences = false;

		if (this.callback !== false) {
			this.callback(false, false, payload.errorText);
		}
    }
    else {
		if (payload.stage == "start") {
			this.systemPreferences = {};
		}

		var results = payload.results;

		if (results && results.length > 0) {
			for (var a = 0; a < results.length; a++) {
				var arraystring = '['+results[a]+']';

				try {
					var entry = arraystring.evalJSON();
			
					if (entry && (entry.length == 2)) {
						var value = entry[1].evalJSON();
						this.systemPreferences[entry[0]] = value;
					}
				}
				catch (e) {
					Mojo.Log.logException(e, 'systemPreferences#parse');
				}
			}
		}

		if (payload.stage == "end") {

			if (this.requestSystemPreferences) this.requestSystemPreferences.cancel();
			this.requestSystemPreferences = false;

			if (this.callback !== false) {
				this.callback(true, this.systemPreferences, '');
			}
		}
    }
};

// Local Variables:
// tab-width: 4
// End:
