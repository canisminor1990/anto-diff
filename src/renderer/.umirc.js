import { join } from 'path';
import slash from 'slash';

export default {
	outputPath: '../../app/dist/renderer',
	publicPath          : './public',
	history         : "hash",
	theme     : {
		'@primary-color'     : '#1964ff',
		'@white'             : '#000',
		'@black'             : '#fff',
		'@normal-color'      : '#999',
		'@body-background'   : '#222',
		'@border-color-base' : '#333',
		'@border-color-split': '#333',
		'@btn-default-bg'    : 'rgba(255,255,255,.05)',
		'@btn-default-border': 'rgba(255,255,255,.4)'
	},
	plugins   : [
		[
			'umi-plugin-react', {
			dva : {
				immer: true
			},
			antd: true
		}
		]
	],
	externals(context, request, callback) {
		const isDev    = process.env.NODE_ENV === 'development';
		let isExternal = false;
		const load     = [
			'electron',
			'fs',
			'path',
			'os',
			'url',
			'child_process'
		];
		if (load.includes(request)) {
			isExternal = `require("${request}")`;
		}
		const appDeps = Object.keys(require('../../app/package').dependencies);
		if (appDeps.includes(request)) {
			const orininalPath    = slash(join(__dirname, '../../app/node_modules', request));
			const requireAbsolute = `require('${orininalPath}')`;
			isExternal            = isDev ? requireAbsolute : `require('${request}')`;
		}
		callback(null, isExternal);
	}
};
