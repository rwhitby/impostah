var prefs = new preferenceCookie();
var vers =  new versionCookie();

// stage names
var mainStageName = 'impostah-main';
var loadStageName = 'impostah-load';

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
	
	try {
		// launch from launcher tap
		if (!params) {
	        if (mainStageController) {
				mainStageController.popScenesTo('main');
				mainStageController.activate();
			}
			else {
				this.controller.createStageWithCallback({name: mainStageName, lightweight: true}, this.launchFirstScene.bind(this));
			}
		}
		else if (params.target) {
			var installStageController = this.controller.getStageController(installStageName);
	        if (installStageController) {
				installStageController.popScenesTo('json-load');
				installStageController.delegateToSceneAssistant('updateText', params.target);
				installStageController.activate();
			}
			else {
				this.controller.createStageWithCallback({name: installStageName, lightweight: true}, this.launchLoadScene.bindAsEventListener(this, params));
			}
		}
	}
	catch (e) {
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

AppAssistant.prototype.launchLoadScene = function(controller, params)
{
	controller.pushScene('json-load', params);
};

AppAssistant.prototype.cleanup = function(event)
{
	alert('AppAssistant#cleanup');
};


// Local Variables:
// tab-width: 4
// End:
