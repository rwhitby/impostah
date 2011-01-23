function AppDataExploreAssistant()
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
	
	this.appIdsModel = {
		value: '',
		choices: [],
		disabled: true
	}
	this.appId = '';
	
	this.dbNamesModel = {
		value: '',
		choices: [],
		disabled: true
	}
	this.dbName = '';
	
	this.showButtonModel = {
		label: $L("Show"),
		disabled: true
	}

	this.databases = {};
	this.database = false;

	this.request = false;
};

AppDataExploreAssistant.prototype.setup = function()
{
	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	// get elements
	this.iconElement = this.controller.get('icon');
	this.iconElement.style.display = 'none';
	this.spinnerElement = 		this.controller.get('spinner');
	this.appIdElement =		this.controller.get('appId');
	this.dbNameElement =	this.controller.get('dbName');
	this.showButton =			this.controller.get('showButton');
	
	// setup handlers
	this.appIdsHandler =		  this.appIds.bindAsEventListener(this);
	this.appIdChangedHandler =	  this.appIdChanged.bindAsEventListener(this);
	this.dbNameChangedHandler =	  this.dbNameChanged.bindAsEventListener(this);
	this.showTapHandler =			  this.showTap.bindAsEventListener(this);
	
	// setup widgets
	this.spinnerModel = {spinning: true};
	this.controller.setupWidget('spinner', {spinnerSize: 'small'}, this.spinnerModel);
	this.controller.setupWidget('appId', {}, this.appIdsModel);
	this.controller.listen(this.appIdElement, Mojo.Event.propertyChange, this.appIdChangedHandler);
	this.controller.setupWidget('dbName', { multiline: true }, this.dbNamesModel);
	this.controller.listen(this.dbNameElement, Mojo.Event.propertyChange, this.dbNameChangedHandler);
	this.controller.setupWidget('showButton', { }, this.showButtonModel);
	this.controller.listen(this.showButton,  Mojo.Event.tap, this.showTapHandler);
	
	this.request = ImpostahService.listAppDatabases(this.appIdsHandler);
};

AppDataExploreAssistant.prototype.appIds = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (appIds):</b><br>'+payload.errorText);
		return;
	}

	if (payload.stage == "start") {
		this.databases = {};
		this.appIdsModel.value = "";
	}

	var oldAppId = prefs.get().lastAppDatabaseAppId;

	var results = payload.results;

	if (results && results.length > 0) {
		for (var a = 0; a < results.length; a++) {
			var arraystring = '['+results[a].replace(/'/g,'"')+']'; //'");
			var entry = arraystring.evalJSON();
			
			if (entry && (entry.length == 6)) {
				var database = {};
				database.guid = entry[0];
				database.origin = entry[1];
				database.name = entry[2];
				database.displayName = entry[3];
				database.estimatedSize = entry[4];
				database.path = entry[5];
				var appId = database.origin;
				var label = appId;
				if (label.indexOf("file_.") == 0) {
					label = label.slice(6);
				}
				if (label.indexOf("media.cryptofs.apps.") == 0) {
					label = label.slice(20);
				}
				if (label.indexOf("usr.palm.applications.") == 0) {
					label = label.slice(22);
				}
				if (appId in this.databases) {
					this.databases[appId].push(database);
				}
				else {
					this.appIdsModel.choices.push({label:label, value:appId});
					this.databases[appId] = [database];
				}
				if (appId == oldAppId) {
					this.appIdsModel.value = oldAppId;
				}
			}
		}
	}

	if (payload.stage == "end") {

		if (this.appIdsModel.value == "") {
			this.appIdsModel.value = this.appIdsModel.choices[0].value;
		}

		// Stop the spinner
		this.iconElement.style.display = 'inline';
		this.spinnerModel.spinning = false;
		this.controller.modelChanged(this.spinnerModel);

		// Enable the drop-down list
		this.appIdsModel.disabled = false;
		this.controller.modelChanged(this.appIdsModel);
		this.appIdChanged({value: this.appIdsModel.value});
	}
};

AppDataExploreAssistant.prototype.appIdChanged = function(event)
{
	var cookie = new preferenceCookie();
	var tprefs = cookie.get();
	tprefs.lastAppDatabaseAppId = event.value;
	cookie.put(tprefs);
	var tmp = prefs.get(true);
	
	this.appId = event.value;

	var oldName = prefs.get().lastAppDatabaseName;

	// Disable the database names list
	this.dbNamesModel.choices = [];
	this.dbNamesModel.value = "";
	this.dbNamesModel.disabled = true;
	this.controller.modelChanged(this.dbNamesModel);

	var databases = this.databases[this.appId];

	if (databases && databases.length > 0) {
		for (var a = 0; a < databases.length; a++) {
			var name = databases[a].name;
			var label = databases[a].name;
			this.dbNamesModel.choices.push({label:label, value:name});
			if (name == oldName) {
				this.dbNamesModel.value = oldName;
			}
		}

		if (this.dbNamesModel.value == "") {
			this.dbNamesModel.value = this.dbNamesModel.choices[0].value;
		}

		// Enable the drop-down list
		this.dbNamesModel.disabled = false;
		this.controller.modelChanged(this.dbNamesModel);
		this.dbNameChanged({value: this.dbNamesModel.value});
	}
};

AppDataExploreAssistant.prototype.dbNameChanged = function(event)
{
	var cookie = new preferenceCookie();
	var tprefs = cookie.get();
	tprefs.lastAppDatabaseName = event.value;
	cookie.put(tprefs);
	var tmp = prefs.get(true);
	
	this.dbName = event.value;

	var databases = this.databases[this.appId];

	this.database = false;

	if (databases && databases.length > 0) {
		for (var a = 0; a < databases.length; a++) {
			var name = databases[a].name;
			if (name == this.dbName) {
				this.database = databases[a];
			}
		}
	}

	if (this.database) {
		// Enable the show button
		this.showButtonModel.disabled = false;
		this.controller.modelChanged(this.showButtonModel);
	}
};

AppDataExploreAssistant.prototype.showTap = function(event)
{
	if (this.appId && this.dbName && this.database) {
		this.controller.stageController.pushScene("item", "App Database", this.database);
	}
};

AppDataExploreAssistant.prototype.errorMessage = function(msg)
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

AppDataExploreAssistant.prototype.handleCommand = function(event)
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

AppDataExploreAssistant.prototype.cleanup = function(event)
{
	// cancel the last request
	if (this.request) this.request.cancel();

	this.controller.stopListening(this.appIdElement, Mojo.Event.propertyChange, this.appIdChangedHandler);
	this.controller.stopListening(this.dbNameElement, Mojo.Event.propertyChange, this.dbNameChangedHandler);
	this.controller.stopListening(this.showButton,	 Mojo.Event.tap, this.showTapHandler);
};

// Local Variables:
// tab-width: 4
// End:
