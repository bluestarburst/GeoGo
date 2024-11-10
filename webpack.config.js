const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
    const config = await createExpoWebpackConfigAsync(env, argv);

    // Customize the config before returning it.
    if (env.mode === 'production') {
        config.output.publicPath = '/geogo/';
    }

    return config;
};