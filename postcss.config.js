const autoprefixer = require('autoprefixer');

module.exports = {
    syntax: 'postcss-scss',
    plugins: [
        autoprefixer({ 
            flexbox: true,
            overrideBrowserslist: ['> 1%', 'last 3 versions', 'Firefox >= 20', 'iOS >=7']
        }),
    ]
}