const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

module.exports = {
    watch: true,
    mode: "development",
    devtool: 'eval',
    entry: [
        './src/app.ts',
        './src/template/styles.css',
    ],
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                include: [path.resolve(__dirname, 'src')],
            },
            {
                test: /\.html$/,
                use: [
                    { loader: 'html-loader', options: { minimize: false } }
                ]
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    output: {
        filename: '[name].[contenthash].js',
        path: path.resolve(__dirname, 'public'),
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: './src/template/index.html',
            filename: './index.html'
        }),
        new CleanWebpackPlugin(),
    ],
    optimization: {

    },
    target: 'web',
}