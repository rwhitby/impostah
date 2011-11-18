function MainAssistant()
{
	// subtitle random list
	this.randomSub =
		[
		 {weight: 30, text: $L('This app is not what you think it is')},
		 {weight: 20, text: $L('Sneaky stuff from inside your device')},
		 {weight: 10, text: $L('More information than WikiLeaks')},
		 {weight: 10, text: $L('All your base are belong to us')},
		 {weight: 6, text: $L("<a href=\"https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=4DRCMPBJ8VYQQ\">Donated</a> To WebOS Internals Lately?")}
		 ];
	
	// setup list model
	this.mainModel = {items:[]};
	
	// setup menu
	this.menuModel = {
		visible: true,
		items: [
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

MainAssistant.prototype.setup = function()
{
    // set theme because this can be the first scene pushed
	var deviceTheme = '';
	if (Mojo.Environment.DeviceInfo.modelNameAscii == 'Pixi' ||
		Mojo.Environment.DeviceInfo.modelNameAscii == 'Veer')
		deviceTheme += ' small-device';
	if (Mojo.Environment.DeviceInfo.modelNameAscii.indexOf('TouchPad') == 0 ||
		Mojo.Environment.DeviceInfo.modelNameAscii == 'Emulator')
		deviceTheme += ' no-gesture';
    this.controller.document.body.className = prefs.get().theme + deviceTheme;
	
	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	// get elements
	this.iconElement =		this.controller.get('icon');
	this.titleElement =		this.controller.get('main-title');
	this.versionElement =	this.controller.get('version');
	this.subTitleElement =	this.controller.get('subTitle');
	this.listElement =		this.controller.get('mainList');
	
	// set version string random subtitle
	this.titleElement.innerHTML = Mojo.Controller.appInfo.title;
	this.versionElement.innerHTML = "v" + Mojo.Controller.appInfo.version;
	this.subTitleElement.innerHTML = this.getRandomSubTitle();
	
    // handlers
    this.listTapHandler = this.listTap.bindAsEventListener(this);
	
    this.mainModel.items.push({
			name:     $L('Device Profile'),
				scene:   'device-profile',
				});

    this.mainModel.items.push({
			name:     $L('Activation'),
				scene:   'activation',
				});

    this.mainModel.items.push({
			name:     $L('Palm Profile'),
				scene:   'palm-profile',
				});

    this.mainModel.items.push({
			name:     $L('App Catalog'),
				scene:   'app-catalog',
				});

    this.mainModel.items.push({
			name:     $L('Accounts'),
				scene:   'accounts',
				disabled: (Mojo.Environment.DeviceInfo.platformVersionMajor == 1)
				});

    this.mainModel.items.push({
			name:     $L('Backups'),
				scene:   'backups',
				disabled: (Mojo.Environment.DeviceInfo.platformVersionMajor == 1)
				});

    this.mainModel.items.push({
			name:     $L('Databases'),
				scene:   'database-explore',
				disabled: (Mojo.Environment.DeviceInfo.platformVersionMajor == 1)
				});

    this.mainModel.items.push({
			name:     $L('System Prefs'),
				scene:   'system-preferences',
				disabled: (Mojo.Environment.DeviceInfo.platformVersionMajor == 1)
				});

    this.mainModel.items.push({
			name:     $L('Permissions'),
				scene:   'permission-explore',
				disabled: (Mojo.Environment.DeviceInfo.platformVersionMajor == 1)
				});

    this.mainModel.items.push({
			name:     $L('Applications'),
				scene:   'application-explore',
				disabled: (Mojo.Environment.DeviceInfo.platformVersionMajor == 1)
				});

    this.mainModel.items.push({
			name:     $L('Activities'),
				scene:   'activity-explore',
				disabled: (Mojo.Environment.DeviceInfo.platformVersionMajor == 1)
				});
    this.mainModel.items.push({
			name:     $L('Connections'),
				scene:   'connection-explore',
				});


    this.mainModel.items.push({
			name:     $L('App Data'),
				scene:   'app-data-explore',
				});
    this.mainModel.items.push({
			name:     $L('App Cookies'),
				scene:   'app-cookie-explore',
				});

    this.mainModel.items.push({
			name:     $L('Key Store'),
				scene:   'keystore-explore',
				disabled: (Mojo.Environment.DeviceInfo.platformVersionMajor == 1)
				});

    this.mainModel.items.push({
			name:     $L('Web Cookies'),
				scene:   'web-cookie-explore',
				});

    this.mainModel.items.push({
			name:     $L('Backups'),
				scene:   'backup-explore',
				disabled: (Mojo.Environment.DeviceInfo.platformVersionMajor == 1)
				});

    this.mainModel.items.push({
			name:     $L('File Cache'),
				scene:   'filecache-explore',
				disabled: (Mojo.Environment.DeviceInfo.platformVersionMajor == 1)
				});
    

	// Dim the disabled items
	for (var i = 0; i < this.mainModel.items.length; i++) {
		if (this.mainModel.items[i].disabled) {
			this.mainModel.items[i].style = 'disabled';
		}
	}

    // setup widget
    this.controller.setupWidget('mainList', {
			itemTemplate: "main/rowTemplate", swipeToDelete: false, reorderable: false }, this.mainModel);
    this.controller.listen(this.listElement, Mojo.Event.listTap, this.listTapHandler);
};

MainAssistant.prototype.activate = function()
{
	if (!this.firstActivate) {
		if (prefs.get().resourceHandlerCheck) {
			rh.doIt(this);
		}
	}
	this.firstActivate = true;
};

MainAssistant.prototype.listTap = function(event)
{
    if (event.item.scene === false || event.item.disabled == true) {
		// no scene or its disabled, so we won't do anything
    }
    else {
		// push the scene
		this.controller.stageController.pushScene(event.item.scene, event.item.params);
    }
};

MainAssistant.prototype.getRandomSubTitle = function()
{
	// loop to get total weight value
	var weight = 0;
	for (var r = 0; r < this.randomSub.length; r++) {
		weight += this.randomSub[r].weight;
	}
	
	// random weighted value
	var rand = Math.floor(Math.random() * weight);
	//alert('rand: ' + rand + ' of ' + weight);
	
	// loop through to find the random title
	for (var r = 0; r < this.randomSub.length; r++) {
		if (rand <= this.randomSub[r].weight) {
			return this.randomSub[r].text;
		}
		else {
			rand -= this.randomSub[r].weight;
		}
	}
	
	// if no random title was found (for whatever reason, wtf?) return first and best subtitle
	return this.randomSub[0].text;
};

MainAssistant.prototype.handleCommand = function(event)
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

MainAssistant.prototype.cleanup = function(event)
{
    this.controller.stopListening(this.listElement, Mojo.Event.listTap, this.listTapHandler);
};

// Local Variables:
// tab-width: 4
// End:
