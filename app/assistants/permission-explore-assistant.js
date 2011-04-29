function PermissionExploreAssistant()
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
	
	this.permissionObjectsModel = {
		value: '',
		choices: [],
		disabled: true
	}
	this.objectId = '';
	
	this.permissionCallersModel = {
		value: '',
		choices: [],
		disabled: true
	}
	this.callerId = '';
	
	this.showButtonModel = {
		label: $L("Show"),
		disabled: true
	}

	this.permissionId = false;
	this.permissions = {};
};

PermissionExploreAssistant.prototype.setup = function()
{
	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	// get elements
	this.iconElement =				this.controller.get('icon');
	this.iconElement.style.display = 'none';
	this.spinnerElement = 			this.controller.get('spinner');
	this.permissionObjectElement =	this.controller.get('permissionObject');
	this.permissionCallerElement =	this.controller.get('permissionCaller');
	this.showButton =				this.controller.get('showButton');
	
	// setup handlers
	this.iconTapHandler = this.iconTap.bindAsEventListener(this);
	this.permissionObjectsHandler =			this.permissionObjects.bindAsEventListener(this);
	this.permissionObjectChangedHandler =	this.permissionObjectChanged.bindAsEventListener(this);
	this.permissionCallersHandler =			this.permissionCallers.bindAsEventListener(this);
	this.permissionCallerChangedHandler =	this.permissionCallerChanged.bindAsEventListener(this);
	this.showTapHandler =					this.showTap.bindAsEventListener(this);
	this.permissionCallerHandler =			this.permissionCaller.bindAsEventListener(this);
	
	// setup wigets
	this.spinnerModel = {spinning: true};
	this.controller.setupWidget('spinner', {spinnerSize: 'small'}, this.spinnerModel);
	this.controller.listen(this.iconElement,  Mojo.Event.tap, this.iconTapHandler);
	this.controller.listen(this.spinnerElement,  Mojo.Event.tap, this.iconTapHandler);
	this.controller.setupWidget('permissionObject', {}, this.permissionObjectsModel);
	this.controller.listen(this.permissionObjectElement, Mojo.Event.propertyChange, this.permissionObjectChangedHandler);
	this.controller.setupWidget('permissionCaller', {}, this.permissionCallersModel);
	this.controller.listen(this.permissionCallerElement, Mojo.Event.propertyChange, this.permissionCallerChangedHandler);
	this.controller.setupWidget('showButton', {}, this.showButtonModel);
	this.controller.listen(this.showButton,	 Mojo.Event.tap, this.showTapHandler);
	
	this.request = ImpostahService.impersonate(this.permissionObjectsHandler, "com.palm.configurator",
											   "com.palm.db",
											   "find", {"query":{"select":["object"], "from":"Permission:1"}});
};

PermissionExploreAssistant.prototype.permissionObjects = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (permissionObjects):</b><br>'+payload.errorText);
		return;
	}

	var oldObject = prefs.get().lastPermissionObject;
	var newObject = false;

	var results = payload.results;

	if (results && results.length > 0) {

		var objects = {};

		for (var a = 0; a < results.length; a++) {
			var id = results[a].object;
			var name = results[a].object;
			if (name.indexOf("com.palm.") == 0) {
				name = name.slice(9);
			}
			if (!objects[name]) {
				objects[name] = true;
				this.permissionObjectsModel.choices.push({label:name, value:id});
				if (id == oldObject) {
					newObject = oldObject;
				}
			}
		}
		
		if (newObject === false) {
			newObject = this.permissionObjectsModel.choices[0].value;
		}

		// Enable the drop-down list
		this.permissionObjectsModel.disabled = false;
		this.permissionObjectsModel.value = newObject;
		this.controller.modelChanged(this.permissionObjectsModel);
		this.permissionObjectChanged({value: newObject});
	}
	else {
		this.iconElement.style.display = 'inline';
		this.spinnerModel.spinning = false;
		this.controller.modelChanged(this.spinnerModel);
	}
};

PermissionExploreAssistant.prototype.permissionObjectChanged = function(event)
{
	var cookie = new preferenceCookie();
	var tprefs = cookie.get();
	tprefs.lastPermissionObject = event.value;
	cookie.put(tprefs);
	var tmp = prefs.get(true);
	
	this.objectId = event.value;
	
	// Disable the show button
	this.showButtonModel.disabled = true;
	this.controller.modelChanged(this.showButtonModel);

	// Disable the permission kinds list
	this.permissionCallersModel.choices = [];
	this.permissionCallersModel.value = "";
	this.permissionCallersModel.disabled = true;
	this.controller.modelChanged(this.permissionCallersModel);

	this.permissionId = false;

	this.iconElement.style.display = 'none';
	this.spinnerModel.spinning = true;
	this.controller.modelChanged(this.spinnerModel);

	var query = {
		"select" : [ "_id", "object", "caller" ],
		"from" : "Permission:1",
		"where" : [{
				"prop" : "object",
				"op" : "=",
				"val" : this.objectId
			}]
	};

	this.request = ImpostahService.impersonate(this.permissionCallersHandler, "com.palm.configurator",
											   "com.palm.db", "find", { "query" : query });
};

PermissionExploreAssistant.prototype.permissionCallers = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (permissionCallers):</b><br>'+payload.errorText);
		return;
	}

	var oldCaller = prefs.get().lastPermissionCaller;
	var newCaller = false;

	var results = payload.results;

	this.permissions = {};

	if (results && results.length > 0) {
		for (var a = 0; a < results.length; a++) {
			var id = results[a]._id;
			var name = results[a].caller;
			var label = results[a].caller;
			if (label.indexOf("com.palm.") == 0) {
				label = label.slice(9);
			}
			this.permissionCallersModel.choices.push({label:label, value:name});
			this.permissions[name] = id;
			if (name == oldCaller) {
				newCaller = oldCaller;
			}
		}
		
		if (newCaller === false) {
			newCaller = this.permissionCallersModel.choices[0].value;
		}

		// Enable the drop-down list
		this.permissionCallersModel.disabled = false;
		this.permissionCallersModel.value = newCaller;
		this.controller.modelChanged(this.permissionCallersModel);
		this.permissionCallerChanged({value: newCaller});
	}

	this.iconElement.style.display = 'inline';
	this.spinnerModel.spinning = false;
	this.controller.modelChanged(this.spinnerModel);
};

PermissionExploreAssistant.prototype.permissionCallerChanged = function(event)
{
	var cookie = new preferenceCookie();
	var tprefs = cookie.get();
	tprefs.lastPermissionCaller = event.value;
	cookie.put(tprefs);
	var tmp = prefs.get(true);
	
	this.callerId = event.value;

	this.permissionId = this.permissions[this.callerId];

	// Enable the show button
	this.showButtonModel.disabled = false;
	this.controller.modelChanged(this.showButtonModel);

};

PermissionExploreAssistant.prototype.showTap = function(event)
{
	if (this.permissionId) {

		this.iconElement.style.display = 'none';
		this.spinnerModel.spinning = true;
		this.controller.modelChanged(this.spinnerModel);

		this.request = ImpostahService.impersonate(this.permissionCallerHandler, "com.palm.configurator",
												   "com.palm.db", "get", { "ids" : [ this.permissionId ] });
	}
};

PermissionExploreAssistant.prototype.permissionCaller = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (permissionCaller):</b><br>'+payload.errorText);
		return;
	}

	this.iconElement.style.display = 'inline';
	this.spinnerModel.spinning = false;
	this.controller.modelChanged(this.spinnerModel);

	if (payload.results[0]) {
		this.controller.stageController.pushScene("item", "Permission Record", payload.results[0]);
	}
};

PermissionExploreAssistant.prototype.errorMessage = function(msg)
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

PermissionExploreAssistant.prototype.iconTap = function(event)
{
	this.controller.stageController.popScene();
};

PermissionExploreAssistant.prototype.handleCommand = function(event)
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

PermissionExploreAssistant.prototype.cleanup = function(event)
{
	this.controller.stopListening(this.iconElement,  Mojo.Event.tap, this.iconTapHandler);
	this.controller.stopListening(this.spinnerElement,  Mojo.Event.tap, this.iconTapHandler);
	this.controller.stopListening(this.permissionObjectElement, Mojo.Event.propertyChange, this.permissionObjectChangedHandler);
	this.controller.stopListening(this.permissionCallerElement, Mojo.Event.propertyChange, this.permissionCallerChangedHandler);
	this.controller.stopListening(this.showButton,	Mojo.Event.tap, this.showTapHandler);
};

// Local Variables:
// tab-width: 4
// End:
