import path from 'path';
import {
    Sequelize, 
    ModelCtor
} from 'sequelize-typescript';
import ConfigurationService from '../configuration/configuration-service';
import { 
    DatabaseConfiguration,
} from '../../services/configuration/types';

/**
 * Service to facilitate the database connection and distributing models to the application
 */
class DatabaseService {

    /**
     * Reference to the database connection
     */
    private db: Sequelize;

    constructor() {
        const config = <DatabaseConfiguration>ConfigurationService.getConfiguration('db.json');
        const modelPath = path.join(__dirname, '..', '..', 'models');
        this.db = new Sequelize({
            host: config.host,
            database: config.database,
            dialect: config.dialect,
            username: config.username,
            password: config.password,
            models: [modelPath],
        });
    }

    /**
     * Retrieve a model from the active database connection
     * 
     * @param modelName Name of model
     * @returns Sequelize Model
     */
    getModel(modelName: string): ModelCtor {
        return this.db.models[modelName] as ModelCtor;
    }
}

export default new DatabaseService();