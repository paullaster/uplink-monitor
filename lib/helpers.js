/*
*Helpers for various tasks
*
*/

//Dependencies
const  crypto = require('crypto');
const config = require('./config');


//Container for all the helpers
let helpers = {};

//Create a SHA256 hash
helpers.hash = (str) =>{
 if(typeof(str) ==='string' && str.length > 0){
    let hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    return hash;
 }else{
     return false;
 }
};










//Export the module
module.exports = helpers;