function ActivityExploreAssistant()
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
	
	this.activitySetsModel =
	{
		value: prefs.get().lastActivitySet,
		choices: [],
		multiline: true,
		disabled: true
	}
	this.setId = '';
	
	this.activityKindsModel =
	{
		value: prefs.get().lastActivityKind,
		choices: [],
		multiline: true,
		disabled: true
	}
	
};

ActivityExploreAssistant.prototype.setup = function()
{
	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	// get elements
	this.activitySetElement =	this.controller.get('activitySet');
	this.activityKindElement =	this.controller.get('activityKind');
	this.showButton =			this.controller.get('showButton');
	this.bodyElement =			this.controller.get('body');
	
	// setup handlers
    this.activitySetsHandler = 	this.activitySets.bindAsEventListener(this);
    this.activityKindsHandler = this.activityKinds.bindAsEventListener(this);
    this.activityKindHandler = 	this.activityKind.bindAsEventListener(this);
	this.activitySetChangedHandler = this.activitySetChanged.bindAsEventListener(this);
	this.activityKindChangedHandler = this.activityKindChanged.bindAsEventListener(this);
    this.showTapHandler = 		this.showTap.bindAsEventListener(this);
	
	this.controller.setupWidget
	(
		'activitySet',
		{},
		this.activitySetsModel
	);
	
	this.controller.listen(this.activitySetElement, Mojo.Event.propertyChange, this.activitySetChangedHandler);
	
	this.controller.setupWidget
	(
		'activityKind',
		{},
		this.activityKindsModel
	);
	
	this.controller.listen(this.activityKindElement, Mojo.Event.propertyChange, this.activityKindChangedHandler);

	this.controller.setupWidget
	(
		'showButton',
		{},
		this.showButtonModel =
		{
			buttonLabel: $L("Show"),
			disabled: true
		}
	);
	
	this.controller.listen(this.showButton,  Mojo.Event.tap, this.showTapHandler);
	
	this.activitySetsModel.choices = [];
	this.activityKindsModel.choices = [];
    this.bodyElement.innerHTML = "";

	this.request = ImpostahService.listActivitySets(this.activitySetsHandler);
	
};

ActivityExploreAssistant.prototype.activitySets = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (listActivitySets):</b><br>'+payload.errorText);
		return;
	}

	var oldSet = prefs.get().lastActivitySet;
	var newSet = false;

	if (payload.stdOut && payload.stdOut.length > 0)
	{
		payload.stdOut.sort();
		
		for (var a = 0; a < payload.stdOut.length; a++)
		{
			var id = payload.stdOut[a];
			this.activitySetsModel.choices.push({label:id, value:id});
			if (id == oldSet) {
				newSet = oldSet;
			}
		}
		
		if (newSet === false) {
			newSet = payload.stdOut[0];
		}

		this.controller.modelChanged(this.activitySetsModel);
	}

	// Enable the drop-down list
	this.activitySetsModel.disabled = false;
	this.activitySetsModel.value = newSet;
	this.controller.modelChanged(this.activitySetsModel);
	this.activitySetChanged({value: newSet});
};

ActivityExploreAssistant.prototype.activitySetChanged = function(event)
{
	var cookie = new preferenceCookie();
	var tprefs = cookie.get();
	tprefs.lastActivitySet = event.value;
	cookie.put(tprefs);
	var tmp = prefs.get(true);
	
	this.setId = event.value;
    this.bodyElement.innerHTML = "";
	
	// Disable the show button
	this.showButtonModel.disabled = true;
	this.controller.modelChanged(this.showButtonModel);

	// Disable the activity kinds list
	this.activityKindsModel.choices = [];
	this.activityKindsModel.value = "";
	this.activityKindsModel.disabled = true;
	this.controller.modelChanged(this.activityKindsModel);

	this.request = ImpostahService.listActivities(this.activityKindsHandler, event.value);
}

ActivityExploreAssistant.prototype.activityKinds = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (listActivities):</b><br>'+payload.errorText);
		return;
	}

	var oldKind = prefs.get().lastActivityKind;
	var newKind = false;

	if (payload.stdOut && payload.stdOut.length > 0)
	{
		payload.stdOut.sort();
		
		for (var a = 0; a < payload.stdOut.length; a++)
		{
			var id = payload.stdOut[a];
			this.activityKindsModel.choices.push({label:id, value:id});
			if (id == oldKind) {
				newKind = oldKind;
			}
		}
		
		if (newKind === false) {
			newKind = payload.stdOut[0];
		}

		this.controller.modelChanged(this.activityKindsModel);
	}

	// Enable the drop-down list
	this.activityKindsModel.disabled = false;
	this.activityKindsModel.value = newKind;
	this.controller.modelChanged(this.activityKindsModel);
	this.activityKindChanged({value: newKind});
};

ActivityExploreAssistant.prototype.activityKindChanged = function(event)
{
	var cookie = new preferenceCookie();
	var tprefs = cookie.get();
	tprefs.lastActivityKind = event.value;
	cookie.put(tprefs);
	var tmp = prefs.get(true);
	
	this.kindId = event.value;
    this.bodyElement.innerHTML = "";

	// Enable the show button
	this.showButtonModel.disabled = false;
	this.controller.modelChanged(this.showButtonModel);
}

ActivityExploreAssistant.prototype.showTap = function(event)
{
	this.request = ImpostahService.getActivity(this.activityKindHandler, this.setId, this.kindId);
};

ActivityExploreAssistant.prototype.activityKind = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (getActivity):</b><br>'+payload.errorText);
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
		var obj = JSON.parse(this.rawData);
		
		this.bodyElement.innerHTML = this.rawData;

	}
	catch (e) {
		Mojo.Log.logException(e, 'ActivityExplore#activity');
		this.errorMessage('<b>Parsing Error (activity):</b><br>'+e.message);
		return;
	}
};

ActivityExploreAssistant.prototype.activate = function(event)
{
	
	if (this.firstActivate)
	{
	}
	else
	{
		
	}
	this.firstActivate = true;
};
ActivityExploreAssistant.prototype.deactivate = function(event)
{
};

ActivityExploreAssistant.prototype.errorMessage = function(msg)
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
ActivityExploreAssistant.prototype.handleCommand = function(event)
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

ActivityExploreAssistant.prototype.cleanup = function(event)
{
};

// Local Variables:
// tab-width: 4
// End:
