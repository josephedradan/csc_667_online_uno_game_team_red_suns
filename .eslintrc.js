/*

Reference:
    enforce a maximum line length (max-len)
        Reference:
            https://eslint.org/docs/rules/max-len

    Eslint: How to disable "unexpected console statement" in Node.js?
        Reference:
            https://stackoverflow.com/questions/34215526/eslint-how-to-disable-unexpected-console-statement-in-node-js
 */
module.exports = {
    env: {
        browser: true,
        commonjs: true,
        es2021: true,
        node: true,
    },
    extends: [
        'airbnb-base',
    ],
    parserOptions: {
        ecmaVersion: 'latest',
    },
    rules: {
        indent: ['error', 4],
        'consistent-return': 0,
        'no-unused-vars': 0,
        'no-console': 0,
        'max-len': [
            'error',
            {
                code: 200,
                // ignoreTrailingComments: true,
                // ignoreComments: true,
                // ignoreUrls: true,
            },
        ],
        'no-underscore-dangle': [
            'error',
            {
                allow: ['_wrapper'],
            },
        ],
        camelcase: ['off',
            {
                properties: 'never',
                ignoreDestructuring: true,
                ignoreGlobals: true,
                ignoreImports: true,
            },
        ],
        // 'brace-style': [1, '1tbs', { allowSingleLine: true }],
    },
};
