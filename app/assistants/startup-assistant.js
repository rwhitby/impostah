function StartupAssistant(changelog)
{
	this.justChangelog = changelog;
	
    // on first start, this message is displayed, along with the current version message from below
    this.firstMessage = $L('Here are some tips for first-timers:<ul><li>Many Impostah features are only available on webOS 2.0</li></ul>');
	
    this.secondMessage = $L('We hope you enjoy being able to impersonate other applications to access the secrets inside your device.<br>Please consider making a <a href=\"https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=4DRCMPBJ8VYQQ\">donation</a> if you wish to show your appreciation.');
	
    // on new version start
    this.newMessages =
	[
	 // Don't forget the comma on all but the last entry
	 { version: '0.9.16', log: [ 'Added the ability to display app catalog device and session information' ] },
	 { version: '0.9.15', log: [ 'Added the ability to show all your purchased apps' ] },
	 { version: '0.9.14', log: [ 'Added the ability to delete all items in a database' ] },
	 { version: '0.9.13', log: [ 'Add support for Australian app catalog activation' ] },
	 { version: '0.9.12', log: [ 'Modify the device information passed during activation for the Pre 3' ] },
	 { version: '0.9.11', log: [ 'Purge cleared overrides' ] },
	 { version: '0.9.10', log: [ 'Purge deleted overrides' ] },
	 { version: '0.9.9', log: [ 'Handle missing locationHost information correctly' ] },
	 { version: '0.9.8', log: [ 'Restart the UpdateDaemon on locationHost change' ] },
	 { version: '0.9.7', log: [ 'Fixed an account server URL caching bug' ] },
	 { version: '0.9.6', log: [ 'Fixed a profile merging bug' ] },
	 { version: '0.9.5', log: [ 'Added the ability to set the locationHost system preference' ] },
	 { version: '0.9.4', log: [ 'Added the ability to list all devices registered with your HP webOS account' ] },
	 { version: '0.9.3', log: [ 'Added the ability to list all installed app catalog apps' ] },
	 { version: '0.9.2', log: [ 'Now useable on devices without a back gesture' ] },
	 { version: '0.9.1', log: [ 'Improved the activation scene user interface' ] },
	 { version: '0.9.0', log: [ 'Improved the accounts scene user interface' ] },
	 { version: '0.8.9', log: [ 'Added the ability to delete accounts' ] },
	 { version: '0.8.8', log: [ 'Added the ability to delete database records' ] },
	 { version: '0.8.7', log: [ 'Fixed icon tap handlers for json load and save scenes' ] },
	 { version: '0.8.6', log: [ 'Fixed the app catalog button enablement' ] },
	 { version: '0.8.5', log: [ 'Now useable on devices without a back gesture (tap the top-left icon instead)' ] },
	 { version: '0.8.4', log: [ 'Added the ability to check promo code status' ] },
	 { version: '0.8.3', log: [ 'Improved the activation scene button labels' ] },
	 { version: '0.8.2', log: [ 'Simplified the activation scene user interface' ] },
	 { version: '0.8.1', log: [ 'Added automatic MCC and MNC override for activation' ] },
	 { version: '0.8.0', log: [ 'Added the language and country selectors for profile creation',
								'Added the activation scene (split from the palm profile scene)',
								'Added the ability to check email availability',
								'Added the ability to override the MCC and MNC, without a SIM inserted' ] },
	 { version: '0.7.0', log: [ 'Added the ability to install free (not paid) geo-restricted apps' ] },
	 { version: '0.6.2', log: [ 'Added load and save for JSON overrides files' ] },
	 { version: '0.6.1', log: [ 'Refresh the device profile when exiting the overrides scene',
								'Improved the overrides user interface' ] },
	 { version: '0.6.0', log: [ 'Added device profile and palm profile overrides',
								'Worked around the fatal webOS 2.x db permissions bug',
								'Remove and reinstall Impostah *twice* to fix it' ] },
	 { version: '0.5.6', log: [ 'Fixed the palm profile token expiry' ] },
	 { version: '0.5.5', log: [ 'Added the ability to restore from backups' ] },
	 { version: '0.5.4', log: [ 'Added the ability to display backup manifests' ] },
	 { version: '0.5.3', log: [ 'Added debugging of the web service requests and responses' ] },
	 { version: '0.5.2', log: [ 'Added the ability to create a new Palm Profile' ] },
	 { version: '0.5.1', log: [ 'Added the ability to display your registered credit card info' ] },
	 { version: '0.5.0', log: [ 'Added the ability to change your Palm Profile without erasing the device' ] },
	 { version: '0.4.4', log: [ 'Added Palm Profile to Device Info scene, including the ability to reset it' ] },
	 { version: '0.4.3', log: [ 'Removed allowed character restrictions on impersonate method parameters' ] },
	 { version: '0.4.2', log: [ 'Added support for better display of app cookies' ] },
	 { version: '0.4.1', log: [ 'Implemented access authorisation checking' ] },
	 { version: '0.4.0', log: [ 'Enable a subset of features for webOS 1.4.5' ] },
	 { version: '0.3.8', log: [ 'Added support for app databases' ] },
	 { version: '0.3.7', log: [ 'Added support for app cookies' ] },
	 { version: '0.3.6', log: [ 'Added support for web cookies' ] },
	 { version: '0.3.5', log: [ 'Do not capitalise JSON field names' ] },
	 { version: '0.3.4', log: [ 'Added structured display of JSON data' ] },
	 { version: '0.3.3', log: [ 'Added support for app catalog exploration' ] },
	 { version: '0.3.2', log: [ 'Added support for reporting the telephony platform' ] },
	 { version: '0.3.1', log: [ 'Added support for reporting the device profile' ] },
	 { version: '0.3.0', log: [ 'Added support for connection exploration' ] },
	 { version: '0.2.9', log: [ 'Dual column main scene' ] },
	 { version: '0.2.8', log: [ 'Added support for permission exploration' ] },
	 { version: '0.2.7', log: [ 'Added support for application exploration' ] },
	 { version: '0.2.6', log: [ 'Added support for account exploration' ] },
	 { version: '0.2.5', log: [ 'Fixed a bug in the query list' ] },
	 { version: '0.2.4', log: [ 'Added a query and item display scenes' ] },
	 { version: '0.2.3', log: [ 'Added a better list selector' ] },
	 { version: '0.2.2', log: [ 'Added support for keystore exploration' ] },
	 { version: '0.2.1', log: [ 'Revamped the activity exploration backend' ] },
	 { version: '0.2.0', log: [ 'Revamped the database exploration backend' ] },
	 { version: '0.1.1', log: [ 'Strip comments from JSON files before parsing' ] },
	 { version: '0.1.0', log: [ 'Revamped the database exploration scene' ] },
	 { version: '0.0.8', log: [ 'Added support for multiple database locations' ] },
	 { version: '0.0.7', log: [ 'Set appropriate defaults for all selections' ] },
	 { version: '0.0.6', log: [ 'Added support for activity exploration' ] },
	 { version: '0.0.5', log: [ 'Added support for backup exploration' ] },
	 { version: '0.0.4', log: [ 'Added support for temporary databases' ] },
	 { version: '0.0.3', log: [ 'Added upstart script' ] },
	 { version: '0.0.2', log: [ 'Lists DB kinds' ] },
	 { version: '0.0.1', log: [ 'Initial skeleton' ] }
	 ];
	
    // setup menu
    this.menuModel =
	{
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
	
    // setup command menu
    this.cmdMenuModel =
	{
	    visible: false, 
	    items:
	    [
		    {},
		    {
				label: $L("Ok, I've read this. Let's continue ..."),
				command: 'do-continue'
		    },
		    {}
	     ]
	};
};

StartupAssistant.prototype.setup = function()
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
	
    // get elements
    this.titleContainer = this.controller.get('title');
    this.dataContainer =  this.controller.get('data');

	if (Mojo.Environment.DeviceInfo.modelNameAscii.indexOf('TouchPad') == 0 ||
		Mojo.Environment.DeviceInfo.modelNameAscii == 'Emulator')
		this.backElement = this.controller.get('icon');
	else
		this.backElement = this.controller.get('header');
	
    // set title
	if (this.justChangelog)
	{
		this.titleContainer.innerHTML = $L('Changelog');
		// setup back tap
		this.backTapHandler = this.backTap.bindAsEventListener(this);
		this.controller.listen(this.backElement, Mojo.Event.tap, this.backTapHandler);
	}
	else
	{
		this.controller.get('icon').hide();
	    if (vers.isFirst) {
			this.titleContainer.innerHTML = $L('Welcome To Impostah');
	    }
	    else if (vers.isNew) {
			this.titleContainer.innerHTML = $L('Impostah Changelog');
	    }
	}
	
	
    // build data
    var html = '';
	if (this.justChangelog)
	{
		for (var m = 0; m < this.newMessages.length; m++) 
		{
		    html += Mojo.View.render({object: {title: 'v' + this.newMessages[m].version}, template: 'startup/changeLog'});
		    html += '<ul>';
		    for (var l = 0; l < this.newMessages[m].log.length; l++)
			{
				html += '<li>' + this.newMessages[m].log[l] + '</li>';
		    }
		    html += '</ul>';
		}
	}
	else
	{
		if (vers.isFirst)
		{
			html += '<div class="text">' + this.firstMessage + '</div>';
		}
	    if (vers.isNew)
		{
			if (!this.justChangelog)
			{
				html += '<div class="text">' + this.secondMessage + '</div>';
			}
			for (var m = 0; m < this.newMessages.length; m++) 
			{
			    html += Mojo.View.render({object: {title: 'v' + this.newMessages[m].version}, template: 'startup/changeLog'});
			    html += '<ul>';
			    for (var l = 0; l < this.newMessages[m].log.length; l++)
				{
					html += '<li>' + this.newMessages[m].log[l] + '</li>';
			    }
			    html += '</ul>';
			}
	    }
	}
    
    // set data
    this.dataContainer.innerHTML = html;
	
    // setup menu
    this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	if (!this.justChangelog)
	{
	    // set command menu
	    this.controller.setupWidget(Mojo.Menu.commandMenu, { menuClass: 'no-fade' }, this.cmdMenuModel);
	}
	
    // set this scene's default transition
    this.controller.setDefaultTransition(Mojo.Transition.zoomFade);
};

StartupAssistant.prototype.activate = function(event)
{
	if (!this.justChangelog) {
		// start continue button timer
		// this.timer = this.controller.window.setTimeout(this.showContinue.bind(this), 5 * 1000);
		// this.showContinue();
		this.controller.stageController.swapScene({name: 'main', transition: Mojo.Transition.crossFade});
	}
};

StartupAssistant.prototype.showContinue = function()
{
    // show the command menu
    this.controller.setMenuVisible(Mojo.Menu.commandMenu, true);
};

StartupAssistant.prototype.backTap = function(event)
{
	if (this.justChangelog) {
		this.controller.stageController.popScene();
	}
};

StartupAssistant.prototype.handleCommand = function(event)
{
    if (event.type == Mojo.Event.command) {
	switch (event.command) {
	case 'do-continue':
	this.controller.stageController.swapScene({name: 'main', transition: Mojo.Transition.crossFade});
	break;
			
	case 'do-prefs':
	this.controller.stageController.pushScene('preferences');
	break;
			
	case 'do-help':
	this.controller.stageController.pushScene('help');
	break;
	}
    }
};

StartupAssistant.prototype.cleanup = function(event)
{
	if (this.justChangelog)
		this.controller.stopListening(this.backElement,  Mojo.Event.tap, this.backTapHandler);
};

// Local Variables:
// tab-width: 4
// End:
