function DeviceExploreAssistant()
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
	
};

DeviceExploreAssistant.prototype.setup = function()
{
	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	// get elements
	this.iconElement =			this.controller.get('icon');
	this.iconElement.style.display = 'none';
	this.spinnerElement = 		this.controller.get('spinner');
	
	// setup handlers
	this.deviceKindHandler =	this.deviceKind.bindAsEventListener(this);
	
	// setup wigets
	this.spinnerModel = {spinning: true};
	this.controller.setupWidget('spinner', {spinnerSize: 'small'}, this.spinnerModel);
	
	this.request = ImpostahService.impersonate(this.deviceKindHandler, "com.palm.configurator",
											   "com.palm.deviceprofile",
											   "getDeviceProfile", {});
};

DeviceExploreAssistant.prototype.deviceKind = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (deviceKind):</b><br>'+payload.errorText);
		return;
	}

	this.iconElement.style.display = 'inline';
	this.spinnerModel.spinning = false;
	this.controller.modelChanged(this.spinnerModel);

	this.controller.stageController.swapScene("item", "Device Profile", payload.deviceInfo);
};

DeviceExploreAssistant.prototype.errorMessage = function(msg)
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

DeviceExploreAssistant.prototype.handleCommand = function(event)
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

DeviceExploreAssistant.prototype.cleanup = function(event)
{
};

// Local Variables:
// tab-width: 4
// End:
