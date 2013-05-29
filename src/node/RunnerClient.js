var RunnerClient = Class({
	Base: Runner,
	Construct: function(){
		
	},
	run: function(done) {
		
		this.run = this.runTests;
		
		var that = this,
			confit = this.config,
			port = config.port || 5777,
			util = require('util'),
			io_client = require('socket.io-client'),
			io_url = 'http://localhost:%1/node'.format(port),
			socket = io_client.connect(io_url, {
				'connect timeout': 2000
			});

		this.socket = socket;
		this.status = status_connecting;

		socket
			.on('connect', function() {
			Log('utest - connected to server - ', 90);

			that.status = status_connected;
			that.runTests();
		})

		.on('error', function() {
			done(
				'Test server connection error - http://localhost:%1/test'
				.format(port));
		})

		.on('server:utest:end', this.onComplete.bind(this))

		.on('server:error', function(message) {
			done(message);
		})

		.on('server:log', function(type, args) {
			var fn = console[type] || console.log;

			fn.apply(console, args);
		})

		.on('slave:start', function(stats) {
			var message = '\n#{browser.name} #{browser.version}'.bold;
			console.log(message.format(stats.userAgent));
			console.log('');
		})
			.on('slave:end', function(stats) {
			console.log('\nSlave completed'[stats.failed ? 'red' : 'green']);
		})

		.on('slave:error', function(error) {
			console.error(error);
		})

		.on('slave:assert:failure', function(args) {
			var data = args[0];
			
			that.onFailure(data);
			
		})

		.on('slave:assert:success', that.onSuccess.bind(that));
	},

	runTests: function() {
		console.log('.. running tests');
		switch (this.status) {
			case status_blank:
			case status_connected:
			case status_ready:
				this.status = status_testing;
				this.socket.emit('client:utest', this.config);
				return;
		}
		console.warn('Server is not ready');
	}
});