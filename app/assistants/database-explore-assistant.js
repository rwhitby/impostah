function DatabaseExploreAssistant()
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
	
	this.databaseSetsModel = {
		value: '',
		choices: [
	{value:"com.palm.db",	  label:"Persistent"},
	{value:"com.palm.tempdb", label:"Temporary"}
				  ],
		disabled: false
	}
	this.setId = '';
	
	this.databaseKindsModel = {
		value: '',
		choices: [],
		disabled: true
	}
	this.kindId = '';
	
	this.databaseId = '';
	this.databaseOwner = '';

	this.queryButtonModel = {
		label: $L("Query"),
		disabled: true
	}

	this.request = false;

	this.names = $H();

	this.names['com.palm.account:1'] = function(item) {
		return item.templateId+' : '+item.username;
	};
	this.names['com.palm.activity:1'] = function(item) {
		var creator = '';
		if (item.creator.serviceId) creator = item.creator.serviceId;
		if (item.creator.appId) creator = item.creator.appId;
		return creator+' : '+item.name;
	};
	this.names['com.palm.browserbookmarks:1'] = function(item) {
		return item.title;
	};
	this.names['com.palm.browserhistory:1'] = function(item) {
		return item.title;
	};
	this.names['com.palm.calendar:1'] = function(item) {
		return item.name;
	};
	this.names['com.palm.carrierdb.settings.current:1'] = function(item) {
		return item.qOperatorLongName;
	};
	this.names['com.palm.chatthread:1'] = function(item) {
		return item.displayName;
	};
	this.names['com.palm.contact:1'] = function(item) {
		return item.nickname || item.name.givenName+" "+item.name.familyName;
	};
	this.names['com.palm.contextupload:1'] = function(item) {
		return item.appid+" : "+item.event;
	};
	this.names['com.palm.email:1'] = function(item) {
		return item.subject;
	};
	this.names['com.palm.folder:1'] = function(item) {
		return item.displayName;
	};
	this.names['com.palm.imap.account:1'] = function(item) {
		return item.server+" : "+item.username;
	};
	this.names['com.palm.imloginstate:1'] = function(item) {
		return item.serviceName+" : "+item.username;
	};
	this.names['com.palm.immessage:1'] = function(item) {
		return item.messageText;
	};
	this.names['com.palm.message:1'] = function(item) {
		return item.messageText;
	};
	this.names['com.palm.note:1'] = function(item) {
		return item.title;
	};
	this.names['com.palm.palmprofile:1'] = function(item) {
		return item.alias;
	};
	this.names['com.palm.person:1'] = function(item) {
		return item.name.givenName+" "+item.name.familyName;
	};
	this.names['com.palm.phonecall:1'] = function(item) {
		if (item.type == "incoming") {
			return item.from.name || item.from.addr;
		}
		else {
			return item.to[0].name || item.to[0].addr;
		}
	};
};

DatabaseExploreAssistant.prototype.setup = function()
{
	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	// get elements
	this.databaseSetElement =	this.controller.get('databaseSet');
	this.databaseKindElement =	this.controller.get('databaseKind');
	this.queryButton =			this.controller.get('queryButton');
	this.bodyElement =			this.controller.get('body');
	
	// setup handlers
	this.databaseSetChangedHandler =  this.databaseSetChanged.bindAsEventListener(this);
	this.databaseKindsHandler =		  this.databaseKinds.bindAsEventListener(this);
	this.databaseKindHandler =		  this.databaseKind.bindAsEventListener(this);
	this.databaseKindChangedHandler = this.databaseKindChanged.bindAsEventListener(this);
	this.queryTapHandler =			  this.queryTap.bindAsEventListener(this);
	
	// setup widgets
	this.controller.setupWidget('databaseSet', {}, this.databaseSetsModel);
	this.controller.listen(this.databaseSetElement, Mojo.Event.propertyChange, this.databaseSetChangedHandler);
	this.controller.setupWidget('databaseKind', { multiline: true }, this.databaseKindsModel);
	this.controller.listen(this.databaseKindElement, Mojo.Event.propertyChange, this.databaseKindChangedHandler);
	this.controller.setupWidget('queryButton', { }, this.queryButtonModel);
	this.controller.listen(this.queryButton,  Mojo.Event.tap, this.queryTapHandler);
	
	this.setId = prefs.get().lastDatabaseSet;
	if (!this.setId || this.setId == '') {
		this.setId = this.databaseSetsModel.choices[0].value;
	}
	this.databaseSetChanged({value: this.setId});

};

DatabaseExploreAssistant.prototype.databaseSetChanged = function(event)
{
	var cookie = new preferenceCookie();
	var tprefs = cookie.get();
	tprefs.lastDatabaseSet = event.value;
	cookie.put(tprefs);
	var tmp = prefs.get(true);
	
	this.setId = event.value;

	// Disable the query button
	this.queryButtonModel.disabled = true;
	this.controller.modelChanged(this.queryButtonModel);

	// Disable the database kinds list
	this.databaseKindsModel.choices = [];
	this.databaseKindsModel.value = "";
	this.databaseKindsModel.disabled = true;
	this.controller.modelChanged(this.databaseKindsModel);

	if (this.request) this.request.cancel();
	this.request = ImpostahService.impersonate(this.databaseKindsHandler, "com.palm.configurator", this.setId,
											   "find", {
												   "query" : {
													   "select" : [ "id", "owner" ],
													   "from" : "Kind:1"
												   }
											   });
};

DatabaseExploreAssistant.prototype.databaseKinds = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (databaseKinds):</b><br>'+payload.errorText);
		return;
	}

	var oldKind = prefs.get().lastDatabaseKind;
	var newKind = false;

	var databases = payload.results;

	if (databases && databases.length > 0) {
		for (var a = 0; a < databases.length; a++) {
			var id = databases[a].id;
			var label = databases[a].id;
			if (label.indexOf("com.palm.") == 0) {
				label = label.slice(9);
			}
			var rowClass = '';
			if (!this.names[databases[a].id]) {
				rowClass = 'uninteresting';
			}
			this.databaseKindsModel.choices.push({label:label, value:id, rowClass: rowClass});
			if (id == oldKind) {
				newKind = oldKind;
			}
		}
		
		if (newKind === false) {
			newKind = databases[0].id;
		}
	}
	
	// Enable the drop-down list
	this.databaseKindsModel.disabled = false;
	this.databaseKindsModel.value = newKind;
	this.controller.modelChanged(this.databaseKindsModel);
	this.databaseKindChanged({value: newKind});
};

DatabaseExploreAssistant.prototype.databaseKindChanged = function(event)
{
	var cookie = new preferenceCookie();
	var tprefs = cookie.get();
	tprefs.lastDatabaseKind = event.value;
	cookie.put(tprefs);
	var tmp = prefs.get(true);
	
	this.kindId = event.value;

	// Disable the query button
	this.queryButtonModel.disabled = true;
	this.controller.modelChanged(this.queryButtonModel);

	this.query = {
		"select" : [ "id", "owner" ],
		"from" : "Kind:1",
		"where" : [{
				"prop" : "id",
				"op" : "=",
				"val" : this.kindId
			}]
	};

	if (this.request) this.request.cancel();
	this.request = ImpostahService.impersonate(this.databaseKindHandler, "com.palm.configurator", this.setId,
											   "find", { "query" : this.query });
};

DatabaseExploreAssistant.prototype.databaseKind = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (databaseKind):</b><br>'+payload.errorText);
		return;
	}

	if (payload.results && payload.results[0]) {
		this.databaseId = payload.results[0].id;
		this.databaseOwner = payload.results[0].owner;

		// Enable the query button
		this.queryButtonModel.disabled = false;
		this.controller.modelChanged(this.queryButtonModel);
	}
};

DatabaseExploreAssistant.prototype.queryTap = function(event)
{
	if (this.databaseOwner && this.setId && this.databaseId) {
		this.controller.stageController.pushScene("query", this.databaseOwner, this.setId, this.databaseId,
												  this.names[this.databaseId]);
	}
};

DatabaseExploreAssistant.prototype.errorMessage = function(msg)
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

DatabaseExploreAssistant.prototype.handleCommand = function(event)
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

DatabaseExploreAssistant.prototype.cleanup = function(event)
{
	// cancel the last request
	if (this.request) this.request.cancel();

	this.controller.stopListening(this.databaseSetElement, Mojo.Event.propertyChange, this.databaseSetChangedHandler);
	this.controller.stopListening(this.databaseKindElement, Mojo.Event.propertyChange, this.databaseKindChangedHandler);
	this.controller.stopListening(this.queryButton,	 Mojo.Event.tap, this.queryTapHandler);
};

// Local Variables:
// tab-width: 4
// End:
