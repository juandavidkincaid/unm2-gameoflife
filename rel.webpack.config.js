const path = require('path');
const fs = require('fs-extra');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');


const prodOrDev = (a, b)=>{
    return process.env.NODE_ENV === 'production' ? a : b;
};

const baseConfig = {
    module: {
        rules: [
            {
                test: /\.svg$|\.ttf$|\.njk$|\.jpg$|\.png$/i,
                type: 'asset/resource',
                generator: {
                    filename: '[hash][ext]'
                }
            },
            {
                test: /\.(ts)$/i,
                exclude: [
                    path.resolve(__dirname, 'src/res'),
                    /(node_modules|bower_components)/,
                ],
                use: [
                    {
                        loader: "babel-loader",
                        options:{
                            plugins: [
                                "@babel/plugin-proposal-optional-chaining",
                                "@babel/plugin-proposal-nullish-coalescing-operator"
                            ]
                        }
                    },
                    {
                        loader: "ts-loader",
                        options:{
                            
                        }
                    }
                ]
            },
            {
                test: /\.(tsx)$/i,
                exclude: [
                    path.resolve(__dirname, 'src/res'),
                    /(node_modules|bower_components)/,
                ],
                use: [
                    {
                        loader: "babel-loader",
                        options:{
                            presets: ["@babel/preset-react"],
                            plugins: [
                                "@babel/plugin-proposal-optional-chaining",
                                "@babel/plugin-proposal-nullish-coalescing-operator",
                                prodOrDev(false, require("react-refresh/babel"))
                            ].filter(Boolean)
                        }
                    },
                    {
                        loader: "ts-loader",
                        options:{
                            
                        }
                    }
                ]
            }
        ]
    },
    resolve:{
        alias:{
            /*Commons: path.resolve(__dirname, 'src/Commons'),*/
            '@gof-src': path.resolve(__dirname, 'src'),
            '@gof-core': path.resolve(__dirname, 'src/core'),
            '@gof-util': path.resolve(__dirname, 'src/util'),
            '@gof-abs': path.resolve(__dirname, 'src/abs'),
            '@gof-res': path.resolve(__dirname, 'src/res'),
            '@gof-styling': path.resolve(__dirname, 'src/styling'),
            '@gof-components': path.resolve(__dirname, 'src/components'),
            '@gof-modules': path.resolve(__dirname, 'src/modules'),
            'momentz': 'moment-timezone'
        },
        extensions: ['.js', '.json', '.ts', '.tsx']
    }
};


const clientConfig = Object.assign({}, baseConfig, {
    entry: {
        lib: './src/app.tsx'
    },
    output:{
        path: path.join(process.cwd(), './dist'),
        library: {
            name: 'unm2-gameoflife',
            type: 'umd'
        },
        filename: prodOrDev('[chunkhash].[fullhash].js', '[name].js'),
        chunkFilename: prodOrDev('[chunkhash].[fullhash].js', '[name].js'),
        publicPath: '/static/client/',
        devtoolModuleFilenameTemplate: 'file:///[absolute-resource-path]'
    },
    devtool: "source-map",
    devServer: prodOrDev(undefined, {
        contentBase: '/static/client/',
        hot: true
    }),
    optimization:{
        
    },
    plugins: [
        new CleanWebpackPlugin({
            dry: process.env.NODE_ENV === 'development'
        }),
        new MomentLocalesPlugin({
            localesToKeep: ['es-us', 'en', 'es']
        }),
        new webpack.DefinePlugin({
            PKG_VRS: JSON.stringify(require("./package.json").version)
        }),
        prodOrDev(false, new webpack.HotModuleReplacementPlugin()),
        prodOrDev(false, new ReactRefreshWebpackPlugin()),
        !!process.env.ANALYZE_BUNDLE && new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: path.resolve(__dirname, 'server-report.html')
        })
    ].filter(Boolean)
});


module.exports = [clientConfig];
