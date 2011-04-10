function OverridesAssistant(label, attributes, group)
{

	this.label = label;
	this.attributes = attributes;
	this.group = group;

	// setup menu
	this.menuModel = {
		visible: true,
		items: [
			{ label: $L("Preferences"), command: 'do-prefs' },
			{ label: $L("Help"), command: 'do-help' }
		]
	};

	this.newNameModel = { choices: [] };
	for (var f in this.attributes) {
		this.newNameModel.choices.push({"label":f, "value":f});
	}
	this.newNameModel.value = this.newNameModel.choices[0].label;

	this.newValueModel = { };
	this.newValueModel.value = this.attributes[this.newNameModel.value];

	this.newEnableModel = { value: true }

	this.overrides = [];
};

OverridesAssistant.prototype.setup = function()
{
	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	// get elements
	this.titleElement = this.controller.get('title');
	this.newNameElement = this.controller.get('newName');
	this.newButtonElement = this.controller.get('newButton');
	this.overridesListElement = this.controller.get('overridesList');

	this.titleElement.innerHTML = this.label;

	// set this scene's default transition
	this.controller.setDefaultTransition(Mojo.Transition.zoomFade);
	
	this.newNameChangedHandler =  this.newNameChanged.bindAsEventListener(this);

	// setup new feed form
	this.controller.setupWidget('newName', { label: "Attribute" }, this.newNameModel);
	this.controller.listen(this.newNameElement, Mojo.Event.propertyChange, this.newNameChangedHandler);
	this.controller.setupWidget('newValue', {
			autoFocus: false,
				focus: false,
				multiline: false,
				enterSubmits: false,
				textCase: Mojo.Widget.steModeLowerCase
				},
		this.newValueModel);
	this.controller.setupWidget('newEnable', { trueLabel:  $L("Yes"), falseLabel: $L("No"), }, this.newEnableModel);
	this.controller.setupWidget(
		'newButton',
		{
			type: Mojo.Widget.activityButton
		},
		{
			buttonLabel: $L("Add Override"),
			buttonClass: 'palm-button'
		}
	);
	this.controller.listen(this.newButtonElement, Mojo.Event.tap, this.newOverrideButton.bindAsEventListener(this));

	
	// setup list widget
	this.overridesModel = { items: [] };
	this.controller.setupWidget
	(
		'overridesList',
		{
			itemTemplate: "overrides/rowTemplate",
			swipeToDelete: true,
			reorderable: false
		},
		this.overridesModel
	);
	this.controller.listen(this.overridesListElement, Mojo.Event.propertyChanged, this.overrideToggled.bindAsEventListener(this));
	this.controller.listen(this.overridesListElement, Mojo.Event.listDelete, this.overrideDeleted.bindAsEventListener(this));
	this.controller.listen(this.overridesListElement, Mojo.Event.listTap, this.overrideTapped.bindAsEventListener(this));
	
	
	// make it so nothing is selected by default
	this.controller.setInitialFocusedElement(null);

	this.loadOverrides();

};

OverridesAssistant.prototype.loadOverrides = function()
{
	if (this.overrides.length > 0) {
		this.overridesModel.items = [];
		this.overridesListElement.mojo.invalidateItems(0);
		
		for (var f = 0; f < this.overrides.length; f++) {
			var attribute = this.overrides[f].name;
			var override = this.overrides[f].value;
				
			this.overridesModel.items.push
				({
					toggleName: f,
						attribute: attribute,
						override: override,
						
						// these are for the child toggle widget
						//disabled: true, // comment this for go time
						value: this.overrides[f].enabled
						});
		}
			
		this.overridesListElement.mojo.noticeUpdatedItems(0, this.overridesModel.items);
	}
};

OverridesAssistant.prototype.overrideTapped = function(event)
{
	alert('---');
	alert(event.item.toggleName);
	for (var f in this.overrides[event.item.toggleName]) alert(f+': '+this.overrides[event.item.toggleName][f]);
	alert('---');
};

OverridesAssistant.prototype.overrideToggled = function(event)
{
	// make sure this is a toggle button
	if (event.property == 'value' && event.target.id.include('_toggle')) {
		var toggleName = event.target.id.replace(/_toggle/, '');
		this.overrides[toggleName].enabled = event.value
		alert(this.overrides[toggleName].name + ' - ' + this.overrides[toggleName].enabled);
	}
};
OverridesAssistant.prototype.overrideDeleted = function(event)
{
	alert('---');
	alert(this.overrides[event.index].name + ' - deleted');
	this.overrides.splice(event.index, 1);
	this.loadOverrides();
};

OverridesAssistant.prototype.newNameChanged = function(event)
{
	// Disable the database kinds list
	this.newValueModel.value = this.attributes[event.value];
	this.controller.modelChanged(this.newValueModel);
};

OverridesAssistant.prototype.newOverrideButton = function()
{
	var name = this.newNameModel.value;
	var value = this.newValueModel.value;
	var enabled = this.newEnableModel.value;

	if (name != '') {
		var found = false;
		for (var f = 0; f < this.overrides.length; f++) {
			if (this.overrides[f].name == name) {
				found = true;
				this.overrides[f].value = value;
				this.overrides[f].enabled = enabled;
			}
		}
		if (!found) {
			this.overrides.push({"name":name,"value":value,"enabled":enabled});
		}
	}

	this.loadOverrides();
	
	this.newButtonElement.mojo.deactivate();
};

OverridesAssistant.prototype.alertMessage = function(title, message)
{
	this.controller.showAlertDialog({
	    onChoose: function(value) {},
		allowHTMLMessage: true,
	    title: title,
	    message: message,
	    choices:[{label:$L("Ok"), value:""}]
    });
};

OverridesAssistant.prototype.handleCommand = function(event)
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

OverridesAssistant.prototype.cleanup = function(event) {
	this.controller.stopListening(this.newNameElement, Mojo.Event.propertyChange, this.newNameChangedHandler);
	this.controller.stopListening(this.newButtonElement, Mojo.Event.tap, this.newOverrideButton.bindAsEventListener(this));
	this.controller.stopListening(this.overridesListElement, Mojo.Event.propertyChanged, this.overrideToggled.bindAsEventListener(this));
	this.controller.stopListening(this.overridesListElement, Mojo.Event.listDelete, this.overrideDeleted.bindAsEventListener(this));
	this.controller.stopListening(this.overridesListElement, Mojo.Event.listTap, this.overrideTapped.bindAsEventListener(this));
};

// Local Variables:
// tab-width: 4
// End:
