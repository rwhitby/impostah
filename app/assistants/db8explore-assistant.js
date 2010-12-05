function Db8ExploreAssistant()
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

Db8ExploreAssistant.prototype.setup = function()
{
	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	// get elements
	this.queryButton =		this.controller.get('queryButton');
	
	// setup handlers
    this.dbKindsHandler = this.dbKinds.bindAsEventListener(this);
    this.queryTapHandler = this.queryTap.bindAsEventListener(this);
	
	this.request = ImpostahService.getDbKinds(this.dbKindsHandler);
	
};

Db8ExploreAssistant.prototype.dbKinds = function(payload)
{
	alert('===============');
	for (var p in payload) alert(p+': '+payload[p]);
};

Db8ExploreAssistant.prototype.queryTap = function(event)
{
	this.controller.stageController.pushScene('get-log', {filter: this.filterModel.value, custom: this.customTextElement.mojo.getValue()});
};

Db8ExploreAssistant.prototype.activate = function(event)
{
	
	if (this.firstActivate)
	{
	}
	else
	{
		
	}
	this.firstActivate = true;
};
Db8ExploreAssistant.prototype.deactivate = function(event)
{
};

Db8ExploreAssistant.prototype.handleCommand = function(event)
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

Db8ExploreAssistant.prototype.cleanup = function(event)
{
};

// Local Variables:
// tab-width: 4
// End:
