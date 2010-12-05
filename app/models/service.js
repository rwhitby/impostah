ImpostahService.identifier = 'palm://org.webosinternals.impostah';

function ImpostahService(){};

ImpostahService.getDbKinds = function(callback)
{
    var request = new Mojo.Service.Request(ImpostahService.identifier,
	{
	    method: 'getDbKinds',
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

// Local Variables:
// tab-width: 4
// End:
