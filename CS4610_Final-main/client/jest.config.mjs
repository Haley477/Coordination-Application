/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
      "^.+\.tsx?$": ["ts-jest",{}],
    },
    setupFilesAfterEnv: ['./jest.setup.ts'],
    moduleNameMapper: {
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
    testMatch: ['**/?(*.)+(test).[jt]s?(x)'],
  };