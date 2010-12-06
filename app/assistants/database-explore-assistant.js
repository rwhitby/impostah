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
	
	this.databaseSetsModel =
	{
		value: prefs.get().lastDatabaseSet,
		choices: [],
		disabled: true
	}
	this.setId = '';
	
	this.databaseKindsModel =
	{
		value: prefs.get().lastDatabaseKind,
		choices: [],
		disabled: true
	}
	this.kindId = '';
	
	this.databaseId = '';
	this.databaseOwner = '';

	this.databaseSetLabels = $H();
	this.databaseSetLabels["db/kinds"]     = "System Databases A";
	this.databaseSetLabels["db_kinds"]     = "System Databases B";
	this.databaseSetLabels["tempdb/kinds"] = "Temporary Databases";

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
    this.databaseSetsHandler = 	this.databaseSets.bindAsEventListener(this);
    this.databaseKindsHandler = this.databaseKinds.bindAsEventListener(this);
    this.databaseKindHandler = 	this.databaseKind.bindAsEventListener(this);
	this.databaseSetChangedHandler = this.databaseSetChanged.bindAsEventListener(this);
	this.databaseKindChangedHandler = this.databaseKindChanged.bindAsEventListener(this);
    this.queryTapHandler = 		this.queryTap.bindAsEventListener(this);
    this.impersonateHandler = 	this.impersonate.bindAsEventListener(this);
	
	this.controller.setupWidget
	(
		'databaseSet',
		{ multiline: true },
		this.databaseSetsModel
	);
	
	this.controller.listen(this.databaseSetElement, Mojo.Event.propertyChange, this.databaseSetChangedHandler);
	
	this.controller.setupWidget
	(
		'databaseKind',
		{ multiline: true },
		this.databaseKindsModel
	);
	
	this.controller.listen(this.databaseKindElement, Mojo.Event.propertyChange, this.databaseKindChangedHandler);
	
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
	
	this.databaseSetsModel.choices = [];
	this.databaseSetsModel.value = "";
	this.databaseSetsModel.disabled = true;
	this.controller.modelChanged(this.databaseSetsModel);

	this.databaseKindsModel.choices = [];
	this.databaseKindsModel.value = "";
	this.databaseKindsModel.disabled = true;
	this.controller.modelChanged(this.databaseKindsModel);

    this.bodyElement.innerHTML = "";

	this.request = ImpostahService.listDatabaseSets(this.databaseSetsHandler);
	
};

DatabaseExploreAssistant.prototype.databaseSets = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (listDatabaseSets):</b><br>'+payload.errorText);
		return;
	}

	var oldSet = prefs.get().lastDatabaseSet;
	var newSet = false;

	if (payload.stdOut && payload.stdOut.length > 0)
	{
		payload.stdOut.sort();
		
		for (var a = 0; a < payload.stdOut.length; a++)
		{
			var id = payload.stdOut[a];
			var label = this.databaseSetLabels[payload.stdOut[a]];
			this.databaseSetsModel.choices.push({label:label, value:id});
			if (id == oldSet) {
				newSet = oldSet;
			}
		}
		
		if (newSet === false) {
			newSet = payload.stdOut[0];
		}
	}

	// Enable the drop-down list
	this.databaseSetsModel.disabled = false;
	this.databaseSetsModel.value = newSet;
	this.controller.modelChanged(this.databaseSetsModel);
	this.databaseSetChanged({value: newSet});
};

DatabaseExploreAssistant.prototype.databaseSetChanged = function(event)
{
	var cookie = new preferenceCookie();
	var tprefs = cookie.get();
	tprefs.lastDatabaseSet = event.value;
	cookie.put(tprefs);
	var tmp = prefs.get(true);
	
	this.setId = event.value;
    this.bodyElement.innerHTML = "";
	
	// Disable the query button
	this.queryButtonModel.disabled = true;
	this.controller.modelChanged(this.queryButtonModel);

	// Disable the database kinds list
	this.databaseKindsModel.choices = [];
	this.databaseKindsModel.value = "";
	this.databaseKindsModel.disabled = true;
	this.controller.modelChanged(this.databaseKindsModel);

	this.request = ImpostahService.listDatabases(this.databaseKindsHandler, event.value);
}

DatabaseExploreAssistant.prototype.databaseKinds = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (listDatabases):</b><br>'+payload.errorText);
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
			// %%% FIXME %%% Truncate if necessary
			var label = payload.stdOut[a];
			this.databaseKindsModel.choices.push({label:label, value:id});
			if (id == oldKind) {
				newKind = oldKind;
			}
		}
		
		if (newKind === false) {
			newKind = payload.stdOut[0];
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
    this.bodyElement.innerHTML = "";
	
	// Disable the query button
	this.queryButtonModel.disabled = true;
	this.controller.modelChanged(this.queryButtonModel);

	this.request = ImpostahService.getDatabase(this.databaseKindHandler, this.setId, this.kindId);
};

DatabaseExploreAssistant.prototype.databaseKind = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (getDatabase):</b><br>'+payload.errorText);
		return;
	}

	// no stage means its not a subscription, and we should have all the contents right now
	if (!payload.stage) {
		if (payload.contents) {
			this.rawData = payload.contents;
		}
	}
	else {
		if (payload.stage == 'start') {
			// at start we clear the old data to make sure its empty
			this.rawData = '';
			return;
		}
		else if (payload.stage == 'middle') {
			// in the middle, we append the data
			if (payload.contents) {
				this.rawData += payload.contents;
			}
			return;
		}
		else if (payload.stage == 'end') {
			// at end, we parse the data we've recieved this whole time
		}
	}

	try {
		var obj = JSON.parse(this.rawData.replace(/\/\*([^\*]*)\*\//g, ''));
		
		this.databaseId = obj.id;
		this.databaseOwner = obj.owner;

		// Enable the query button
		this.queryButtonModel.disabled = false;
		this.controller.modelChanged(this.queryButtonModel);
	}
	catch (e) {
		Mojo.Log.logException(e, 'DatabaseExplore#databaseKind');
		this.errorMessage('<b>Parsing Error (databaseKind):</b><br>'+e.message);
		return;
	}
};

DatabaseExploreAssistant.prototype.queryTap = function(event)
{
	var service = "com.palm.db";
	if (this.setId == "tempdb/kinds") {
		service = "com.palm.tempdb";
	}

	if (this.kindId && this.databaseOwner) {
		this.request = ImpostahService.impersonate(this.impersonateHandler,
												   this.databaseOwner,
												   service, "find", { "query" : { "from" : this.databaseId }});
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
