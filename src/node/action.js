(function() {
	
	var TestSuite = global.UTest;
		
	include.exports = {
		process: function(config, done) {

			config = prepairConfig(config);
			
			if (!(config.scripts && config.scripts.length)) {
				done('No scripts to test');
				return;
			}
			
			
			var Runner = config.browser ? RunnerClient : RunnerNode;
			
			new Runner(config).run(done);
		}
	};
	
	

	
	// import utils.js
	// import Runner.js
	// import RunnerClient.js
	// import RunnerNode.js
	
		
		
}());