function BackupExploreAssistant()
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
	
	this.backupKindsModel =
	{
		value: prefs.get().lastBackupKind,
		choices: [],
		disabled: true
	}
	this.kindId = '';
	
};

BackupExploreAssistant.prototype.setup = function()
{
	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	// get elements
	this.backupKindElement =		this.controller.get('backupKind');
	this.showButton =			this.controller.get('showButton');
	this.bodyElement =			this.controller.get('body');
	
	// setup handlers
    this.backupKindsHandler = 		this.backupKinds.bindAsEventListener(this);
    this.backupKindHandler = 		this.backupKind.bindAsEventListener(this);
	this.backupKindChangedHandler = this.backupKindChanged.bindAsEventListener(this);
    this.showTapHandler = 		this.showTap.bindAsEventListener(this);
	
	this.controller.setupWidget
	(
		'backupKind',
		{ multiline: true },
		this.backupKindsModel
	);
	
	this.controller.listen(this.backupKindElement, Mojo.Event.propertyChange, this.backupKindChangedHandler);
	
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
	
	this.backupKindsModel.choices = [];
	this.backupKindsModel.value = "";
	this.backupKindsModel.disabled = true;
	this.controller.modelChanged(this.backupKindsModel);

    this.bodyElement.innerHTML = "";

	this.request = ImpostahService.listBackups(this.backupKindsHandler, false);
	
};

BackupExploreAssistant.prototype.backupKinds = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (listBackups):</b><br>'+payload.errorText);
		return;
	}

	var oldKind = prefs.get().lastBackupKind;
	var newKind = false;

	if (payload.stdOut && payload.stdOut.length > 0)
	{
		payload.stdOut.sort();
		
		for (var a = 0; a < payload.stdOut.length; a++)
		{
			var id = payload.stdOut[a];
			var label = payload.stdOut[a];
			if (label.indexOf("com.palm.") == 0) {
				label = label.slice(9);
			}
			this.backupKindsModel.choices.push({label:label, value:id});
			if (id == oldKind) {
				newKind = oldKind;
			}
		}
		
		if (newKind === false) {
			newKind = payload.stdOut[0];
		}
	}

	// Enable the drop-down list
	this.backupKindsModel.disabled = false;
	this.backupKindsModel.value = newKind;
	this.controller.modelChanged(this.backupKindsModel);
	this.backupKindChanged({value: newKind});
};

BackupExploreAssistant.prototype.backupKindChanged = function(event)
{
	var cookie = new preferenceCookie();
	var tprefs = cookie.get();
	tprefs.lastBackupKind = event.value;
	cookie.put(tprefs);
	var tmp = prefs.get(true);
	
	this.kindId = '';
    this.bodyElement.innerHTML = "";
	
	this.request = ImpostahService.getBackup(this.backupKindHandler, event.value);
}

BackupExploreAssistant.prototype.backupKind = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (getBackup):</b><br>'+payload.errorText);
		this.rawData = '';
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
		
		this.kindId = obj.id;

		// Enable the show button
		this.showButtonModel.disabled = false;
		this.controller.modelChanged(this.showButtonModel);
	}
	catch (e) {
		Mojo.Log.logException(e, 'BackupExplore#backupKind');
		this.errorMessage('<b>Parsing Error (backupKind):</b><br>'+e.message);
		return;
	}
};

BackupExploreAssistant.prototype.showTap = function(event)
{
    this.bodyElement.innerHTML = this.rawData;
};

BackupExploreAssistant.prototype.activate = function(event)
{
	
	if (this.firstActivate)
	{
	}
	else
	{
		
	}
	this.firstActivate = true;
};
BackupExploreAssistant.prototype.deactivate = function(event)
{
};

BackupExploreAssistant.prototype.errorMessage = function(msg)
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
BackupExploreAssistant.prototype.handleCommand = function(event)
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

BackupExploreAssistant.prototype.cleanup = function(event)
{
};

// Local Variables:
// tab-width: 4
// End:
