function QueryAssistant(owner, service, database) {
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

	this.names = $H();

	this.names['com.palm.account:1'] = function(item) {
		return item.templateId+' : '+item.username;
	};
	this.names['com.palm.activity:1'] = function(item) {
		var creator = '';
		if (item.creator.serviceId) creator = item.creator.serviceId;
		if (item.creator.appId) creator = item.creator.appId;
		return creator+' : '+item.name;
	};
	this.names['com.palm.browserbookmarks:1'] = function(item) {
		return item.title;
	};
	this.names['com.palm.browserhistory:1'] = function(item) {
		return item.title;
	};
	this.names['com.palm.calendar:1'] = function(item) {
		return item.name;
	};
	this.names['com.palm.carrierdb.settings.current:1'] = function(item) {
		return item.qOperatorLongName;
	};
	this.names['com.palm.chatthread:1'] = function(item) {
		return item.displayName;
	};
	this.names['com.palm.contact:1'] = function(item) {
		return item.nickname || item.name.givenName+" "+item.name.familyName;
	};
	this.names['com.palm.contextupload:1'] = function(item) {
		return item.appid+" : "+item.event;
	};
	this.names['com.palm.email:1'] = function(item) {
		return item.subject;
	};
	this.names['com.palm.folder:1'] = function(item) {
		return item.displayName;
	};
	this.names['com.palm.imap.account:1'] = function(item) {
		return item.server+" : "+item.username;
	};
	this.names['com.palm.imloginstate:1'] = function(item) {
		return item.serviceName+" : "+item.username;
	};
	this.names['com.palm.immessage:1'] = function(item) {
		return item.messageText;
	};
	this.names['com.palm.message:1'] = function(item) {
		return item.messageText;
	};
	this.names['com.palm.note:1'] = function(item) {
		return item.title;
	};
	this.names['com.palm.palmprofile:1'] = function(item) {
		return item.alias;
	};
	this.names['com.palm.person:1'] = function(item) {
		return item.name.givenName+" "+item.name.familyName;
	};
	this.names['com.palm.phonecall:1'] = function(item) {
		if (item.type == "incoming") {
			return item.from.name || item.from.addr;
		}
		else {
			return item.to[0].name || item.to[0].addr;
		}
	};
}

QueryAssistant.prototype.setup = function() {

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
			if (this.names[this.database]) {
				try {
					this.mainModel.items[this.results].label = this.names[this.database](payload.results[a]);
				} catch (e) { }
			}
				
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
    this.controller.stopListening(this.listElement, Mojo.Event.listTap, this.listTapHandler);
};

// Local Variables:
// tab-width: 4
// End:
