const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const path = require('path')

module.exports = {
	stories: [
		'../stories/**/*.stories.mdx',
		'../stories/**/*.stories.@(js|jsx|ts|tsx)',
		'../components/**/*.stories.@(js|jsx|ts|tsx)',
	],
	addons: [
		'@storybook/addon-links',
		'@storybook/addon-essentials',
		'@storybook/addon-interactions',
		{
			name: 'storybook-addon-next',
			options: {
				nextConfigPath: path.resolve(__dirname, '../next.config.js'),
			},
		},
	],
	framework: '@storybook/react',
	core: {
		builder: '@storybook/builder-webpack5',
		disableTelemetry: true, // 👈 Disables telemetry
	},
	webpackFinal: async (config, { configType }) => {
		config.resolve.plugins = [new TsconfigPathsPlugin()]

		return config
	},
}
