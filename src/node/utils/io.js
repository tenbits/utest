var io_connect,
	io_clean
	;
	
(function(){
	
	var dfr, client;
	
	io_clean = function(){
		
		if (dfr == null) 
			return;
		
		if (dfr._resolved == null) {
			dfr = null;
			return;
		}
		
		var socket = dfr._resolved[0];
		
		socket.disconnect();
		dfr = null;
	};
	
	io_connect = function(config){
		
		if (dfr) 
			return dfr;
		
		dfr = new Class.Deferred();
		
		
		if (client == null) 
			client = require('socket.io-client');
		
		var port = config.port || 5777,
			url = 'http://localhost:%1/node'.format(port),
			
			socket = client.connect(url, {
				reconnection: true,
				reconnectionDelay: 1000,
				reconnectionDelayMax: 2000,
						
				'connect timeout': 2000,
				'force new connection': true
			});
		
		socket
			.on('connect', function() {
				dfr.resolve(socket)
			})
	
			.on('connect_error', function(error) {
				
				socket.disconnect();
				socket.removeAllListeners();
				
				dfr && dfr.reject(error);
			})
			
		
		return dfr;
	};
	
}());