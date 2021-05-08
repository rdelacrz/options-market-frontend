/**
 * Set up for development work, because FAST_REFRESH and HMR logic is broken in original webpack file provided
 * by the create-react-app.
 */

const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');

process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

// ENV variables needs to be set before this is acquired
const getClientEnvironment = require('./env');

const paths = require('./paths');
const clientEnv = getClientEnvironment(paths.publicUrlOrPath.slice(0, -1));

module.exports = (env, argv) => {
    const isDev = argv.mode === 'development';
    const outputFolder =  isDev ? 'dist' : 'wwwroot';
    const fullOutputPath = path.resolve(process.cwd(), outputFolder);

    return {
        entry: paths.appIndexJs,
        module: {
            rules: [
                {
                    test: /\.[jt]sx?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                '@babel/react',
                                '@babel/typescript', 
                                [
                                    '@babel/env', 
                                    { 'modules': false },
                                ],
                            ],
                            plugins: [
                                'react-refresh/babel',      // For Fast Refresh
                                ['dynamic-import-node', {'noInterop': true }],
                                '@babel/plugin-proposal-class-properties',
                                ['@babel/plugin-transform-arrow-functions', { 'spec': true }],
                            ],
                        },
                    }
                },
                {
                    test: /\.scss$/,
                    use: [
                        'style-loader',
                        'css-loader',
                        'postcss-loader',
                        'sass-loader',
                        /*{
                            loader: 'sass-resources-loader',
                            options: {
                                resources: require(path.resolve(__dirname, `Frontend/styles/references.js`)),
                            },
                        },*/
                    ]
                },
                {
                    test: /\.(pdf|zip|xlsx?)$/,
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'documents/'
                    }
                },
                {
                    test: /\.(woff(2)?|ttf|otf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'fonts/'
                    }
                },
                {
                    test: /\.(png|jpe?g|gif)$/,
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'images/'
                    }
                },
                // Allows application to handle GraphQL files
                {
                    test: /\.(graphql|gql)$/,
                    exclude: /node_modules/,
                    loader: '@graphql-tools/webpack-loader',
                    options: {
                        /* ... */
                    }
                },
            ]
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.jsx'],
            plugins: [
                // Don't need to set aliases manually anymore - uses paths in tsconfig!
                new TsconfigPathsPlugin({
                    configFile: paths.appTsConfig
                }),
            ]
        },
        plugins: [
            new HtmlWebpackPlugin(
                Object.assign(
                  {},
                  {
                    inject: true,
                    template: paths.appHtml,
                  },
                  undefined
                )
            ),
            new CircularDependencyPlugin({
                // exclude detection of files based on a RegExp
                exclude: /a\.js|node_modules/,
                // include specific files based on a RegExp
                include: /src/,
                // add errors to webpack instead of warnings
                failOnError: true,
                // allow import cycles that include an asyncronous import,
                // e.g. via import(/* webpackMode: "weak" */ './file.js')
                allowAsyncCycles: false,
                // set the current working directory for displaying module paths
                cwd: process.cwd(),
            }),
            // Makes variables accessible in application
            new webpack.DefinePlugin({
                'process.env' : {
                    APP_PATH: JSON.stringify(env ? env.APP_PATH : ''),
                    MOCK: JSON.stringify(env ? env.MOCK || 'false' : 'false'),
                    IS_DEV: JSON.stringify(isDev ? 'true' : 'false'),
                }
            }),
            new CleanWebpackPlugin(),
            new InterpolateHtmlPlugin(HtmlWebpackPlugin, clientEnv.raw),
            new ReactRefreshWebpackPlugin(),
        ],
        output: {
            filename: '[name].bundle.js',
        },
        devtool: 'inline-source-map',
        devServer: {
            contentBase: fullOutputPath,
            port: 3000,
            historyApiFallback: true,
            watchOptions: {
                ignored: /node_modules/
            },
        },
        output: {
            path: fullOutputPath,
            publicPath: '/'
        }
    };
}