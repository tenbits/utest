var UTestBenchmark;

(function(){
	var _benchmark;
	var TIMEOUT = 10000;
	
	UTestBenchmark = {
		Static: {
			benchmark (model) {
				return _benchmark(model);
			},
			benchmarkVersions (model) {
				return _benchmark(model);
			}
		}
	};
	
	function _benchmark(model) {
		if (model.$config == null) {
			model.$config = {};
		}
		var utest = {
			$config: {
				timeout: model.$config.timeout || TIMEOUT
			},
			$before: _pipeDelegate(model, [
				Before.loadBenchmarkLibrary,
				Before.loadVersions,
				Before.configurate
			]),
			$after: model.$after
		};
		for (var suite in model) {
			utest[suite] = _benchmarkDelegate(model, suite, model[suite])
		}
		return UTest(utest);
	}
	
	var Before = {
		loadBenchmarkLibrary (model, next) {
			if (typeof require != null) {
				_benchmark = require('benchmark');
				next();
				return;
			}
			include
				.js('/.reference/atma_toolkit/node_modules/utest/node_modules/benchmark/benchmark.js')
				.done(resp => {
					_benchmark = resp.benchmark;
					next();
				});
		},
		loadVersions (model, next) {
			var versions = model.$config.versions;
			if (versions == null) {
				next();
				return;
			}
			
			model.$config.versionRepository = {};
			
			var keyValues = [], key, index = -1;
			for(key in versions) {
				keyValues.push({
					version: key,
					path: versions[key]
				});
			}
			function load(resp){
				var current;
				
				if (resp != null) {
					current = keyValues[index];
					
					var library;
					for(var key in resp) {
						library = resp[key];
					}
					if (library == null) {
						throw Error(`Module in 'versions' is not loaded. Version: ${current.version} in ${current.path}`);
					}
					model.$config.versionRepository[current.version] = library;
				}
				if (++index >= keyValues.length) {
					next();
					return;
				}
				current = keyValues[index];
				include
					.instance()
					.js(current.path)
					.done(load);
			}
			load();
		},
		configurate (model, next) {
			var $before = model.$config.$before;
			if ($before == null) {
				next();
				return;
			}
			if ($before.length === 0) {
				$before();
				next();
				return;
			}
			$before(next);
		}
	};
	
	function _pipeDelegate(model, arr) {
		return function (done) {
			var index = -1, imax = arr.length;
			function next() {
				if (++index >= imax) {
					done();
					return;
				}
				var fn = arr[index];
				if (fn == null) {
					next();
					return;
				}
				fn(model, next);
			}
			next();
		};
	}
	
	
	function _benchmarkDelegate (model, name, fns) {
		return function (done) {

			var suite = new _benchmark.Suite(name, {
				onError: assert.avoid('Benchamrk.OnError')
			});
			
			for (var key in fns) {
				suite.add(key, _getFn(key, fns));
			}
			suite
				.on('start', () => logger.log(`Benchmark started '${name.bold}'`))
				.on('cycle', (event) => logger.log(event.target.toString()))
				.on('teardown', model.$teardown)
				.on('complete', (event) => {
					
					Array
						.from(suite.sort((a, b) => {
							 a = a.stats; b = b.stats;
							return a.mean + a.moe > b.mean + b.moe ? 1 : -1;
						}))
						.map(x => x.toString())
						.forEach((x, i) => logger.log(((i + 1) + '. ').bold.green + x));
					
					// Fake some test to make the benchmark pass, as for now, benchmarks do not perform any unit tests;
					assert.equal(true, true);
					done(suite);
				});
				
			suite.run(model.$config.benchmarkOptions);
		};
		
		function _getFn(key, fns) {
			var verRepo = model.$config.versionRepository;
			if (verRepo == null) {
				return fns[key];
			}
			var match = /^[\d+\.]+/.exec(key);
			var version = match && match[0] || key;
			var lib = verRepo[version];
			if (lib == null) {
				throw Error(`Version Library is not defined ${version}`);
			}
			
			var fn = fns[key];
			return function(){
				fn(lib);
			};
		}
	}
	
	
}());