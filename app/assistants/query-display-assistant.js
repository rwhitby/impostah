function QueryDisplayAssistant(owner, service, database) {
	this.owner = owner;
	this.service = service;
	this.database = database;

	this.results = 0;

	this.request = false;
	this.requestSize = 10;

	// setup header model
	this.headerModel = {value: 0};
	
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

QueryDisplayAssistant.prototype.setup = function() {

	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	// get elements
	this.listElement = this.controller.get('mainList');

    // handlers
    this.listTapHandler = this.listTap.bindAsEventListener(this);
    this.impersonateHandler = this.impersonate.bindAsEventListener(this);
	
    // setup widget
    this.controller.setupWidget('header', {title: this.database}, this.headerModel);
    this.controller.setupWidget('mainList', {
			itemTemplate: "query-display/rowTemplate", swipeToDelete: false, reorderable: false }, this.mainModel);
    this.controller.listen(this.listElement, Mojo.Event.listTap, this.listTapHandler);

};

QueryDisplayAssistant.prototype.activate = function(event) {

	this.query = {
		"from" : this.database,
		"limit" : this.requestSize
	};

	if (this.request) this.request.cancel();
	this.request = ImpostahService.impersonate(this.impersonateHandler, this.owner, this.service,
											   "find", { "query" : this.query, "count" : true });

};

QueryDisplayAssistant.prototype.impersonate = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (impersonate):</b><br>'+payload.errorText);
		return;
	}

	if (payload.results && payload.results.length > 0) {

		for (var a = 0; a < payload.results.length; a++) {
			this.mainModel.items[this.results] = {};
			this.mainModel.items[this.results].name  = payload.results[a]._id;
			this.mainModel.items[this.results].value = payload.results[a];
			this.mainModel.items[this.results].text  = JSON.stringify(payload.results[a]);
			this.results++;
		}
		this.controller.modelChanged(this.mainModel);

		if (payload.count > this.requestSize) {

			this.headerModel.value = (this.results / (this.results + payload.count - payload.results.length));
			this.controller.modelChanged(this.headerModel);

			if (this.request) this.request.cancel();
			this.request = ImpostahService.impersonate(this.impersonateHandler, this.owner, this.service,
													   "find", {
														   "count" : true,
														   "query" : {
															   "from" : this.database,
															   "limit" : this.requestSize,
															   "page" : payload.next
														   }
													   });
		}
		else {

			this.headerModel.value = 1;
			this.controller.modelChanged(this.headerModel);

			if (this.request) this.request.cancel();
			this.request = false;
		}
	}

	// Mojo.Log.error('==============');
	// for (var p in payload) Mojo.Log.error(p, ': ', payload[p]);
};

QueryDisplayAssistant.prototype.listTap = function(event)
{
	this.controller.stageController.pushScene("item-display", event.item.label, event.item.value);
};

QueryDisplayAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

QueryDisplayAssistant.prototype.errorMessage = function(msg)
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

QueryDisplayAssistant.prototype.handleCommand = function(event)
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

QueryDisplayAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};

// Local Variables:
// tab-width: 4
// End:
