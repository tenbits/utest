/**
 *	IncludeJSBuild
 *
 *	``` $ includejs build.js ```
 **/

/**
 *
 *	```/lib/utest.browser.js```
 *	Browser testing suite - is loaded with ijs server controller
 **/


/**
 *
 *	```/lib/utest.node.js```
 *  - nodejs testing - direct action "test"
 *	- nodejs testing - client for browser
 **/

/**
 *
 *	```/lib/env/**```
 *  - server for utest browser slave
 **/


module.exports = {
	'settings': {
		io: {
			extensions: {
				js: ['condcomments:read', 'importer:read']
			}
		}
	},
	'import': {
		files: 'builds/**',
		output: 'lib/'
	},
	'copy': {
		files: {
			'src/env/**': 'lib/env/**'
		}		
	},

	'watch': {
		files: 'src/**',
		actions: ['import', 'copy']
	},
	
	'defaults': ['import', 'copy']
};
