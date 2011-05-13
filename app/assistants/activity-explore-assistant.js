function ActivityExploreAssistant()
{
	// setup menu
	this.menuModel = {
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
	
	this.activitySetsModel = {
		value: '',
		choices: [
	{value:"app-persist",	  label:"Application Persistent"},
	{value:"app-temp",		  label:"Application Temporary"},
	{value:"service-persist", label:"Service Persistent"},
	{value:"service-temp",	  label:"Service Temporary"}
				  ],
		disabled: false
	}
	this.setId = '';
	
	this.activityKindsModel = {
		value: '',
		choices: [],
		disabled: true
	}
	this.activityId = '';
	
	this.showButtonModel = {
		label: $L("Show"),
		disabled: true
	}

};

ActivityExploreAssistant.prototype.setup = function()
{
	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	// get elements
	this.iconElement =			this.controller.get('icon');
	this.iconElement.style.display = 'none';
	this.spinnerElement = 		this.controller.get('spinner');
	this.activitySetElement =	this.controller.get('activitySet');
	this.activityKindElement =	this.controller.get('activityKind');
	this.showButton =			this.controller.get('showButton');
	
	// setup handlers
	this.iconTapHandler = this.iconTap.bindAsEventListener(this);
	this.activitySetChangedHandler = this.activitySetChanged.bindAsEventListener(this);
	this.activityKindsHandler = this.activityKinds.bindAsEventListener(this);
	this.activityKindChangedHandler = this.activityKindChanged.bindAsEventListener(this);
	this.showTapHandler =		this.showTap.bindAsEventListener(this);
	this.activityKindHandler =	this.activityKind.bindAsEventListener(this);
	
	// setup wigets
	this.spinnerModel = {spinning: true};
	this.controller.setupWidget('spinner', {spinnerSize: 'small'}, this.spinnerModel);
	this.controller.listen(this.iconElement,  Mojo.Event.tap, this.iconTapHandler);
	this.controller.listen(this.spinnerElement,  Mojo.Event.tap, this.iconTapHandler);
	this.controller.setupWidget('activitySet', {}, this.activitySetsModel);
	this.controller.listen(this.activitySetElement, Mojo.Event.propertyChange, this.activitySetChangedHandler);
	this.controller.setupWidget('activityKind', { multiline: true }, this.activityKindsModel);
	this.controller.listen(this.activityKindElement, Mojo.Event.propertyChange, this.activityKindChangedHandler);
	this.controller.setupWidget('showButton', {}, this.showButtonModel);
	this.controller.listen(this.showButton,	 Mojo.Event.tap, this.showTapHandler);
	
	this.setId = prefs.get().lastActivitySet;
	if (!this.setId || this.setId == '') {
		this.setId = this.activitySetsModel.choices[0].value;
	}
	this.activitySetsModel.value = this.setId;
	this.controller.modelChanged(this.activitySetsModel);
	this.activitySetChanged({value: this.setId});
};

ActivityExploreAssistant.prototype.activitySetChanged = function(event)
{
	var cookie = new preferenceCookie();
	var tprefs = cookie.get();
	tprefs.lastActivitySet = event.value;
	cookie.put(tprefs);
	var tmp = prefs.get(true);
	
	this.setId = event.value;
	
	// Disable the show button
	this.showButtonModel.disabled = true;
	this.controller.modelChanged(this.showButtonModel);

	// Disable the activity kinds list
	this.activityKindsModel.choices = [];
	this.activityKindsModel.value = "";
	this.activityKindsModel.disabled = true;
	this.controller.modelChanged(this.activityKindsModel);

	this.iconElement.style.display = 'none';
	this.spinnerModel.spinning = true;
	this.controller.modelChanged(this.spinnerModel);

	this.request = ImpostahService.impersonate(this.activityKindsHandler, "com.palm.configurator",
											   "com.palm.activitymanager",
											   "list", {"details":true});
};

ActivityExploreAssistant.prototype.activityKinds = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (activityKinds):</b><br>'+payload.errorText);
		return;
	}

	var oldKind = prefs.get().lastActivityKind;
	var newKind = false;

	var activities = payload.activities;

	if (activities && activities.length > 0) {
		for (var a = 0; a < activities.length; a++) {
			var id = activities[a].activityId;
			var name = activities[a].name;
			var creatorObj = activities[a].creator;
			var typeObj = activities[a].type;
			var creator = false;
			if (creatorObj.appId) {
				creator = creatorObj.appId;
			}
			if (creatorObj.serviceId) {
				creator = creatorObj.serviceId;
			}
			if (creator &&
				((this.setId == "app-persist")	   && typeObj.persist && creatorObj.appId) ||
				((this.setId == "app-temp")		  && !typeObj.persist && creatorObj.appId) ||
				((this.setId == "service-persist") && typeObj.persist && creatorObj.serviceId) ||
				((this.setId == "service-temp")	  && !typeObj.persist && creatorObj.serviceId)) {
				if (creator.indexOf("com.palm.") == 0) {
					creator = creator.slice(9);
				}
				this.activityKindsModel.choices.push({label:creator+" : "+name, value:id});
				if (id == oldKind) {
					newKind = oldKind;
				}
			}
		}
		
		if (newKind === false) {
			newKind = this.activityKindsModel.choices[0].value;
		}
	}

	// Enable the drop-down list
	this.activityKindsModel.disabled = false;
	this.activityKindsModel.value = newKind;
	this.controller.modelChanged(this.activityKindsModel);
	this.activityKindChanged({value: newKind});

	this.iconElement.style.display = 'inline';
	this.spinnerModel.spinning = false;
	this.controller.modelChanged(this.spinnerModel);
};

ActivityExploreAssistant.prototype.activityKindChanged = function(event)
{
	var cookie = new preferenceCookie();
	var tprefs = cookie.get();
	tprefs.lastActivityKind = event.value;
	cookie.put(tprefs);
	var tmp = prefs.get(true);
	
	this.activityId = event.value;

	// Enable the show button
	this.showButtonModel.disabled = false;
	this.controller.modelChanged(this.showButtonModel);

};

ActivityExploreAssistant.prototype.showTap = function(event)
{
	if (this.activityId) {

		this.iconElement.style.display = 'none';
		this.spinnerModel.spinning = true;
		this.controller.modelChanged(this.spinnerModel);

		this.request = ImpostahService.impersonate(this.activityKindHandler, "com.palm.configurator",
												   "com.palm.activitymanager",
												   "getDetails", { "activityId" : this.activityId });
	}
};

ActivityExploreAssistant.prototype.activityKind = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (activityKind):</b><br>'+payload.errorText);
		return;
	}

	this.iconElement.style.display = 'inline';
	this.spinnerModel.spinning = false;
	this.controller.modelChanged(this.spinnerModel);

	if (payload.activity) {
		this.controller.stageController.pushScene("item", "Activity Record", payload.activity,
												  payload.activity.name, false);
	}

};

ActivityExploreAssistant.prototype.errorMessage = function(msg)
{
	this.controller.showAlertDialog({
			allowHTMLMessage:	true,
			preventCancel:		true,
			title:				'Impostah',
			message:			msg,
			choices:			[{label:$L("Ok"), value:'ok'}],
			onChoose:			function(e){}
		});
};

ActivityExploreAssistant.prototype.iconTap = function(event)
{
	this.controller.stageController.popScene();
};

ActivityExploreAssistant.prototype.handleCommand = function(event)
{
	if (event.type == Mojo.Event.command) {
		switch (event.command) {
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
	this.controller.stopListening(this.iconElement,  Mojo.Event.tap, this.iconTapHandler);
	this.controller.stopListening(this.spinnerElement,  Mojo.Event.tap, this.iconTapHandler);
	this.controller.stopListening(this.activitySetElement, Mojo.Event.propertyChange, this.activitySetChangedHandler);
	this.controller.stopListening(this.activityKindElement, Mojo.Event.propertyChange, this.activityKindChangedHandler);
	this.controller.stopListening(this.showButton,	Mojo.Event.tap, this.showTapHandler);
};

// Local Variables:
// tab-width: 4
// End:
