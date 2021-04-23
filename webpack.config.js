const path = require("path");
const HtmlWebPackPlugin = require('html-webpack-plugin');

module.exports = {
    devtool: "eval",
    mode: "development",
    entry: [
        "./src/app.ts"
    ],
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                include: [
                    path.resolve(__dirname, "src")
                ],
                sideEffects: true
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
        extensions: [".ts", ".js"],
        // fallback: {
        //     "crypto": require.resolve("crypto-browserify"),
        //     "buffer": require.resolve("buffer"),
        // },
        fallback: { "crypto": false }
    },
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist"),
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: './src/index.html',
            filename: './index.html'
        })
    ],
    optimization: {
 
    },
    target: 'web',

    watchOptions: {
        aggregateTimeout: 300,
        poll: 1000
    }
}