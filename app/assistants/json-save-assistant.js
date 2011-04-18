function JsonSaveAssistant(params)
{
	this.filename = params.filename;
	this.object = params.object;
	
	// setup menu
	this.menuModel = {
		visible: true,
		items: [
			{ label: $L("Preferences"), command: 'do-prefs' },
			{ label: $L("Help"), command: 'do-help' }
		]
	};

	this.rawData = "";
};

JsonSaveAssistant.prototype.setup = function()
{

	this.controller.get('install-title').innerHTML = $L("Save JSON File");
	this.controller.get('group-title').innerHTML = $L("File");

	// set theme because this can be the first scene pushed
	this.controller.document.body.className = prefs.get().theme;
	
	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	// setup spinner widget
	this.spinnerModel = {spinning: false};
	this.controller.setupWidget('spinner', {spinnerSize: 'large'}, this.spinnerModel);
	
	
	this.fileElement =			this.controller.get('file');
	this.browseButtonElement =	this.controller.get('browseButton');
	this.viewButtonElement =	this.controller.get('viewButton');
	this.saveButtonElement =	this.controller.get('saveButton');
	
	this.textChanged =			this.textChanged.bindAsEventListener(this);
	this.browseButtonPressed =	this.browseButtonPressed.bindAsEventListener(this);
	this.viewButtonPressed =	this.viewButtonPressed.bindAsEventListener(this);
	this.saveButtonPressed =	this.saveButtonPressed.bindAsEventListener(this);
	
	
	this.controller.setupWidget
	(
		'file',
		{
			hintText: $L('http:// or file:// or ftp://'),
			multiline: true,
			enterSubmits: false,
			changeOnKeyPress: true,
			textCase: Mojo.Widget.steModeLowerCase,
			focusMode: Mojo.Widget.focusSelectMode
		},
		{
			value: (this.file ? this.file : '')
		}
	);
	
	this.controller.setupWidget
	(
		'browseButton',
		{
			type: Mojo.Widget.activityButton
		},
		{
			buttonLabel: $L('Browse')
		}
	);
	
	this.controller.setupWidget
	(
		'viewButton',
		{
			type: Mojo.Widget.activityButton
		},
		{
			buttonLabel: $L('View')
		}
	);
	
	this.controller.setupWidget
	(
		'saveButton',
		{
			type: Mojo.Widget.activityButton
		},
		this.saveButtonModel = {
			buttonLabel: $L('Save'),
			disabled: (this.file ? false : true)
		}
	);
	
	Mojo.Event.listen(this.fileElement, Mojo.Event.propertyChange, this.textChanged);
	Mojo.Event.listen(this.browseButtonElement, Mojo.Event.tap, this.browseButtonPressed);
	Mojo.Event.listen(this.viewButtonElement, Mojo.Event.tap, this.viewButtonPressed);
	Mojo.Event.listen(this.saveButtonElement, Mojo.Event.tap, this.saveButtonPressed);
	
};

JsonSaveAssistant.prototype.textChanged = function(event)
{
	if (event.value != '') {
		this.saveButtonModel.disabled = false;
		this.controller.modelChanged(this.saveButtonModel);
	}
	else {
		this.saveButtonModel.disabled = true;
		this.controller.modelChanged(this.saveButtonModel);
	}
};

JsonSaveAssistant.prototype.updateText = function(value)
{
	this.fileElement.mojo.setValue(value);
};

JsonSaveAssistant.prototype.browseButtonPressed = function(event)
{
	var f = new filePicker({
		type: 'folder',
		onSelect: this.browsed.bind(this)
	});
};

JsonSaveAssistant.prototype.browsed = function(value)
{
	if (value === false) {
	}
	else {
		this.fileElement.mojo.setValue('file://'+value);
	}
	this.browseButtonElement.mojo.deactivate();
}

JsonSaveAssistant.prototype.viewButtonPressed = function(event)
{
	this.controller.stageController.pushScene("item", "JSON File", this.object);
	this.viewButtonElement.mojo.deactivate();
};

JsonSaveAssistant.prototype.saveButtonPressed = function(event)
{
	var url = this.fileElement.mojo.getValue();
	var filename = filePicker.getFileName(url);
	// %%% Load the file here %%%
};

JsonSaveAssistant.prototype.errorMessage = function(msg)
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

JsonSaveAssistant.prototype.handleCommand = function(event)
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

JsonSaveAssistant.prototype.cleanup = function(event)
{
};

// Local Variables:
// tab-width: 4
// End:


