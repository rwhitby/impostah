function SystemPreferencesAssistant()
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
    
    this.systemPreferencesButtonModel = {
		label: $L("Show System Preferences"),
		disabled: true
    };
    
    this.manageOverridesButtonModel = {
		label: $L("System Preference Overrides"),
		disabled: true
	};
	
    this.systemPreferences = false;
    this.reloadSystemPreferences = false;
	
    this.requestPalmService = false;
};

SystemPreferencesAssistant.prototype.setup = function()
{
    // setup menu
    this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
    // get elements
    this.overlay = this.controller.get('overlay'); this.overlay.hide();
    this.spinnerElement = this.controller.get('spinner');
    this.systemPreferencesButton = this.controller.get('systemPreferencesButton');
    this.manageOverridesButton = this.controller.get('manageOverridesButton');
	
    // setup back tap
    this.backElement = this.controller.get('icon');
    this.backTapHandler = this.backTap.bindAsEventListener(this);
    this.controller.listen(this.backElement,  Mojo.Event.tap, this.backTapHandler);
	
    // setup handlers
    this.systemPreferencesTapHandler = this.systemPreferencesTap.bindAsEventListener(this);
    this.manageOverridesTapHandler = this.manageOverridesTap.bindAsEventListener(this);
	
    // setup widgets
	this.spinnerModel = {spinning: true};
	this.controller.setupWidget('spinner', {spinnerSize: 'large'}, this.spinnerModel);
	this.controller.setupWidget('systemPreferencesButton', { }, this.systemPreferencesButtonModel);
	this.controller.listen(this.systemPreferencesButton,  Mojo.Event.tap, this.systemPreferencesTapHandler);
	this.controller.setupWidget('manageOverridesButton', { }, this.manageOverridesButtonModel);
	this.controller.listen(this.manageOverridesButton,  Mojo.Event.tap, this.manageOverridesTapHandler);
};

SystemPreferencesAssistant.prototype.activate = function()
{
	this.deviceProfile = false;
	this.updateSpinner(true);
	SystemPreferences.getSystemPreferences(this.getSystemPreferences.bind(this), this.reloadSystemPreferences);
};

SystemPreferencesAssistant.prototype.dirtySystemPreferences = function()
{
	this.reloadSystemPreferences = true;
};

SystemPreferencesAssistant.prototype.getSystemPreferences = function(returnValue, systemPreferences, errorText)
{
	this.updateSpinner(false);

	if (returnValue === false) {
		this.errorMessage('<b>Service Error (getSystemPreferences):</b><br>'+errorText);
		return;
	}

	this.systemPreferences = systemPreferences;
	this.reloadSystemPreferences = false;

	if (this.systemPreferences) {
		this.systemPreferencesButtonModel.disabled = false;
		this.controller.modelChanged(this.systemPreferencesButtonModel);
		this.manageOverridesButtonModel.disabled = false;
		this.controller.modelChanged(this.manageOverridesButtonModel);
	}
}

SystemPreferencesAssistant.prototype.systemPreferencesTap = function(event)
{
	if (this.systemPreferences) {
		this.controller.stageController.pushScene("item", "System Preferences", this.systemPreferences,
												  'com.palm.systempreferences', false);
	}
};

SystemPreferencesAssistant.prototype.manageOverridesTap = function(event)
{
	if (this.systemPreferences) {
		var attributes = this.systemPreferences;
		this.controller.stageController.pushScene("overrides", "System Preference Overrides", attributes,
												  "org.webosinternals.impostah.systempreferences",
												  this.dirtySystemPreferences.bind(this));
	}
};

SystemPreferencesAssistant.prototype.updateSpinner = function(active)
{
	if (active) {
		this.spinnerModel.spinning = true;
		this.controller.modelChanged(this.spinnerModel);
		this.overlay.show();
	}
	else {
		this.spinnerModel.spinning = false;
		this.controller.modelChanged(this.spinnerModel);
		this.overlay.hide();
	}
};

SystemPreferencesAssistant.prototype.errorMessage = function(msg)
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

SystemPreferencesAssistant.prototype.backTap = function(event)
{
	this.controller.stageController.popScene();
};

SystemPreferencesAssistant.prototype.handleCommand = function(event)
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

SystemPreferencesAssistant.prototype.cleanup = function(event)
{
	this.controller.stopListening(this.backElement,  Mojo.Event.tap,
								  this.backTapHandler);
	this.controller.stopListening(this.systemPreferencesButton,  Mojo.Event.tap,
								  this.systemPreferencesTapHandler);
	this.controller.stopListening(this.manageOverridesButton,  Mojo.Event.tap,
								  this.manageOverridesTapHandler);
};

// Local Variables:
// tab-width: 4
// End:
