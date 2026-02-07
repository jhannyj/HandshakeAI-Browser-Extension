/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    setupFilesAfterEnv: ['jest-chrome'], // Automatically mocks the 'chrome' namespace
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
};