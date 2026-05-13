export default {
    testEnvironment: 'node',
    collectCoverageFrom: [
        'controller/**/*.js',
        'Routes/**/*.js',
        'middleware/**/*.js',
    ],
    testMatch: ['**/__tests__/**/*.test.js'],
    testTimeout: 15000,
};
