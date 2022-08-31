import {
    Dialect
} from 'sequelize';

export type ConfigurationContainer = {
    [key: string]: DatabaseConfiguration | ApplicationConfiguration
};

export type DatabaseConfiguration = {
    username: string
    password: string
    host: string
    dialect: Dialect
    database: string
};

export type ApplicationConfiguration = {
    allowUserRegistration: boolean
    logLevel: string
    logFile: string
    logConsole: boolean
    jwtSecret: string
};