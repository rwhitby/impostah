ImpostahService.identifier = 'palm://org.webosinternals.impostah';

function ImpostahService(){};

ImpostahService.listDbKinds = function(callback)
{
    var request = new Mojo.Service.Request(ImpostahService.identifier,
	{
	    method: 'listDbKinds',
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};
ImpostahService.getDbKind = function(callback, kind)
{
    var request = new Mojo.Service.Request(ImpostahService.identifier,
	{
	    method: 'getDbKind',
		parameters:
		{
			"id": kind
		},
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

ImpostahService.listDbPerms = function(callback, kind)
{
    var request = new Mojo.Service.Request(ImpostahService.identifier,
	{
	    method: 'listDbPerms',
		parameters:
		{
			"id": kind
		},
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

// Local Variables:
// tab-width: 4
// End:
