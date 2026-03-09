export default {
    testEnvironment: 'node',
    transform: {},
    moduleFileExtensions: ['js', 'json', 'node'],
    roots: ['<rootDir>/tests'],
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    testTimeout: 30000,
};
