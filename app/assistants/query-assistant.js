function QueryAssistant(owner, service, database, labelfunc) {
	this.owner = owner;
	this.service = service;
	this.database = database;
	this.labelfunc = labelfunc;

	this.results = 0;

	this.request = false;
	this.requestSize = 50;

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

QueryAssistant.prototype.setup = function() {

	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	// get elements
	this.titleElement = this.controller.get('title');
	this.titleElement.innerHTML = this.database;
	this.iconElement = this.controller.get('icon');
	this.iconElement.style.display = 'none';
	this.spinnerElement = this.controller.get('spinner');
	this.listElement = this.controller.get('mainList');

    // handlers
	this.iconTapHandler = this.iconTap.bindAsEventListener(this);
    this.listTapHandler = this.listTap.bindAsEventListener(this);
    this.impersonateHandler = this.impersonate.bindAsEventListener(this);
	
    // setup widgets
	this.spinnerModel = {spinning: true};
	this.controller.setupWidget('spinner', {spinnerSize: 'small'}, this.spinnerModel);
	this.controller.listen(this.iconElement,  Mojo.Event.tap, this.iconTapHandler);
	this.controller.listen(this.spinnerElement,  Mojo.Event.tap, this.iconTapHandler);
    this.controller.setupWidget('mainList', {
			itemTemplate: "query/rowTemplate", swipeToDelete: false, reorderable: false }, this.mainModel);
    this.controller.listen(this.listElement, Mojo.Event.listTap, this.listTapHandler);

	this.query = {
		"from" : this.database,
		"limit" : this.requestSize
	};

	if (this.request) this.request.cancel();
	this.request = ImpostahService.impersonate(this.impersonateHandler, this.owner, this.service,
											   "find", { "query" : this.query, "count" : true });

};

QueryAssistant.prototype.impersonate = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (impersonate):</b><br>'+payload.errorText);
		return;
	}

	if (payload.results) {

		for (var a = 0; a < payload.results.length; a++) {
			this.mainModel.items[this.results] = {};
			this.mainModel.items[this.results].id    = payload.results[a]._id;
			this.mainModel.items[this.results].value = payload.results[a];
			this.mainModel.items[this.results].label = payload.results[a]._id;
			if (this.labelfunc) {
				try {
					this.mainModel.items[this.results].label = this.labelfunc(payload.results[a]);
				} catch (e) { }
			}
				
			this.results++;
		}
		this.controller.modelChanged(this.mainModel);

		var total = this.results + payload.count - payload.results.length;

		if (this.results < total) {

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
			if (this.request) this.request.cancel();
			this.request = false;

			this.iconElement.style.display = 'inline';
			this.spinnerModel.spinning = false;
			this.controller.modelChanged(this.spinnerModel);
		}
	}

	// Mojo.Log.error('==============');
	// for (var p in payload) Mojo.Log.error(p, ': ', payload[p]);
};

QueryAssistant.prototype.listTap = function(event)
{
	this.controller.stageController.pushScene("item", "Database Record", event.item.value);
};

QueryAssistant.prototype.errorMessage = function(msg)
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

QueryAssistant.prototype.iconTap = function(event)
{
	this.controller.stageController.popScene();
};

QueryAssistant.prototype.handleCommand = function(event)
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

QueryAssistant.prototype.cleanup = function(event) {
	this.controller.stopListening(this.iconElement,  Mojo.Event.tap, this.iconTapHandler);
	this.controller.stopListening(this.spinnerElement,  Mojo.Event.tap, this.iconTapHandler);
    this.controller.stopListening(this.listElement, Mojo.Event.listTap, this.listTapHandler);
};

// Local Variables:
// tab-width: 4
// End:
