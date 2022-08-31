jest.mock('fs', () => {
    return {
        readFileSync: jest.fn(),
    };
});
jest.mock('path', () => {
    return {
        join: jest.fn(),
    };
});

jest.mock('../src/utils/get-env', () => {
    return jest.fn();
});

describe('Configuration Service', () => {
    let getENV: any;
    let ConfigurationService: any;
    let path: any;
    let fs: any;

    beforeEach(() => {
        getENV = require('../src/utils/get-env');
        ConfigurationService = require('../src/services/configuration/configuration-service').default;
        path = require('path');
        fs = require('fs');
    });

    afterEach(() => {
        jest.resetModules();
    });

    test('should load a configuration file', () => {
        const mockJsonData = '{"development":{"test":1},"test":{"test":2}}';
        const mockJoin = jest.spyOn(path, 'join');
        mockJoin.mockReturnValueOnce('path/to/file');
        getENV.mockReturnValueOnce('test');

        const mockReadFileSync = jest.spyOn(fs, 'readFileSync');
        mockReadFileSync.mockReturnValueOnce(mockJsonData);

        const config: any = ConfigurationService.getConfiguration('test.json');

        expect(mockJoin).toHaveBeenCalled();
        const fileArg = mockJoin.mock.calls[0][5];
        expect(fileArg).toBe('test.json');
        expect(mockReadFileSync).toHaveBeenCalledWith('path/to/file', 'utf-8');

        expect(config.test).toBe(2);
    });

    test('should load a configuration file from memory after the first load', () => {
        const mockJsonData = '{"development":{"test":1},"test":{"test":2}}';
        const mockJoin = jest.spyOn(path, 'join');
        mockJoin.mockReturnValueOnce('path/to/file');
        getENV.mockReturnValueOnce('development');

        const mockReadFileSync = jest.spyOn(fs, 'readFileSync');
        mockReadFileSync.mockReturnValueOnce(mockJsonData);

        let config: any = ConfigurationService.getConfiguration('test.json');
        expect(config.test).toBe(1);

        let config2: any = ConfigurationService.getConfiguration('test.json');

        expect(mockReadFileSync).toHaveBeenCalledTimes(1);
        expect(config2.test).toBe(1);
    });

    test('should get a single value from a configuration file', () => {
        const mockJsonData = '{"development":{"test":1, "test2": 3},"test":{"test":2, "test2": 4}}';
        const mockJoin = jest.spyOn(path, 'join');
        mockJoin.mockReturnValueOnce('path/to/file');
        getENV.mockReturnValueOnce('development');

        const mockReadFileSync = jest.spyOn(fs, 'readFileSync');
        mockReadFileSync.mockReturnValueOnce(mockJsonData);

        let config: any = ConfigurationService.getConfigurationValue('test.json', 'test');
        expect(config).toBe(1);

        let config2: any = ConfigurationService.getConfigurationValue('test.json', 'test2');
        expect(config2).toBe(3);
    });
});