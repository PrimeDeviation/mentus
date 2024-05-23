const path = require('path');

module.exports = {
    entry: {
        popup: './src/popup/popup.js',
        background: './src/background/background.js',
        content: './src/content/content.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    }
};
