module.exports = {
    parser: "babel-eslint",
    extends: 'airbnb',
    rules: {
        'no-console': 0,
        'object-curly-newline': ["error", { "multiline": true }],
        'import/extensions': 'ignorePackages',
        'no-plusplus': 0,
        'react/jsx-filename-extension': 0
    }
};