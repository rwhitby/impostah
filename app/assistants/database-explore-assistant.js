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
		choices: [
	{value:"com.palm.db",     label:"Persistent"},
	{value:"com.palm.tempdb", label:"Temporary"}
				  ],
		disabled: false
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

	this.request = false;
	this.requestSize = 50;
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
	this.databaseSetChangedHandler = this.databaseSetChanged.bindAsEventListener(this);
    this.databaseKindsHandler = this.databaseKinds.bindAsEventListener(this);
    this.databaseKindHandler = 	this.databaseKind.bindAsEventListener(this);
	this.databaseKindChangedHandler = this.databaseKindChanged.bindAsEventListener(this);
    this.queryTapHandler = 		this.queryTap.bindAsEventListener(this);
    this.impersonateHandler = 	this.impersonate.bindAsEventListener(this);
	
	this.controller.setupWidget
	(
		'databaseSet', {},
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
		{
			type: Mojo.Widget.activityButton
		},
		this.queryButtonModel =
		{
			label: $L("Query"),
			disabled: true
		}
	);
	
	this.controller.listen(this.queryButton,  Mojo.Event.tap, this.queryTapHandler);
	
	this.databaseKindsModel.choices = [];
	this.databaseKindsModel.value = "";
	this.databaseKindsModel.disabled = true;
	this.controller.modelChanged(this.databaseKindsModel);

	this.queryButtonModel.label = $L("Query");
	this.controller.modelChanged(this.queryButtonModel);
    this.bodyElement.innerHTML = "";

	this.setId = prefs.get().lastDatabaseSet;
	if (this.setId == '') {
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

	this.queryButtonModel.label = $L("Query");
	this.controller.modelChanged(this.queryButtonModel);
    this.bodyElement.innerHTML = "";
	
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
}

DatabaseExploreAssistant.prototype.databaseKinds = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (databaseKinds):</b><br>'+payload.errorText);
		return;
	}

	var oldKind = prefs.get().lastDatabaseKind;
	var newKind = false;

	var databases = payload.results;

	if (databases && databases.length > 0)
	{
		for (var a = 0; a < databases.length; a++)
		{
			var id = databases[a].id;
			var label = databases[a].id;
			if (label.indexOf("com.palm.") == 0) {
				label = label.slice(9);
			}
			this.databaseKindsModel.choices.push({label:label, value:id});
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

	this.queryButtonModel.label = $L("Query");
	this.controller.modelChanged(this.queryButtonModel);
    this.bodyElement.innerHTML = "";
	
	// Disable the query button
	this.queryButtonModel.disabled = true;
	this.controller.modelChanged(this.queryButtonModel);

	if (this.request) this.request.cancel();
	this.request = ImpostahService.impersonate(this.databaseKindHandler, "com.palm.configurator", this.setId,
											   "find", {
												   "query" : {
													   "select" : [ "id", "owner" ],
													   "from" : "Kind:1",
													   "where" : [{
															   "prop" : "id",
															   "op" : "=",
															   "val" : this.kindId
														   }]
												   }
											   });
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
	if (this.kindId && this.databaseOwner) {

		this.results = 0;

		this.queryButtonModel.label = $L("Query")+" 0/0";
		this.controller.modelChanged(this.queryButtonModel);
		this.bodyElement.innerHTML = "";
		
		if (this.request) this.request.cancel();
		this.request = ImpostahService.impersonate(this.impersonateHandler, this.databaseOwner, this.setId,
												   "find", {
													   "count" : true,
													   "query" : {
														   "from" : this.databaseId,
														   "limit" : this.requestSize
													   }
												   });
	}
};

DatabaseExploreAssistant.prototype.impersonate = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (impersonate):</b><br>'+payload.errorText);
		return;
	}

	if (payload.results) {

		this.bodyElement.innerHTML += JSON.stringify(payload.results);

		this.results += payload.results.length;

		if (payload.count > this.requestSize) {

			this.queryButtonModel.label = $L("Query")+" "+this.results+"/"+(this.results +
																				  payload.count -
																				  payload.results.length);
			this.controller.modelChanged(this.queryButtonModel);

			if (this.request) this.request.cancel();
			this.request = ImpostahService.impersonate(this.impersonateHandler, this.databaseOwner, this.setId,
													   "find", {
														   "count" : true,
														   "query" : {
															   "from" : this.databaseId,
															   "limit" : this.requestSize,
															   "page" : payload.next
														   }
													   });
		}
		else {

			this.queryButtonModel.label = $L("Query")+" "+this.results+"/"+this.results;
			this.controller.modelChanged(this.queryButtonModel);

			if (this.request) this.request.cancel();
			this.request = false;
			// stop button spinner xD
			this.queryButton.mojo.deactivate();
		}
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
	// cancel the last request
	if (this.request) this.request.cancel();
};

// Local Variables:
// tab-width: 4
// End:
