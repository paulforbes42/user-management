import fs from 'fs';
import path from 'path';
import getENV from '../../utils/get-env';
import {
    ConfigurationContainer,
} from './types';

/**
 * Service to read configuration files from the file system and distribute them to functionality in the application
 */
export default class ConfigurationService {

    /**
     * Cache of parsed configuration files
     */
    private static configurations: ConfigurationContainer = {};

    /**
     * Read configuration files from the file system
     * 
     * @param fileName Name of file to be read from the `config/` directory. i.e. `db.json`
     */
    private static loadConfigurationFile(fileName: string): void {
        const configPath = path.join(__dirname, '..', '..', '..', 'config', fileName);
        const env = getENV('NODE_ENV', 'development');
        const configContent = fs.readFileSync(configPath, 'utf-8');
        const config = JSON.parse(configContent)[env];

        this.configurations[fileName] = config;
    }
   
    /**
     * Retrieve a configuration object defined in a file in the `config/` directory
     * 
     * @param fileName Name of file to be read from the `config/` directory. i.e. `db.json`
     * @returns Configuration object
     */
    public static getConfiguration(fileName: string) {
        if(!this.configurations[fileName])
            this.loadConfigurationFile(fileName);

        return this.configurations[fileName];
    }

    /**
     * Collect a single value from a configuration file
     * 
     * @param fileName Configuration file name to extract the value from
     * @param fieldName Name of the value to extract from the configuration
     * @returns Value from the configuration file
     */
    public static getConfigurationValue(fileName: string, fieldName: string): any {
        const config = this.getConfiguration(fileName);
        return config[fieldName as keyof typeof config];
    }
}