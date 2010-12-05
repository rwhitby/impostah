function Db8exploreAssistant()
{
	// setup list model
	this.mainModel = {items:[]};
	
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
	this.filterContainer =		this.controller.get('filterContainer');
	this.filterElement =		this.controller.get('filter');
	this.queryButton =		this.controller.get('queryButton');
	
	// setup handlers
    this.dbKindsHandler = this.dbKinds.bindAsEventListener(this);
    this.queryTapHandler = this.queryTap.bindAsEventListener(this);
	
	this.request = ImpostahService.listDbKinds(this.dbKindsHandler);
	
	this.controller.setupWidget
	(
		'filter',
		{},
		this.filterModel =
		{
			value: prefs.get().lastLog,
			choices: 
			[
			]
		}
	);
	
	// this.controller.listen(this.filterElement, Mojo.Event.propertyChange, this.dbKindChangedHandler);
	
};

Db8exploreAssistant.prototype.dbKinds = function(payload)
{
	alert('===============');
	for (var p in payload) alert(p+': '+payload[p]);

	if (payload.stdOut && payload.stdOut.length > 0)
	{
		this.filterModel.choices = [];
		
		payload.stdOut.sort();
		
		for (var a = 0; a < payload.stdOut.length; a++)
		{
			this.filterModel.choices.push({label:payload.stdOut[a], value:payload.stdOut[a]});
		}
		
		this.controller.modelChanged(this.filterModel);
	}
	else if (payload.returnValue === false)
	{
		this.errorMessage('<b>Service Error (listDbKinds):</b><br>'+payload.errorText);
	}
};

Db8exploreAssistant.prototype.queryTap = function(event)
{
	this.controller.stageController.pushScene('view-json', {filter: this.filterModel.value, custom: this.customTextElement.mojo.getValue()});
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
