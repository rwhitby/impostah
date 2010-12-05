function Db8exploreAssistant()
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
	
	this.dbKindsModel =
	{
		value: prefs.get().lastKind,
		choices: []
	}
	this.kindId = '';
	
	this.dbPermsModel =
	{
		value: prefs.get().lastPerm,
		choices: []
	}
	
};

Db8exploreAssistant.prototype.setup = function()
{
	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	// get elements
	this.dbKindElement =		this.controller.get('dbKind');
	this.queryButton =			this.controller.get('queryButton');
	
	// setup handlers
    this.dbKindsHandler = 		this.dbKinds.bindAsEventListener(this);
    this.dbKindHandler = 		this.dbKind.bindAsEventListener(this);
    this.dbPermsHandler = 		this.dbPerms.bindAsEventListener(this);
    this.dbPermHandler = 		this.dbPerm.bindAsEventListener(this);
	this.dbKindChangedHandler = this.dbKindChanged.bindAsEventListener(this);
    this.queryTapHandler = 		this.queryTap.bindAsEventListener(this);
    this.impersonateHandler = 	this.impersonate.bindAsEventListener(this);
	
	this.controller.setupWidget
	(
		'dbKind',
		{},
		this.dbKindsModel
	);
	this.dbKindChanged({value: prefs.get().lastKind});
	
	this.controller.listen(this.dbKindElement, Mojo.Event.propertyChange, this.dbKindChangedHandler);
	
	
	this.controller.setupWidget
	(
		'dbPerm',
		{},
		this.dbPermsModel
	);
	
	//this.controller.listen(this.dbKindElement, Mojo.Event.propertyChange, this.dbKindChangedHandler);
	
	
	this.controller.setupWidget
	(
		'queryButton',
		{},
		this.dbusButtonModel =
		{
			buttonLabel: $L("Query"),
			disabled: false
		}
	);
	
	this.controller.listen(this.queryButton,  Mojo.Event.tap, this.queryTapHandler);
	
	
	this.request = ImpostahService.listDbKinds(this.dbKindsHandler);
	
	
};

Db8exploreAssistant.prototype.dbKinds = function(payload)
{
	if (payload.stdOut && payload.stdOut.length > 0)
	{
		this.dbKindsModel.choices = [];
		
		payload.stdOut.sort();
		
		for (var a = 0; a < payload.stdOut.length; a++)
		{
			this.dbKindsModel.choices.push({label:payload.stdOut[a], value:payload.stdOut[a]});
		}
		
		this.controller.modelChanged(this.dbKindsModel);
	}
	else if (payload.returnValue === false)
	{
		this.errorMessage('<b>Service Error (listDbKinds):</b><br>'+payload.errorText);
	}
};

Db8exploreAssistant.prototype.dbKindChanged = function(event)
{
	var cookie = new preferenceCookie();
	var tprefs = cookie.get();
	tprefs.lastKind = event.value;
	cookie.put(tprefs);
	var tmp = prefs.get(true);
	
	this.kindId = '';
	
	this.request = ImpostahService.listDbPerms(this.dbPermsHandler, event.value);
	this.request = ImpostahService.getDbKind(this.dbKindHandler, event.value);
}

Db8exploreAssistant.prototype.dbKind = function(payload)
{
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
		var obj = JSON.parse(this.rawData);
		
		this.dbPermsModel.value = obj.owner;
		this.kindId = obj.id;
		this.controller.modelChanged(this.dbPermsModel);
	}
	catch (e) {
		Mojo.Log.logException(e, 'Db8explore#dbKind');
	}
};


Db8exploreAssistant.prototype.dbPerms = function(payload)
{
	if (payload.stdOut && payload.stdOut.length > 0)
	{
		this.dbPermsModel.choices = [];
		
		payload.stdOut.sort();
		
		for (var a = 0; a < payload.stdOut.length; a++)
		{
			this.dbPermsModel.choices.push({label:payload.stdOut[a], value:payload.stdOut[a]});
		}
		
		this.controller.modelChanged(this.dbPermsModel);
	}
	else if (payload.returnValue === false)
	{
		this.errorMessage('<b>Service Error (listDbPerms):</b><br>'+payload.errorText);
	}
};

Db8exploreAssistant.prototype.dbPerm = function(payload)
{
	Mojo.Log.error('==============');
	for (var p in payload) Mojo.Log.error(p, ': ', payload[p]);
};

Db8exploreAssistant.prototype.queryTap = function(event)
{
	if (this.kindId && this.dbPermsModel.value)
	{
		//this.controller.stageController.pushScene('view-json', {kind: this.dbKindsModel.value});
		this.request = ImpostahService.impersonate(this.impersonateHandler, this.dbPermsModel.value, this.kindId);
	}
};
Db8exploreAssistant.prototype.impersonate = function(payload)
{
	Mojo.Log.error('==============');
	for (var p in payload) Mojo.Log.error(p, ': ', payload[p]);
};

Db8exploreAssistant.prototype.activate = function(event)
{
	
	if (this.firstActivate)
	{
	}
	else
	{
		
	}
	this.firstActivate = true;
};
Db8exploreAssistant.prototype.deactivate = function(event)
{
};

Db8exploreAssistant.prototype.errorMessage = function(msg)
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
Db8exploreAssistant.prototype.handleCommand = function(event)
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

Db8exploreAssistant.prototype.cleanup = function(event)
{
};

// Local Variables:
// tab-width: 4
// End:
