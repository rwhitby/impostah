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
	this.titleElement = this.controller.get('title');
	this.listElement = this.controller.get('mainList');

	this.titleElement.innerHTML = this.label;

    // handlers
    this.listTapHandler = this.listTap.bindAsEventListener(this);
	
	for (i in this.item)
	{
		switch (typeof this.item[i])
		{
			case 'string':
			case 'number':
			case 'boolean':
				this.mainModel.items.push({label: i, title: this.item[i]});
				break;
				
			case 'object':
				if (Object.isArray(this.item[i]))
				{
					this.mainModel.items.push({label: i, title: '[...]', item: this.item[i]});
				}
				else
				{
					this.mainModel.items.push({label: i, title: '{...}', item: this.item[i]});
				}
				break;
				
			case 'function':
				this.mainModel.items.push({label: i, title: 'Function () {...}'});
				break;
				
			default:
				this.mainModel.items.push({label: i, title: '*'+(typeof this.item[i])+' needs handler - '+this.item[i]});
				break;
		}
	}

    // setup widgets
    this.controller.setupWidget('mainList', {
			itemTemplate: "item/rowTemplate", swipeToDelete: false, reorderable: false }, this.mainModel);
    this.controller.listen(this.listElement, Mojo.Event.listTap, this.listTapHandler);

};

ItemAssistant.prototype.listTap = function(event)
{
	if (event.item.item) this.controller.stageController.pushScene("item", this.label+' - '+event.item.label, event.item.item);
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
