ImpostahService.identifier = 'palm://org.webosinternals.impostah';

function ImpostahService(){};

ImpostahService.listDbKinds = function(callback, location)
{
    var request = new Mojo.Service.Request(ImpostahService.identifier,
	{
	    method: 'listDbKinds',
		parameters:
		{
			"location": location
		},
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

ImpostahService.getDbKind = function(callback, kind, location)
{
    var request = new Mojo.Service.Request(ImpostahService.identifier,
	{
	    method: 'getDbKind',
		parameters:
		{
			"id": kind,
			"location": location
		},
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

ImpostahService.listDbPerms = function(callback, location)
{
    var request = new Mojo.Service.Request(ImpostahService.identifier,
	{
	    method: 'listDbPerms',
		parameters:
		{
			"location": location
		},
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

ImpostahService.getDbPerm = function(callback, kind, location)
{
    var request = new Mojo.Service.Request(ImpostahService.identifier,
	{
	    method: 'getDbPerm',
		parameters:
		{
			"id": kind,
			"location": location
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
			"id": kind
		},
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

ImpostahService.listActivitySets = function(callback)
{
    var request = new Mojo.Service.Request(ImpostahService.identifier,
	{
	    method: 'listActivitySets',
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

ImpostahService.listActivities = function(callback, set)
{
    var request = new Mojo.Service.Request(ImpostahService.identifier,
	{
	    method: 'listActivities',
		parameters:
		{
			"set": set
		},
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

ImpostahService.getActivity = function(callback, set, id)
{
    var request = new Mojo.Service.Request(ImpostahService.identifier,
	{
	    method: 'getActivity',
		parameters:
		{
			"set": set,
			"id": id
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
