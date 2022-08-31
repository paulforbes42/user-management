/**
 * Retrieve an environment variable.  When that variable is not populated, return the `defaultValue` instead.
 * @param environmentVariableName Name of variable to collect from environment variables
 * @param defaultValue Value to return when the related environment variable is not defined
 * @returns environment variable value or `defaultValue`
 */
export default function getENV(environmentVariableName: string, defaultValue?: any): any {
    const isDefined = typeof process.env[environmentVariableName] !== 'undefined';
    return isDefined ? process.env[environmentVariableName] : defaultValue;
}