function StartupAssistant(changelog)
{
	this.justChangelog = changelog;
	
    // on first start, this message is displayed, along with the current version message from below
    this.firstMessage = $L('Here are some tips for first-timers:<ul><li>Impostah has no tips yet</li></ul>');
	
    this.secondMessage = $L('We hope you enjoy being able to impersonate other applications to access the secrets inside your device.<br>Please consider making a <a href=http://donate.webos-internals.org/>donation</a> if you wish to show your appreciation.');
	
    // on new version start
    this.newMessages =
	[
	 // Don't forget the comma on all but the last entry
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
    this.controller.document.body.className = prefs.get().theme;
	
    // get elements
    this.titleContainer = this.controller.get('title');
    this.dataContainer =  this.controller.get('data');
	
    // set title
	if (this.justChangelog)
	{
		this.titleContainer.innerHTML = $L('Changelog');
	}
	else
	{
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
    // start continue button timer
    this.timer = this.controller.window.setTimeout(this.showContinue.bind(this), 5 * 1000);
};

StartupAssistant.prototype.showContinue = function()
{
    // show the command menu
    this.controller.setMenuVisible(Mojo.Menu.commandMenu, true);
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

// Local Variables:
// tab-width: 4
// End:
