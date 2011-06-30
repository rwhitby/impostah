function JsonLoadAssistant(params)
{
	this.file = params.file;
	this.id = params.id;
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

JsonLoadAssistant.prototype.setup = function()
{

	this.controller.get('install-title').innerHTML = $L("Load JSON File");
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
	this.loadButtonElement =	this.controller.get('loadButton');
	
	this.iconTapHandler =		this.iconTap.bindAsEventListener(this);
	this.textChanged =			this.textChanged.bindAsEventListener(this);
	this.browseButtonPressed =	this.browseButtonPressed.bindAsEventListener(this);
	this.viewButtonPressed =	this.viewButtonPressed.bindAsEventListener(this);
	this.loadButtonPressed =	this.loadButtonPressed.bindAsEventListener(this);
	
	
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
		this.viewButtonModel = {
			buttonLabel: $L('View'),
			disabled: (this.file ? false : true)
		}
	);
	
	this.controller.setupWidget
	(
		'loadButton',
		{
			type: Mojo.Widget.activityButton
		},
		this.loadButtonModel = {
			buttonLabel: $L('Load'),
			disabled: (this.file ? false : true)
		}
	);
	
	Mojo.Event.listen(this.fileElement, Mojo.Event.propertyChange, this.textChanged);
	Mojo.Event.listen(this.browseButtonElement, Mojo.Event.tap, this.browseButtonPressed);
	Mojo.Event.listen(this.viewButtonElement, Mojo.Event.tap, this.viewButtonPressed);
	Mojo.Event.listen(this.loadButtonElement, Mojo.Event.tap, this.loadButtonPressed);
	
};

JsonLoadAssistant.prototype.textChanged = function(event)
{
	if (event.value != '') {
		this.loadButtonModel.disabled = false;
		this.viewButtonModel.disabled = false;
		this.controller.modelChanged(this.loadButtonModel);
		this.controller.modelChanged(this.viewButtonModel);
	}
	else {
		this.loadButtonModel.disabled = true;
		this.viewButtonModel.disabled = true;
		this.controller.modelChanged(this.loadButtonModel);
		this.controller.modelChanged(this.viewButtonModel);
	}
};

JsonLoadAssistant.prototype.updateText = function(value)
{
	this.fileElement.mojo.setValue(value);
};

JsonLoadAssistant.prototype.browseButtonPressed = function(event)
{
	var f = new filePicker({
		type: 'file',
		extensions: ['json'],
		onSelect: this.browsed.bind(this)
	});
};

JsonLoadAssistant.prototype.browsed = function(value)
{
	if (value === false) {
	}
	else {
		this.fileElement.mojo.setValue('file://'+value);
	}
	this.browseButtonElement.mojo.deactivate();
}

JsonLoadAssistant.prototype.viewButtonPressed = function(event)
{
	var url = this.fileElement.mojo.getValue();
	var filename =	filePicker.getFileName(url);

	this.subscription = ImpostahService.getFile(this.fileResponse.bindAsEventListener(this, false), url, filename);
};

JsonLoadAssistant.prototype.loadButtonPressed = function(event)
{
	var url = this.fileElement.mojo.getValue();
	var filename = filePicker.getFileName(url);

	this.subscription = ImpostahService.getFile(this.fileResponse.bindAsEventListener(this, true), url, filename);
};

JsonLoadAssistant.prototype.fileResponse = function(payload, isLoad)
{
	if (payload.returnValue == false) {
		this.errorMessage('<b>Service Error (fileResponse):</b><br>'+payload.errorText);
		this.browseButtonElement.mojo.deactivate();
	}
	else {
		if (payload.stage == 'start') {
			// at start we clear the old data to make sure its empty
			this.rawData = '';
		}
		else if (payload.stage == 'middle') {
			// in the middle, we append the data
			if (payload.contents) {
				this.rawData += payload.contents;
			}
		}
		else if (payload.stage == 'end') {
			// at end, we parse the data we've received this whole time
			var object = {};
			if (this.rawData != '') {
				// parse json to object
				try {
					object = JSON.parse(this.rawData.replace(/\\'/g, "'")); //'"));
				}
				catch (e) {
					Mojo.Log.logException(e, 'fileResponse#parse: ' + this.rawData);
				}
			}
			if (isLoad) {
				this.loadButtonElement.mojo.deactivate();
			}
			else {
				this.viewButtonElement.mojo.deactivate();
			}
			if (isLoad) {
				if (this.id) {
					if ((object["_id"] != this.id) ||
						(object["_kind"] != "org.webosinternals.impostah:1")) {
						this.errorMessage("Invalid file contents");
						return;
					}
				}
				if (this.callback) {
					this.callback(object);
				}
				this.controller.stageController.popScene();
			}
			else {
				this.controller.stageController.pushScene("item", "JSON File", object, 'load', false);
			}
		}
	}
};

JsonLoadAssistant.prototype.errorMessage = function(msg)
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

JsonLoadAssistant.prototype.iconTap = function(event)
{
	this.controller.stageController.popScene();
};

JsonLoadAssistant.prototype.handleCommand = function(event)
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

JsonLoadAssistant.prototype.cleanup = function(event)
{
	this.controller.stopListening(this.iconElement,  Mojo.Event.tap,
								  this.iconTapHandler);
	this.controller.stopListening(this.spinnerElement,  Mojo.Event.tap,
								  this.iconTapHandler);
};

// Local Variables:
// tab-width: 4
// End:


