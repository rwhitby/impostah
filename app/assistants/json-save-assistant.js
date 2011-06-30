function JsonSaveAssistant(params)
{
	this.object = params.object;
	this.filename = params.filename;
	if (this.filename) {
		this.file = "file:///media/internal/"+params.filename;
	}
	this.callback = params.callback;
	
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
	var deviceTheme = '';
	if (Mojo.Environment.DeviceInfo.modelNameAscii == 'Pixi' ||
		Mojo.Environment.DeviceInfo.modelNameAscii == 'Veer')
		deviceTheme += ' small-device';
	if (Mojo.Environment.DeviceInfo.modelNameAscii == 'TouchPad' ||
		Mojo.Environment.DeviceInfo.modelNameAscii == 'Emulator')
		deviceTheme += ' no-gesture';
	this.controller.document.body.className = prefs.get().theme + deviceTheme;
	
	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	this.iconElement =			this.controller.get('icon');
	this.spinnerElement = 		this.controller.get('spinner');

	this.fileElement =			this.controller.get('file');
	this.browseButtonElement =	this.controller.get('browseButton');
	this.viewButtonElement =	this.controller.get('viewButton');
	this.saveButtonElement =	this.controller.get('saveButton');
	
	this.iconTapHandler =		this.iconTap.bindAsEventListener(this);
	this.textChanged =			this.textChanged.bindAsEventListener(this);
	this.browseButtonPressed =	this.browseButtonPressed.bindAsEventListener(this);
	this.viewButtonPressed =	this.viewButtonPressed.bindAsEventListener(this);
	this.saveButtonPressed =	this.saveButtonPressed.bindAsEventListener(this);
	
	// setup spinner widget
	this.spinnerModel = {spinning: false};
	this.controller.setupWidget('spinner', {spinnerSize: 'large'}, this.spinnerModel);
	
	this.controller.listen(this.iconElement,  Mojo.Event.tap, this.iconTapHandler);
	this.controller.listen(this.spinnerElement,  Mojo.Event.tap, this.iconTapHandler);
	
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
		this.fileElement.mojo.setValue('file://'+value+this.filename);
	}
	this.browseButtonElement.mojo.deactivate();
}

JsonSaveAssistant.prototype.viewButtonPressed = function(event)
{
	this.controller.stageController.pushScene("item", "JSON File", this.object, 'save', false);
	this.viewButtonElement.mojo.deactivate();
};

JsonSaveAssistant.prototype.saveButtonPressed = function(event)
{
	var filename = this.fileElement.mojo.getValue();
	this.subscription = ImpostahService.putFile(this.saveResponse.bindAsEventListener(this),
												this.object, filename);
};

JsonSaveAssistant.prototype.saveResponse = function(payload)
{
	this.saveButtonElement.mojo.deactivate();
	if (payload.returnValue == false) {
		this.errorMessage('<b>Service Error (saveResponse):</b><br>'+payload.errorText);
		if (this.callback) {
			this.callback(false);
		}
	}
	else {
		if (this.callback) {
			this.callback(true);
		}
		this.controller.stageController.popScene();
	}
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

JsonSaveAssistant.prototype.iconTap = function(event)
{
	this.controller.stageController.popScene();
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
	this.controller.stopListening(this.iconElement,  Mojo.Event.tap,
								  this.iconTapHandler);
	this.controller.stopListening(this.spinnerElement,  Mojo.Event.tap,
								  this.iconTapHandler);
};

// Local Variables:
// tab-width: 4
// End:


