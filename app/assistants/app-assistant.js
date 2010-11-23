var prefs = new preferenceCookie();
var vers =  new versionCookie();

// stage names
var mainStageName = 'gehrpelcg-main';
var dashStageName = 'gehrpelcg-dash';

function AppAssistant() {}

AppAssistant.prototype.handleLaunch = function(params)
{
	var mainStageController = this.controller.getStageController(mainStageName);
	
	/*
	alert('--------------------------');
	if (params)
		for (var p in params)
			if (typeof(params[p]) != 'function')
				alert(p+': '+params[p]);
	*/
	
	try
	{
		// launch from launcher tap
		if (!params) 
		{
	        if (mainStageController) 
			{
				mainStageController.popScenesTo('main');
				mainStageController.activate();
			}
			else
			{
				this.controller.createStageWithCallback({name: mainStageName, lightweight: true}, this.launchFirstScene.bind(this));
			}
		}
	}
	catch (e)
	{
		Mojo.Log.logException(e, "AppAssistant#handleLaunch");
	}
};

AppAssistant.prototype.launchFirstScene = function(controller)
{
    vers.init();
    if (vers.showStartupScene()) {
		controller.pushScene('startup');
    }
    else {
		controller.pushScene('main');
	}
};

AppAssistant.prototype.cleanup = function(event)
{
	alert('AppAssistant#cleanup');
};


// Local Variables:
// tab-width: 4
// End:
