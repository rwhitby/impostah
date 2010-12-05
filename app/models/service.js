ImpostahService.identifier = 'palm://org.webosinternals.impostah';

function ImpostahService(){};

ImpostahService.listDbKinds = function(callback, temporary)
{
    var request = new Mojo.Service.Request(ImpostahService.identifier,
	{
	    method: 'listDbKinds',
		parameters:
		{
			"temp": temporary
		},
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

ImpostahService.getDbKind = function(callback, kind, temporary)
{
    var request = new Mojo.Service.Request(ImpostahService.identifier,
	{
	    method: 'getDbKind',
		parameters:
		{
			"id": kind,
			"temp": temporary
		},
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

ImpostahService.listDbPerms = function(callback, temporary)
{
    var request = new Mojo.Service.Request(ImpostahService.identifier,
	{
	    method: 'listDbPerms',
		parameters:
		{
			"temp": temporary
		},
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

ImpostahService.getDbPerm = function(callback, kind, temporary)
{
    var request = new Mojo.Service.Request(ImpostahService.identifier,
	{
	    method: 'getDbPerm',
		parameters:
		{
			"id": kind,
			"temp": temporary
		},
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

ImpostahService.getBackup = function(callback, kind)
{
    var request = new Mojo.Service.Request(ImpostahService.identifier,
	{
	    method: 'getBackup',
		parameters:
		{
			"id": kind,
		},
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
			"params": params
		},
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

// Local Variables:
// tab-width: 4
// End:
