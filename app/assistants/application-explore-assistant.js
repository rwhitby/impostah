function ApplicationExploreAssistant()
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
	
	this.applicationSetsModel = {
		value: '',
		choices: [
	{value:'system',	  label:"System Installed"},
	{value:'user',		  label:"User Installed"}
				  ],
		disabled: false
	}
	this.setId = '';
	
	this.applicationKindsModel = {
		value: '',
		choices: [],
		disabled: true
	}
	this.applicationId = '';
	
	this.showButtonModel = {
		label: $L("Show"),
		disabled: true
	}

	this.applications = {};
};

ApplicationExploreAssistant.prototype.setup = function()
{
	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	// get elements
	this.iconElement = this.controller.get('icon');
	this.iconElement.style.display = 'none';
	this.spinnerElement = 		this.controller.get('spinner');
	this.applicationSetElement =	this.controller.get('applicationSet');
	this.applicationKindElement =	this.controller.get('applicationKind');
	this.showButton =			this.controller.get('showButton');
	
	// setup handlers
	this.iconTapHandler = this.iconTap.bindAsEventListener(this);
	this.applicationSetChangedHandler = this.applicationSetChanged.bindAsEventListener(this);
	this.applicationKindsHandler = this.applicationKinds.bindAsEventListener(this);
	this.applicationKindChangedHandler = this.applicationKindChanged.bindAsEventListener(this);
	this.showTapHandler =		this.showTap.bindAsEventListener(this);
	
	// setup wigets
	this.spinnerModel = {spinning: true};
	this.controller.setupWidget('spinner', {spinnerSize: 'small'}, this.spinnerModel);
	this.controller.listen(this.iconElement,  Mojo.Event.tap, this.iconTapHandler);
	this.controller.listen(this.spinnerElement,  Mojo.Event.tap, this.iconTapHandler);
	this.controller.setupWidget('applicationSet', {}, this.applicationSetsModel);
	this.controller.listen(this.applicationSetElement, Mojo.Event.propertyChange, this.applicationSetChangedHandler);
	this.controller.setupWidget('applicationKind', { multiline: true }, this.applicationKindsModel);
	this.controller.listen(this.applicationKindElement, Mojo.Event.propertyChange, this.applicationKindChangedHandler);
	this.controller.setupWidget('showButton', {}, this.showButtonModel);
	this.controller.listen(this.showButton,	 Mojo.Event.tap, this.showTapHandler);
	
	this.setId = prefs.get().lastApplicationSet;
	if (!this.setId || this.setId == '') {
		this.setId = this.applicationSetsModel.choices[0].value;
	}
	this.applicationSetsModel.value = this.setId;
	this.controller.modelChanged(this.applicationSetsModel);
	this.applicationSetChanged({value: this.setId});
};

ApplicationExploreAssistant.prototype.applicationSetChanged = function(event)
{
	var cookie = new preferenceCookie();
	var tprefs = cookie.get();
	tprefs.lastApplicationSet = event.value;
	cookie.put(tprefs);
	var tmp = prefs.get(true);
	
	this.setId = event.value;
	
	// Disable the show button
	this.showButtonModel.disabled = true;
	this.controller.modelChanged(this.showButtonModel);

	// Disable the application kinds list
	this.applicationKindsModel.choices = [];
	this.applicationKindsModel.value = "";
	this.applicationKindsModel.disabled = true;
	this.controller.modelChanged(this.applicationKindsModel);

	this.iconElement.style.display = 'none';
	this.spinnerModel.spinning = true;
	this.controller.modelChanged(this.spinnerModel);

	this.request = ImpostahService.impersonate(this.applicationKindsHandler, "com.palm.configurator",
											   "com.palm.applicationManager",
											   "listPackages", {});
};

ApplicationExploreAssistant.prototype.applicationKinds = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (applicationKinds):</b><br>'+payload.errorText);
		return;
	}

	var oldKind = prefs.get().lastApplicationKind;
	var newKind = false;

	this.applications = {};

	var packages = payload.packages;

	if (packages && packages.length > 0) {
		for (var a = 0; a < packages.length; a++) {
			var id = packages[a].id;
			var name = packages[a].loc_name;
			if (((this.setId == "system") && !packages[a].userInstalled) ||
				((this.setId == "user") && packages[a].userInstalled)) {
				this.applicationKindsModel.choices.push({label:name, value:id});
				this.applications[id] = packages[a];
				if (id == oldKind) {
					newKind = oldKind;
				}
			}
		}
		
		this.applicationKindsModel.choices.sort(function(a, b) {
				var aTitle = a.label.toLowerCase();
				var bTitle = b.label.toLowerCase();
				return ((aTitle < bTitle) ? -1 : ((aTitle > bTitle) ? 1 : 0));
			});

		if (newKind === false) {
			newKind = this.applicationKindsModel.choices[0].value;
		}
	}

	// Enable the drop-down list
	this.applicationKindsModel.disabled = false;
	this.applicationKindsModel.value = newKind;
	this.controller.modelChanged(this.applicationKindsModel);
	this.applicationKindChanged({value: newKind});

	this.iconElement.style.display = 'inline';
	this.spinnerModel.spinning = false;
	this.controller.modelChanged(this.spinnerModel);
};

ApplicationExploreAssistant.prototype.applicationKindChanged = function(event)
{
	var cookie = new preferenceCookie();
	var tprefs = cookie.get();
	tprefs.lastApplicationKind = event.value;
	cookie.put(tprefs);
	var tmp = prefs.get(true);
	
	this.applicationId = event.value;

	// Enable the show button
	this.showButtonModel.disabled = false;
	this.controller.modelChanged(this.showButtonModel);

};

ApplicationExploreAssistant.prototype.showTap = function(event)
{
	if (this.applicationId) {
		this.controller.stageController.pushScene("item", "Application Record", this.applications[this.applicationId]);
	}

};

ApplicationExploreAssistant.prototype.errorMessage = function(msg)
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

ApplicationExploreAssistant.prototype.iconTap = function(event)
{
	this.controller.stageController.popScene();
};

ApplicationExploreAssistant.prototype.handleCommand = function(event)
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

ApplicationExploreAssistant.prototype.cleanup = function(event)
{
	this.controller.stopListening(this.iconElement,  Mojo.Event.tap, this.iconTapHandler);
	this.controller.stopListening(this.spinnerElement,  Mojo.Event.tap, this.iconTapHandler);
	this.controller.stopListening(this.applicationSetElement, Mojo.Event.propertyChange, this.applicationSetChangedHandler);
	this.controller.stopListening(this.applicationKindElement, Mojo.Event.propertyChange, this.applicationKindChangedHandler);
	this.controller.stopListening(this.showButton,	Mojo.Event.tap, this.showTapHandler);
};

// Local Variables:
// tab-width: 4
// End:
