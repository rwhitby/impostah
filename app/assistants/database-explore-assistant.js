function DatabaseExploreAssistant()
{
	// setup menu
	this.menuModel =
	{
		visible: true,
		items:
		[
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
	
	this.dbKindsSet = $H();
	this.dbKindsModel =
	{
		value: prefs.get().lastDatabaseKind,
		choices: [],
		multiline: true,
		disabled: true
	}
	this.kindId = '';
	this.kindData = '';
	
	this.dbPermsSet = $H();
	this.dbPermsModel =
	{
		value: prefs.get().lastDatabasePerm,
		choices: [],
		multiline: true,
		disabled: true
	}
	this.permData = '';
	
};

DatabaseExploreAssistant.prototype.setup = function()
{
	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	// get elements
	this.dbKindElement =		this.controller.get('dbKind');
	this.dbPermElement =		this.controller.get('dbPerm');
	this.queryButton =			this.controller.get('queryButton');
	this.bodyElement =			this.controller.get('body');
	
	// setup handlers
	this.dbKindChangedHandler = this.dbKindChanged.bindAsEventListener(this);
	this.dbPermChangedHandler = this.dbPermChanged.bindAsEventListener(this);
    this.queryTapHandler = 		this.queryTap.bindAsEventListener(this);
    this.impersonateHandler = 	this.impersonate.bindAsEventListener(this);
	
	this.controller.setupWidget
	(
		'dbKind',
		{},
		this.dbKindsModel
	);
	
	this.controller.listen(this.dbKindElement, Mojo.Event.propertyChange, this.dbKindChangedHandler);
	
	this.controller.setupWidget
	(
		'dbPerm',
		{},
		this.dbPermsModel
	);
	
	this.controller.listen(this.dbPermElement, Mojo.Event.propertyChange, this.dbPermChangedHandler);

	this.controller.setupWidget
	(
		'queryButton',
		{},
		this.queryButtonModel =
		{
			buttonLabel: $L("Query"),
			disabled: true
		}
	);
	
	this.controller.listen(this.queryButton,  Mojo.Event.tap, this.queryTapHandler);
	
	this.dbKindsModel.choices = [];
	this.dbPermsModel.choices = [];
    this.bodyElement.innerHTML = "";

	this.request = ImpostahService.listDbPerms(this.dbPerms.bindAsEventListener(this, "tempdb/permissions"),
											   "tempdb/permissions");
	
};

DatabaseExploreAssistant.prototype.dbKinds = function(payload, location)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (listDbKinds):</b><br>'+payload.errorText);
		return;
	}

	var oldKind = prefs.get().lastDatabaseKind;
	var newKind = false;

	if (payload.stdOut && payload.stdOut.length > 0)
	{
		payload.stdOut.sort();
		
		for (var a = 0; a < payload.stdOut.length; a++)
		{
			var id = payload.stdOut[a];
			this.dbKindsSet[id] = location;
			this.dbKindsModel.choices.push({label:id, value:id});
			if (id == oldKind) {
				newKind = oldKind;
			}
		}
		
		if (newKind === false) {
			newKind = payload.stdOut[0];
		}

		this.controller.modelChanged(this.dbKindsModel);
	}

	if (location == "tempdb/kinds") {
		this.request = ImpostahService.listDbKinds(this.dbKinds.bindAsEventListener(this, "db_kinds"), "db_kinds");
	}
	else if (location == "db_kinds") {
		this.request = ImpostahService.listDbKinds(this.dbKinds.bindAsEventListener(this, "db/kinds"), "db/kinds");
	}
	else {
		// Enable the drop-down list
		this.dbKindsModel.disabled = false;
		this.dbKindsModel.value = newKind;
		this.controller.modelChanged(this.dbKindsModel);
		this.dbKindChanged({value: newKind});
	}
};

DatabaseExploreAssistant.prototype.dbPerms = function(payload, location)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (listDbPerms):</b><br>'+payload.errorText);
		return;
	}

	var oldPerm = prefs.get().lastDatabasePerm;
	var newPerm = false;

	if (payload.stdOut && payload.stdOut.length > 0)
	{
		payload.stdOut.sort();
		
		for (var a = 0; a < payload.stdOut.length; a++)
		{
			var id = payload.stdOut[a];
			this.dbPermsSet[id] = location;
			this.dbPermsModel.choices.push({label:id, value:id});
			if (id == oldPerm) {
				newPerm = oldPerm;
			}
		}
		
		if (newPerm === false) {
			newPerm = payload.stdOut[0];
		}

		this.controller.modelChanged(this.dbPermsModel);
	}

	if (location == "tempdb/permissions") {
		this.request = ImpostahService.listDbPerms(this.dbPerms.bindAsEventListener(this, "db/permissions"),
												   "db/permissions");
	}
	else {
		// Enable the drop-down list
		this.dbPermsModel.disabled = false;
		this.dbPermsModel.value = newPerm;
		this.controller.modelChanged(this.dbPermsModel);
		// this.dbPermChanged({value: newPerm});

		// Now get the list of kinds
		this.request = ImpostahService.listDbKinds(this.dbKinds.bindAsEventListener(this, "tempdb/kinds"),
												   "tempdb/kinds");
	}
};

DatabaseExploreAssistant.prototype.dbKindChanged = function(event)
{
	var cookie = new preferenceCookie();
	var tprefs = cookie.get();
	tprefs.lastDatabaseKind = event.value;
	cookie.put(tprefs);
	var tmp = prefs.get(true);
	
	this.kindId = '';
    this.bodyElement.innerHTML = "";
	
	// Disable the query button
	this.queryButtonModel.disabled = true;
	this.controller.modelChanged(this.queryButtonModel);

	this.request = ImpostahService.getDbKind(this.dbKind.bindAsEventListener(this),
											 event.value, this.dbKindsSet[event.value]);
}

DatabaseExploreAssistant.prototype.dbKind = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (getDbKind):</b><br>'+payload.errorText);
		return;
	}

	// no stage means its not a subscription, and we should have all the contents right now
	if (!payload.stage) {
		if (payload.contents) {
			this.kindData = payload.contents;
		}
	}
	else {
		if (payload.stage == 'start') {
			// at start we clear the old data to make sure its empty
			this.kindData = '';
			return;
		}
		else if (payload.stage == 'middle') {
			// in the middle, we append the data
			if (payload.contents) {
				this.kindData += payload.contents;
			}
			return;
		}
		else if (payload.stage == 'end') {
			// at end, we parse the data we've recieved this whole time
		}
	}

	try {
		var obj = JSON.parse(this.kindData);
		
		this.dbPermsModel.value = obj.owner;
		this.kindId = obj.id;
		this.controller.modelChanged(this.dbPermsModel);

		// Enable the query button
		this.queryButtonModel.disabled = false;
		this.controller.modelChanged(this.queryButtonModel);
	}
	catch (e) {
		Mojo.Log.logException(e, 'DatabaseExplore#dbKind');
		this.errorMessage('<b>Parsing Error (dbKind):</b><br>'+e.message);
		return;
	}
};

DatabaseExploreAssistant.prototype.dbPermChanged = function(event)
{
	var cookie = new preferenceCookie();
	var tprefs = cookie.get();
	tprefs.lastDatabasePerm = event.value;
	cookie.put(tprefs);
	var tmp = prefs.get(true);
	
    this.bodyElement.innerHTML = "";

	this.request = ImpostahService.getDbPerm(this.dbPerm.bindAsEventListener(this),
											 event.value, this.dbPermsSet[event.value]);
}

DatabaseExploreAssistant.prototype.dbPerm = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (getDbPerm):</b><br>'+payload.errorText);
		return;
	}

	// no stage means its not a subscription, and we should have all the contents right now
	if (!payload.stage) {
		if (payload.contents) {
			this.permData = payload.contents;
		}
	}
	else {
		if (payload.stage == 'start') {
			// at start we clear the old data to make sure its empty
			this.permData = '';
			return;
		}
		else if (payload.stage == 'middle') {
			// in the middle, we append the data
			if (payload.contents) {
				this.permData += payload.contents;
			}
			return;
		}
		else if (payload.stage == 'end') {
			// at end, we parse the data we've recieved this whole time
		}
	}

	try {
		var obj = JSON.parse(this.permData);
	}
	catch (e) {
		Mojo.Log.logException(e, 'DatabaseExplore#dbPerm');
		this.errorMessage('<b>Parsing Error (dbPerm):</b><br>'+e.message);
		return;
	}
};

DatabaseExploreAssistant.prototype.queryTap = function(event)
{
	var service = "com.palm.db";
	if (this.dbKindsSet[this.dbKindsModel.value] == "tempdb/kinds") {
		service = "com.palm.tempdb";
	}

	if (this.kindId && this.dbPermsModel.value) {
		this.request = ImpostahService.impersonate(this.impersonateHandler,
												   this.dbPermsModel.value,
												   service, "find", { "query" : { "from" : this.kindId }});
	}
};

DatabaseExploreAssistant.prototype.impersonate = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (impersonate):</b><br>'+payload.errorText);
		return;
	}

	if (payload.results) {
		this.bodyElement.innerHTML = JSON.stringify(payload.results);
	}

	// Mojo.Log.error('==============');
	// for (var p in payload) Mojo.Log.error(p, ': ', payload[p]);
};

DatabaseExploreAssistant.prototype.activate = function(event)
{
	
	if (this.firstActivate)
	{
	}
	else
	{
		
	}
	this.firstActivate = true;
};
DatabaseExploreAssistant.prototype.deactivate = function(event)
{
};

DatabaseExploreAssistant.prototype.errorMessage = function(msg)
{
	this.controller.showAlertDialog(
	{
		allowHTMLMessage:	true,
		preventCancel:		true,
	    title:				'Impostah',
	    message:			msg,
	    choices:			[{label:$L("Ok"), value:'ok'}],
	    onChoose:			function(e){}
    });
}
DatabaseExploreAssistant.prototype.handleCommand = function(event)
{
	if (event.type == Mojo.Event.command)
	{
		switch (event.command)
		{
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
};

// Local Variables:
// tab-width: 4
// End:
