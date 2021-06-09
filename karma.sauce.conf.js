/* eslint-env node */
const { createDefaultConfig } = require('@open-wc/testing-karma');
const merge = require('deepmerge');

const customLaunchers = {
	chrome: {
		base: 'SauceLabs',
		browserName: 'chrome',
		platform: 'macOS 11.00',
	},
	firefox: {
		base: 'SauceLabs',
		browserName: 'firefox',
		platform: 'macOS 11.00'
	},
	edge: {
		base: 'SauceLabs',
		browserName: 'microsoftedge',
		platform: 'Windows 10'
	},
	safari: {
		base: 'SauceLabs',
		browserName: 'safari',
		platform: 'macOS 11.00'
	}
};

module.exports = config => {
	config.set(
		merge(createDefaultConfig(config), {
			files: [
				'./test/global-variables-for-test.js',
				// runs all files ending with .test in the test folder,
				// can be overwritten by passing a --grep flag. examples:
				//
				// npm run test -- --grep test/foo/bar.test.js
				// npm run test -- --grep test/bar/*
				{ pattern: config.grep ? config.grep : 'test/**/*.test.js', type: 'module' },
			],
			// see the karma-esm docs for all options
			esm: {
				// if you are using 'bare module imports' you will need this option
				nodeResolve: true,
			},
			sauceLabs: {
				testName: 'Unit Tests'
			},
			customLaunchers: customLaunchers,
			browsers: Object.keys(customLaunchers),
			reporters: ['dots', 'saucelabs'],
			browserNoActivityTimeout: 100000,
			singleRun: true,
			client: {
				mocha: {
					timeout : 5000 // default 2000
				}
			},
			hostname: '127.0.0.1'
		}),
	);
	return config;
};
