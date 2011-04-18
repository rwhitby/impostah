function OverridesAssistant(label, attributes, id)
{

	this.label = label;
	this.attributes = attributes;
	this.id = id;

	// setup menu
	this.menuModel = {
		visible: true,
		items: [
			{ label: $L("Load Overrides"), command: 'do-load' },
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

	this.overrides = {};

};

OverridesAssistant.prototype.setup = function()
{
	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	// get elements
	this.iconElement =			this.controller.get('icon');
	this.iconElement.style.display = 'none';
	this.spinnerElement = 		this.controller.get('spinner');
	this.titleElement = this.controller.get('title');
	this.newNameElement = this.controller.get('newName');
	this.newButtonElement = this.controller.get('newButton');
	this.overridesListElement = this.controller.get('overridesList');

	this.titleElement.innerHTML = this.label;

	// set this scene's default transition
	this.controller.setDefaultTransition(Mojo.Transition.zoomFade);
	
	this.newNameChangedHandler =  this.newNameChanged.bindAsEventListener(this);
	this.getOverridesHandler =  this.getOverrides.bindAsEventListener(this);
	this.delOverridesHandler =  this.delOverrides.bindAsEventListener(this);
	this.putOverridesHandler =  this.putOverrides.bindAsEventListener(this);

	// setup widgets
	this.spinnerModel = {spinning: true};
	this.controller.setupWidget('spinner', {spinnerSize: 'small'}, this.spinnerModel);
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
	this.controller.setupWidget(
		'newButton',
		{
			type: Mojo.Widget.activityButton
		},
		{
			buttonLabel: $L("Set Override"),
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
	this.controller.listen(this.overridesListElement, Mojo.Event.listDelete, this.overrideDeleted.bindAsEventListener(this));
	this.controller.listen(this.overridesListElement, Mojo.Event.listTap, this.overrideTapped.bindAsEventListener(this));
	
	
	// make it so nothing is selected by default
	this.controller.setInitialFocusedElement(null);
};

OverridesAssistant.prototype.activate = function()
{
	this.readOverrides();
};

OverridesAssistant.prototype.readOverrides = function()
{
	if (this.requestDb8) this.request.cancel();
	this.requestDb8 = new Mojo.Service.Request("palm://com.palm.db/", {
			method: "get",
			parameters: {
				"ids" : [this.id]
			},
			onSuccess: this.getOverridesHandler,
			onFailure: this.getOverridesHandler
		});

	this.updateSpinner();
};

OverridesAssistant.prototype.getOverrides = function(payload)
{
	if (this.requestDb8) this.requestDb8.cancel();
	this.requestDb8 = false;

	this.updateSpinner();

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (getOverrides):</b><br>'+payload.errorText);
		return;
	}

	if (payload.results && (payload.results.length == 1)) {
		this.overrides = payload.results[0];
		delete this.overrides["_rev"];
		delete this.overrides["_sync"];
	}
	else {
		this.overrides = {
			"_id":this.id,
			"_kind":"org.webosinternals.impostah:1"
		}
	}

	this.loadOverrides();
};

OverridesAssistant.prototype.setOverrides = function(overrides)
{
	this.overrides = overrides;
	this.saveOverrides();
};

OverridesAssistant.prototype.loadOverrides = function()
{
	var name = this.newNameModel.value;
	if (name) {
		if (name in this.overrides) {
			this.newValueModel.value = this.overrides[name];
		}
		else {
			this.newValueModel.value = this.attributes[name];
		}
		this.controller.modelChanged(this.newValueModel);
	}

	this.overridesModel.items = [];
	this.overridesListElement.mojo.invalidateItems(0);

	// Load the overrides using the same ordering as the attributes
	for (f in this.attributes) {
		if ((f in this.overrides) && (f.charAt(0) != '_')) {
			this.overridesModel.items.push({ label: f, title: this.overrides[f],
						labelClass: 'left', titleClass: 'right' });
		}
	}
			
	this.overridesListElement.mojo.noticeUpdatedItems(0, this.overridesModel.items);
};

OverridesAssistant.prototype.overrideTapped = function(event)
{
	this.newNameModel.value = event.item.label;
	this.controller.modelChanged(this.newNameModel);
	this.newValueModel.value = this.overrides[event.item.label];
	this.controller.modelChanged(this.newValueModel);
};

OverridesAssistant.prototype.overrideDeleted = function(event)
{
	delete this.overrides[event.item.label];
	this.saveOverrides();
};

OverridesAssistant.prototype.newNameChanged = function(event)
{
	this.newValueModel.value = this.attributes[event.value];
	this.controller.modelChanged(this.newValueModel);
};

OverridesAssistant.prototype.newOverrideButton = function()
{
	var name = this.newNameModel.value;
	var value = this.newValueModel.value;

	if (name != '') {
		this.overrides[name] = value;
	}

	var found = false;
	var newname = false;

	// Loop through the attributes, looking for the next one that does not have an override
	for (var f in this.attributes) {

		// If we found a match in the last iteration, check this attribute
		if (found) {
			// If we don't already have an override, it's the one we want
			if (!(f in this.overrides)) {
				found = false;
				newname = f;
			}
		}

		// If we find a match, do something on the next iteration
		if (name == f) {
			found = true;
		}
	}

	// If we wrapped around, look for the first attribute without an override
	if (found) {
		for (var f in this.attributes) {
			// If we don't already have an override, it's the one we want
			if (!(f in this.overrides)) {
				newname = f;
				break;
			}
		}
	}

	// If all attributes have an override, then just move to the next one
	if (!newname) {
		found = false;
		for (var f in this.attributes) {
			// If we found a match in the last iteration, use this attribute
			if (found) {
				found = false;
				newname = f;
			}
			
			// If we find a match, do something on the next iteration
			if (name == f) {
				found = true;
			}
		}
	}

	// Last resort is the first attribute
	if (!newname) {
		newname = this.newNameModel.choices[0].label;
	}

	this.newNameModel.value = newname;
	this.controller.modelChanged(this.newNameModel);
	if (newname in this.overrides) {
		this.newValueModel.value = this.overrides[newname];
	}
	else {
		this.newValueModel.value = this.attributes[newname];
	}
	this.controller.modelChanged(this.newValueModel);

	this.saveOverrides();
};

OverridesAssistant.prototype.saveOverrides = function()
{
	if (this.requestDb8) this.request.cancel();
	this.requestDb8 = new Mojo.Service.Request("palm://com.palm.db/", {
			method: "del",
			parameters: {
				"ids" : [this.id]
			},
			onSuccess: this.delOverridesHandler,
			onFailure: this.delOverridesHandler
		});

	this.updateSpinner();
};

OverridesAssistant.prototype.delOverrides = function(payload)
{
	if (this.requestDb8) this.requestDb8.cancel();
	this.requestDb8 = new Mojo.Service.Request("palm://com.palm.db/", {
			method: "put",
			parameters: {
				"objects" : [this.overrides]
			},
			onSuccess: this.putOverridesHandler,
			onFailure: this.putOverridesHandler
		});
	
	this.updateSpinner();
}

OverridesAssistant.prototype.putOverrides = function(payload)
{
	if (this.requestDb8) this.requestDb8.cancel();
	this.requestDb8 = false;

	this.updateSpinner();

	this.newButtonElement.mojo.deactivate();

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (putOverrides):</b><br>'+payload.errorText);
		return;
	}

	this.readOverrides();
}

OverridesAssistant.prototype.updateSpinner = function()
{
	if (this.requestDb8)  {
		this.iconElement.style.display = 'none';
		this.spinnerModel.spinning = true;
		this.controller.modelChanged(this.spinnerModel);
	}
	else {
		this.iconElement.style.display = 'inline';
		this.spinnerModel.spinning = false;
		this.controller.modelChanged(this.spinnerModel);
	}
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

OverridesAssistant.prototype.errorMessage = function(msg)
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

OverridesAssistant.prototype.handleCommand = function(event)
{
	if (event.type == Mojo.Event.command) {
		switch (event.command) {
		case 'do-load':
		this.controller.stageController.pushScene('json-load',{'callback':this.setOverrides.bind(this)});
		break;

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
	this.controller.stopListening(this.overridesListElement, Mojo.Event.listDelete, this.overrideDeleted.bindAsEventListener(this));
	this.controller.stopListening(this.overridesListElement, Mojo.Event.listTap, this.overrideTapped.bindAsEventListener(this));
};

// Local Variables:
// tab-width: 4
// End:
