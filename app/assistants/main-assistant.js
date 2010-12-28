function MainAssistant()
{
	// subtitle random list
	this.randomSub =
		[
		 {weight: 30, text: $L('This app is not what you think it is')},
		 {weight: 20, text: $L('Sneaky stuff from inside your device')},
		 {weight: 10, text: $L('More information than WikiLeaks')},
		 {weight: 10, text: $L('All your base are belong to us')},
		 {weight: 6, text: $L("<a href=\"http://donate.webos-internals.org/\">Donated</a> To WebOS Internals Lately?")}
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
	this.controller.document.body.className = prefs.get().theme;
	
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
			name:     $L('App Catalog'),
				scene:   'appcat-explore',
				});
    this.mainModel.items.push({
			name:     $L('Device'),
				scene:   'device-explore',
				});

    this.mainModel.items.push({
			name:     $L('Applications'),
				scene:   'application-explore',
				});
    this.mainModel.items.push({
			name:     $L('Databases'),
				scene:   'database-explore',
				});
    
    this.mainModel.items.push({
			name:     $L('Accounts'),
				scene:   'account-explore',
				});
    this.mainModel.items.push({
			name:     $L('Permissions'),
				scene:   'permission-explore',
				});

    this.mainModel.items.push({
			name:     $L('Activities'),
				scene:   'activity-explore',
				});
    this.mainModel.items.push({
			name:     $L('Connections'),
				scene:   'connection-explore',
				});


    this.mainModel.items.push({
			name:     $L('Key Store'),
				scene:   'keystore-explore',
				});
    this.mainModel.items.push({
			name:     $L('File Cache'),
				scene:   'filecache-explore',
				});

    this.mainModel.items.push({
			name:     $L('Backups'),
				scene:   'backup-explore',
				});
    

    // setup widget
    this.controller.setupWidget('mainList', {
			itemTemplate: "main/rowTemplate", swipeToDelete: false, reorderable: false }, this.mainModel);
    this.controller.listen(this.listElement, Mojo.Event.listTap, this.listTapHandler);
};

MainAssistant.prototype.listTap = function(event)
{
    if (event.item.scene === false || event.item.style == 'disabled') {
		// no scene or its disabled, so we won't do anything
    }
    else {
		// push the scene
		this.controller.stageController.pushScene(event.item.scene, event.item);
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
