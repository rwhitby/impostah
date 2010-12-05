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
	this.queryButton =		this.controller.get('queryButton');
	
	// setup handlers
    this.dbKindsHandler = this.dbKinds.bindAsEventListener(this);
    this.queryTapHandler = this.queryTap.bindAsEventListener(this);
	
	this.request = ImpostahService.getDbKinds(this.dbKindsHandler);
	
};

Db8exploreAssistant.prototype.dbKinds = function(payload)
{
	alert('===============');
	for (var p in payload) alert(p+': '+payload[p]);
};

Db8exploreAssistant.prototype.queryTap = function(event)
{
	this.controller.stageController.pushScene('get-log', {filter: this.filterModel.value, custom: this.customTextElement.mojo.getValue()});
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
