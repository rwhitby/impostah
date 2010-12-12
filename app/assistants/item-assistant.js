function ItemAssistant(label, item) {

	this.label = label;
	this.item = item;

	// setup list model
	this.mainModel = {items:[]};
	
	// setup menu
	this.menuModel = {
		visible: true,
		items: [
	{ label: $L("Preferences"),
	  command: 'do-prefs' },
	{ label: $L("Help"),
	  command: 'do-help' }
				]
	};

}

ItemAssistant.prototype.setup = function() {

	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	// get elements
	this.headerElement = this.controller.get('header');
	this.listElement = this.controller.get('mainList');

	this.headerElement.innerHTML = this.label;

    // handlers
    this.listTapHandler = this.listTap.bindAsEventListener(this);
	
	this.mainModel.items[0] = {};
	this.mainModel.items[0].label = JSON.stringify(this.item);

    // setup widget
    this.controller.setupWidget('mainList', {
			itemTemplate: "item/rowTemplate", swipeToDelete: false, reorderable: false }, this.mainModel);
    this.controller.listen(this.listElement, Mojo.Event.listTap, this.listTapHandler);
	
	this.controller.setupWidget('spinner', {spinnerSize: 'small'}, {spinning: true});

};

ItemAssistant.prototype.listTap = function(event)
{
	// Do something here
};

ItemAssistant.prototype.errorMessage = function(msg)
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
};

ItemAssistant.prototype.handleCommand = function(event)
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

ItemAssistant.prototype.cleanup = function(event) {
    this.controller.stopListening(this.listElement, Mojo.Event.listTap, this.listTapHandler);
};

// Local Variables:
// tab-width: 4
// End:
