

var ServerUTest = Class({
	Base: __EventEmitter,
	Construct: function(sockets, logger) {
		this.index = 0;
		this.tunnels = ruqq.arr.map(sockets, function(x) {
			
			return new BrowserTunnel(x, logger)
				.on('start', this.pipe('slave:start'))
				.on('end', this.onEnd.bind(this))
				.on('error', this.onError.bind(this))
				.on('browser:assert:success', this.pipe('browser:assert:success'))
				.on('browser:assert:failure', this.pipe('browser:assert:failure'))
				.on('browser:utest:start', this.pipe('browser:utest:start'))
				
				;
				
		}.bind(this));
	},
	onEnd: function(tunnel, result) {
		this.trigger('slave:end', result);
		this.process();
	},
	onError: function(that, error){
		this.trigger('slave:error', { message: 'Slave error', slave: error });
		this.process();
	},
	stats: function(){
		return ruqq.arr.map(this.tunnels, function(x, index){
			index !== 0 && (delete x.result.resources);
			return x.result;
		});
	},
	
	run: function(config){
		this.index = -1;
		this.config = config;
		this.process();
		
	},
	process: function(){
		if (++this.index > this.tunnels.length - 1) {
			this.trigger('server:utest:end', this.stats());
			this.dispose();
			
			return;
		}
		
		this.tunnels[this.index].run(this.config);
	},
	
	dispose: function(){
		ruqq.arr.invoke(this.tunnels, 'dispose');
		this.tunnels = null;
	}
});
