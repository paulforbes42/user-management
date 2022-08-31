jest.mock('sequelize-typescript', () => {
    return {
        Sequelize: jest.fn(),
        ModelCtor: jest.fn(),
    };
});

jest.mock('../src/services/configuration/configuration-service', () => {
    return {
        getConfiguration: jest.fn(),
    };
});

describe('DatabaseService', () => {
    let sequelize: any;
    let DatabaseService: any;
    let ConfigurationService: any;
    let models: any;

    beforeEach(() => {
        jest.resetModules();
        models = {
            UserModel: jest.fn(),
        };
        ConfigurationService = require('../src/services/configuration/configuration-service');
        ConfigurationService.getConfiguration.mockReturnValue({
            host: 'a',
            database: 'b',
            dialect: 'c',
            username: 'd',
            password: 'e'
        });
        sequelize = require('sequelize-typescript');
        sequelize.Sequelize.mockImplementation(() => {
            return {
                models,
            }
        });
        
        DatabaseService = require('../src/services/database/database-service').default;
    });

    test('should connect to the database', () => {
        expect(DatabaseService).toBeTruthy();
        expect(sequelize.Sequelize).toHaveBeenCalledWith({
            host: 'a',
            database: 'b',
            dialect: 'c',
            username: 'd',
            password: 'e',
            models: expect.anything(),
        });
    });

    test('should get models', () => {
        const model = DatabaseService.getModel('UserModel');
        expect(model).toBe(models.UserModel);
    });
});