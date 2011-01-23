function WebCookieExploreAssistant()
{
	// setup menu
	this.menuModel = {
		visible: true,
		items: [
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
	
	this.cookieUrlsModel = {
		value: '',
		choices: [],
		disabled: true
	}
	this.url = '';
	
	this.cookieNamesModel = {
		value: '',
		choices: [],
		disabled: true
	}
	this.name = '';
	
	this.showButtonModel = {
		label: $L("Show"),
		disabled: true
	}

	this.cookies = {};

	this.request = false;
};

WebCookieExploreAssistant.prototype.setup = function()
{
	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	// get elements
	this.iconElement = this.controller.get('icon');
	this.iconElement.style.display = 'none';
	this.spinnerElement = 		this.controller.get('spinner');
	this.cookieUrlElement =		this.controller.get('cookieUrl');
	this.cookieNameElement =	this.controller.get('cookieName');
	this.showButton =			this.controller.get('showButton');
	
	// setup handlers
	this.cookieUrlsHandler =		  this.cookieUrls.bindAsEventListener(this);
	this.cookieUrlChangedHandler =	  this.cookieUrlChanged.bindAsEventListener(this);
	this.cookieNameChangedHandler =	  this.cookieNameChanged.bindAsEventListener(this);
	this.showTapHandler =			  this.showTap.bindAsEventListener(this);
	
	// setup widgets
	this.spinnerModel = {spinning: true};
	this.controller.setupWidget('spinner', {spinnerSize: 'small'}, this.spinnerModel);
	this.controller.setupWidget('cookieUrl', {}, this.cookieUrlsModel);
	this.controller.listen(this.cookieUrlElement, Mojo.Event.propertyChange, this.cookieUrlChangedHandler);
	this.controller.setupWidget('cookieName', { multiline: true }, this.cookieNamesModel);
	this.controller.listen(this.cookieNameElement, Mojo.Event.propertyChange, this.cookieNameChangedHandler);
	this.controller.setupWidget('showButton', { }, this.showButtonModel);
	this.controller.listen(this.showButton,  Mojo.Event.tap, this.showTapHandler);
	
	this.request = ImpostahService.listWebCookies(this.cookieUrlsHandler);
};

WebCookieExploreAssistant.prototype.cookieUrls = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (cookieUrls):</b><br>'+payload.errorText);
		return;
	}

	if (payload.stage == "start") {
		this.cookies = {};
	}

	var oldUrl = prefs.get().lastWebCookieUrl;

	var results = payload.results;

	if (results && results.length > 0) {
		for (var a = 0; a < results.length; a++) {
			var arraystring = '['+results[a].replace(/'/g,'"')+']'; //'");
			var entry = arraystring.evalJSON();
			
			if (entry && (entry.length == 7)) {
				var cookie = {};
				cookie.domain_head = entry[0];
				cookie.domain_tail = entry[1];
				cookie.path = entry[2];
				cookie.name = entry[3];
				cookie.value = entry[4];
				cookie.expires = entry[5];
				cookie.secure = entry[6];
				var url = cookie.domain_head + cookie.domain_tail + cookie.path;
				if (url in this.cookies) {
					this.cookies[url].push(cookie);
				}
				else {
					this.cookieUrlsModel.choices.push({label:url, value:url});
					this.cookies[url] = [cookie];
				}
				if (url == oldUrl) {
					this.cookieUrlsModel.value = oldUrl;
				}
			}
		}
	}

	if (payload.stage == "end") {

		if (this.cookieUrlsModel.value == "") {
			this.cookieUrlsModel.value = this.cookieUrlsModel.choices[0].value;
		}

		// Stop the spinner
		this.iconElement.style.display = 'inline';
		this.spinnerModel.spinning = false;
		this.controller.modelChanged(this.spinnerModel);

		// Enable the drop-down list
		this.cookieUrlsModel.disabled = false;
		this.controller.modelChanged(this.cookieUrlsModel);
		this.cookieUrlChanged({value: this.cookieUrlsModel.value});
	}
};

WebCookieExploreAssistant.prototype.cookieUrlChanged = function(event)
{
	var cookie = new preferenceCookie();
	var tprefs = cookie.get();
	tprefs.lastWebCookieUrl = event.value;
	cookie.put(tprefs);
	var tmp = prefs.get(true);
	
	this.url = event.value;

	var oldName = prefs.get().lastWebCookieName;

	// Disable the cookie names list
	this.cookieNamesModel.choices = [];
	this.cookieNamesModel.value = "";
	this.cookieNamesModel.disabled = true;
	this.controller.modelChanged(this.cookieNamesModel);

	var cookies = this.cookies[this.url];

	if (cookies && cookies.length > 0) {
		for (var a = 0; a < cookies.length; a++) {
			var name = cookies[a].name;
			var label = cookies[a].name;
			this.cookieNamesModel.choices.push({label:label, value:name});
			if (name == oldName) {
				this.cookieNamesModel.value = oldName;
			}
		}

		if (this.cookieNamesModel.value == "") {
			this.cookieNamesModel.value = this.cookieNamesModel.choices[0].value;
		}

		// Enable the drop-down list
		this.cookieNamesModel.disabled = false;
		this.controller.modelChanged(this.cookieNamesModel);
		this.cookieNameChanged({value: this.cookieNamesModel.value});
	}
};

WebCookieExploreAssistant.prototype.cookieNameChanged = function(event)
{
	var cookie = new preferenceCookie();
	var tprefs = cookie.get();
	tprefs.lastWebCookieName = event.value;
	cookie.put(tprefs);
	var tmp = prefs.get(true);
	
	this.name = event.value;

	var cookies = this.cookies[this.url];

	this.cookie = false;

	if (cookies && cookies.length > 0) {
		for (var a = 0; a < cookies.length; a++) {
			var name = cookies[a].name;
			if (name == this.name) {
				this.cookie = cookies[a];
			}
		}
	}

	if (this.cookie) {
		// Enable the show button
		this.showButtonModel.disabled = false;
		this.controller.modelChanged(this.showButtonModel);
	}
};

WebCookieExploreAssistant.prototype.showTap = function(event)
{
	if (this.url && this.name && this.cookie) {
		this.controller.stageController.pushScene("item", "Web Cookie", this.cookie);
	}
};

WebCookieExploreAssistant.prototype.errorMessage = function(msg)
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

WebCookieExploreAssistant.prototype.handleCommand = function(event)
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

WebCookieExploreAssistant.prototype.cleanup = function(event)
{
	// cancel the last request
	if (this.request) this.request.cancel();

	this.controller.stopListening(this.cookieUrlElement, Mojo.Event.propertyChange, this.cookieUrlChangedHandler);
	this.controller.stopListening(this.cookieNameElement, Mojo.Event.propertyChange, this.cookieNameChangedHandler);
	this.controller.stopListening(this.showButton,	 Mojo.Event.tap, this.showTapHandler);
};

// Local Variables:
// tab-width: 4
// End:
