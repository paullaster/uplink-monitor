/*
*Create and export configuration variables
*
*
*
*/
//Container for all the enviroments
let environment = {};

//Staging (Default) environment
environment.staging = {
    'httpPort': 5000,
    'httpsPort': 5001,
    'envName': "Staging"
}

//Production environment
environment.production = {
    'httpPort': 5500,
    'httpsPort' : 5501,
    'envName': "Production"
}

//Determine which environment was passed as command-line argument
let currentEnvironment = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLocaleLowerCase():'';

//Check that the current environment is one of the environment above, if not, default to staging
let environmentToExport = typeof(environment[currentEnvironment]) === 'object' ? environment[currentEnvironment] : environment.staging;

//Export the module
module.exports = environmentToExport;