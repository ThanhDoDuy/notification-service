import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    verbose: true,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    testPathIgnorePatterns: ['/node_modules'],
    transform: {
        '^.+\\.ts?$': 'ts-jest'
    },
    testMatch: ['<rootDir>/test/**/*.ts'],
    collectCoverageFrom: ['test/**/*.ts', '!src/**/test/*.ts?(x)', '!**/node_modules/**'],
    coverageThreshold: {
    global: {
        branches: 1,
        functions: 1,
        lines: 1,
        statements: 1
    }
    },
    coverageReporters: ['text-summary', 'lcov'], // send code-coverage to view
    moduleNameMapper: {
        '@notifications/(.*)': ['<rootDir>/src/$1']
    }
};

export default config;