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
	this.dbKindChangedHandler = this.dbKindChanged.bindAsEventListener(this);
    this.queryTapHandler = 		this.queryTap.bindAsEventListener(this);
	
	this.controller.setupWidget
	(
		'dbKind',
		{},
		this.dbKindsModel =
		{
			value: prefs.get().lastKind,
			choices: []
		}
	);
	
	this.controller.listen(this.dbKindElement, Mojo.Event.propertyChange, this.dbKindChangedHandler);
	
	
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
	
	
}

Db8exploreAssistant.prototype.queryTap = function(event)
{
	//this.controller.stageController.pushScene('view-json', {kind: this.dbKindsModel.value});
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
