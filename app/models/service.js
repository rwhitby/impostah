ImpostahService.identifier = 'palm://org.webosinternals.impostah';

function ImpostahService(){};

ImpostahService.listKeys = function(callback)
{
    var request = new Mojo.Service.Request(ImpostahService.identifier,
	{
	    method: 'listKeys',
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

ImpostahService.listConnections = function(callback)
{
    var request = new Mojo.Service.Request(ImpostahService.identifier,
	{
	    method: 'listConnections',
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

ImpostahService.listBackups = function(callback)
{
    var request = new Mojo.Service.Request(ImpostahService.identifier,
	{
	    method: 'listBackups',
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

ImpostahService.getBackup = function(callback, id)
{
    var request = new Mojo.Service.Request(ImpostahService.identifier,
	{
	    method: 'getBackup',
		parameters:
		{
			"id": id
		},
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

ImpostahService.listAppDatabases = function(callback)
{
    var request = new Mojo.Service.Request(ImpostahService.identifier,
	{
	    method: 'listAppDatabases',
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

ImpostahService.listAppCookies = function(callback)
{
    var request = new Mojo.Service.Request(ImpostahService.identifier,
	{
	    method: 'listAppCookies',
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

ImpostahService.listWebCookies = function(callback)
{
    var request = new Mojo.Service.Request(ImpostahService.identifier,
	{
	    method: 'listWebCookies',
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

ImpostahService.listSystemPrefs = function(callback)
{
    var request = new Mojo.Service.Request(ImpostahService.identifier,
	{
	    method: 'listSystemPrefs',
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

ImpostahService.impersonate = function(callback, id, service, method, params)
{
    var request = new Mojo.Service.Request(ImpostahService.identifier,
	{
	    method: 'impersonate',
		parameters:
		{
			"id": id,
			"service": service,
			"method": method,
			"params": params,
			"subscribe": params.subscribe? true : false
		},
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

ImpostahService.getDirListing = function(callback, dir)
{
	var request = new Mojo.Service.Request(ImpostahService.identifier,
	{
		method: 'getDirListing',
		parameters: {"directory": dir},
		onSuccess: callback,
		onFailure: callback
	});
	return request;
};

ImpostahService.getFile = function(callback, url, filename)
{
	var request = new Mojo.Service.Request(ImpostahService.identifier,
	{
		method: 'getFile',
		parameters: {"url": url, "filename": filename},
		onSuccess: callback,
		onFailure: callback
	});
	return request;
};

ImpostahService.putFile = function(callback, object, filename)
{
	var request = new Mojo.Service.Request(ImpostahService.identifier,
	{
		method: 'putFile',
		parameters: {"object": object, "filename": filename},
		onSuccess: callback,
		onFailure: callback
	});
	return request;
};

ImpostahService.removeFirstUseFlag = function(callback)
{
    var request = new Mojo.Service.Request(ImpostahService.identifier,
	{
	    method: 'removeFirstUseFlag',
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

ImpostahService.restartLuna = function(callback)
{
    var request = new Mojo.Service.Request(ImpostahService.identifier,
	{
	    method: 'restartLuna',
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

// Local Variables:
// tab-width: 4
// End:
