var prefs = new preferenceCookie();
var vers =  new versionCookie();
var DeviceProfile =  new deviceProfile();
var SystemPreferences =  new systemPreferences();
var PalmProfile =  new palmProfile();
var AccountServer =  new accountServer();
var PaymentServer =  new paymentServer();
var BackupServer =  new backupServer();

// resource handler object
var rh = new resourceHandler(
{
	extension:		'json',
	mime:			'application/json',
	addMessage:		'Impostah is not associated to open JSON data (.json files) from email or web.<br><br><b>Would you like to add Impostah to the association list for .json?</b>',
	activeMessage:	'Impostah is not currently the default application for handling .json files.<br>Current Default: #{active}<br><br><b>Would you like to make Impostah the default application?</b>',
});

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

			if (params.target) params.file = params.target;

			var loadStageController = this.controller.getStageController(loadStageName);
	        if (loadStageController) {
				loadStageController.popScenesTo('json-load');
				loadStageController.delegateToSceneAssistant('updateText', params.file);
				loadStageController.activate();
			}
			else {
				this.controller.createStageWithCallback({name: loadStageName, lightweight: true}, this.launchLoadScene.bindAsEventListener(this, params));
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
