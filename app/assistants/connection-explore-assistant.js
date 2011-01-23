function ConnectionExploreAssistant()
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
	
	this.connectionKindsModel = {
		value: '',
		choices: [],
		disabled: true
	}

	this.connectionId = '';
	this.connections = {};
	
	this.showButtonModel = {
		label: $L("Show"),
		disabled: true
	}

};

ConnectionExploreAssistant.prototype.setup = function()
{
	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	// get elements
	this.connectionKindElement =	this.controller.get('connectionKind');
	this.showButton =			this.controller.get('showButton');
	
	// setup handlers
	this.connectionKindsHandler =			this.connectionKinds.bindAsEventListener(this);
	this.connectionKindChangedHandler = this.connectionKindChanged.bindAsEventListener(this);
	this.showTapHandler =		this.showTap.bindAsEventListener(this);
	
	// setup widgets
	this.controller.setupWidget('connectionKind', { multiline: true }, this.connectionKindsModel);
	this.controller.listen(this.connectionKindElement, Mojo.Event.propertyChange, this.connectionKindChangedHandler);
	this.controller.setupWidget('showButton', {}, this.showButtonModel);
	this.controller.listen(this.showButton,	 Mojo.Event.tap, this.showTapHandler);
	
	this.request = ImpostahService.listConnections(this.connectionKindsHandler);
	
};

ConnectionExploreAssistant.prototype.connectionKinds = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (connectionKinds):</b><br>'+payload.errorText);
		return;
	}

	var oldKind = prefs.get().lastConnectionKind;
	var newKind = false;

	this.connections = {};

	if (payload.stdOut && payload.stdOut.length > 0) {
		for (var a = 0; a < payload.stdOut.length; a++) {
			var fields = payload.stdOut[a].split(/\s+/);
			var connection = {};
			connection.type = fields.shift();
			connection.type_num = fields.shift();
			connection.proto = fields.shift();
			connection.proto_num = fields.shift();
			connection.ttl = fields.shift();
			if (connection.proto == "tcp") {
				connection.state = fields.shift();
			}
			while (fields.length > 0) {
				var field = fields.shift();
				if (field.indexOf("=") != -1) {
					var items = field.split('=');
					if (connection[items[0]]) {
						connection[items[0]+"-reply"] = items[1];
					}
					else {
						connection[items[0]] = items[1];
					}
				}
				else if (field == "[ASSURED]") {
					connection['assured'] = true;
				}
				else if (field == "[UNREPLIED]") {
					connection['unreplied'] = true;
				}
				else {
					connection['other'] += field;
				}
			}
			var id = connection.proto + " " + connection.dst + ":" + connection.dport;
			var label = connection.proto + " " + connection.dst + ":" + connection.dport;
			this.connectionKindsModel.choices.push({label:label, value:id});
			this.connections[id] = connection;
			if (id == oldKind) {
				newKind = oldKind;
			}
		}
		
		if (newKind === false) {
			newKind = this.connectionKindsModel.choices[0].value;
		}
	}

	// Enable the drop-down list
	this.connectionKindsModel.disabled = false;
	this.connectionKindsModel.value = newKind;
	this.controller.modelChanged(this.connectionKindsModel);
	this.connectionKindChanged({value: newKind});
};

ConnectionExploreAssistant.prototype.connectionKindChanged = function(event)
{
	var cookie = new preferenceCookie();
	var tprefs = cookie.get();
	tprefs.lastConnectionKind = event.value;
	cookie.put(tprefs);
	var tmp = prefs.get(true);
	
	this.connectionId = event.value;
	
	// Enable the show button
	this.showButtonModel.disabled = false;
	this.controller.modelChanged(this.showButtonModel);

};

ConnectionExploreAssistant.prototype.showTap = function(event)
{
	if (this.connectionId) {
		var payload = this.connections[this.connectionId];
		this.controller.stageController.pushScene("item", "Connection Record", payload);
	}
};

ConnectionExploreAssistant.prototype.errorMessage = function(msg)
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

ConnectionExploreAssistant.prototype.handleCommand = function(event)
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

ConnectionExploreAssistant.prototype.cleanup = function(event)
{
	this.controller.stopListening(this.connectionKindElement, Mojo.Event.propertyChange, this.connectionKindChangedHandler);
	this.controller.stopListening(this.showButton,	Mojo.Event.tap, this.showTapHandler);
};

// Local Variables:
// tab-width: 4
// End:
