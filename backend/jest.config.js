/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/src/**/*.spec.ts', '<rootDir>/src/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        module: 'CommonJS',
        target: 'ES2022',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
      }
    }]
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Single setup file — runs before framework, only uses plain JS (no Jest globals)
  setupFiles: ['<rootDir>/src/tests/env.setup.ts'],
  // Silence verbose logs globally via jest config
  silent: false,
  clearMocks: true,
  restoreMocks: true,
  testTimeout: 15000,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/app.ts',
    '!src/docs/**',
    '!src/tests/**',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
  ],
};
