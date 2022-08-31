import getENV from '../src/utils/get-env';

describe('getENV utility function', () => {
    test('should collect an environment variable', () => {
        expect(getENV('NODE_ENV')).toBe('test');
    });

    test('should return a default value when an environment variable is not present', () => {
        expect(getENV('something', 'default')).toBe('default');
    });
});