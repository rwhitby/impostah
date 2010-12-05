function MainAssistant()
{
	// subtitle random list
	this.randomSub = 
	[
		{weight: 30, text: $L('This app is not what you think it is')}
	];
	
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

MainAssistant.prototype.setup = function()
{
	
	// set theme because this can be the first scene pushed
	this.controller.document.body.className = prefs.get().theme;
	
	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	// get elements
	this.iconElement =		this.controller.get('icon');
	this.titleElement =		this.controller.get('main-title');
	this.versionElement =	this.controller.get('version');
	this.subTitleElement =	this.controller.get('subTitle');
	this.queryButton =		this.controller.get('queryButton');
	
	// set version string random subtitle
	this.titleElement.innerHTML = Mojo.Controller.appInfo.title;
	this.versionElement.innerHTML = "v" + Mojo.Controller.appInfo.version;
	this.subTitleElement.innerHTML = this.getRandomSubTitle();
	
	// setup handlers
    this.dbKindsHandler = this.dbKinds.bindAsEventListener(this);
    this.queryTapHandler = this.queryTap.bindAsEventListener(this);
	
	this.reqeust = ImpostahService.getDbKinds(this.dbKindsHandler);
	
};

MainAssistant.prototype.dbKinds = function(payload)
{
	alert('===============');
	for (var p in payload) alert(p+': '+payload[p]);
};

MainAssistant.prototype.queryTap = function(event)
{
	this.controller.stageController.pushScene('get-log', {filter: this.filterModel.value, custom: this.customTextElement.mojo.getValue()});
};

MainAssistant.prototype.activate = function(event)
{
	
	if (this.firstActivate)
	{
	}
	else
	{
		
	}
	this.firstActivate = true;
};
MainAssistant.prototype.deactivate = function(event)
{
};

MainAssistant.prototype.getRandomSubTitle = function()
{
	// loop to get total weight value
	var weight = 0;
	for (var r = 0; r < this.randomSub.length; r++)
	{
		weight += this.randomSub[r].weight;
	}
	
	// random weighted value
	var rand = Math.floor(Math.random() * weight);
	//alert('rand: ' + rand + ' of ' + weight);
	
	// loop through to find the random title
	for (var r = 0; r < this.randomSub.length; r++)
	{
		if (rand <= this.randomSub[r].weight)
		{
			return this.randomSub[r].text;
		}
		else
		{
			rand -= this.randomSub[r].weight;
		}
	}
	
	// if no random title was found (for whatever reason, wtf?) return first and best subtitle
	return this.randomSub[0].text;
};

MainAssistant.prototype.handleCommand = function(event)
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

MainAssistant.prototype.cleanup = function(event)
{
};

// Local Variables:
// tab-width: 4
// End:
