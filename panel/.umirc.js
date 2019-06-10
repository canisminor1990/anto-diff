export default {
	history         : "hash",
	publicPath          : './public',
	outputPath          : '../panel-dist',
	theme               : {
		'@primary-color'      : '#1964ff',
		'@collapse-header-bg' : 'rgba(255,255,255,.05)',
		'@collapse-content-bg': '#282828',
		'@white'              : '#000',
		'@black'              : '#fff',
		'@normal-color'       : '#999',
		'@body-background'    : '#222',
		'@border-color-base':"#333",
		"@border-color-split":"#333"
	},
	plugins             : [
		[
			'umi-plugin-react', {
			dva: {
				immer: true,
			},
			antd: true,
		}
		]
	]
};
