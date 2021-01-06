/*
*These are the request handlers
*
*/




//Dependencies
const _data = require('./data');
const helpers = require('./helpers');

//Define Handlers
let handlers ={};
// //sample handler
//  handlers.sample = (data, cb)=>{
// // //Call back HTTP status code, and a payload object
//  cb(406, {'name': "sample handler"});
//  };

//Users
handlers.users = (data, cb) =>{
    let acceptableMethods = ['post', 'get', 'put', 'delete'];
    if(acceptableMethods.indexOf(data.method) = -1){
        handlers._users[data.method](data, cb);
    }else{
        cb(405);
    }
};

//Container for the users submethods
handlers._users = {};

//Users - POST
//Required fields : firstName, lastName, phone, password, tosAgreement
//Optional data: none
handlers._users.post =(data, cb) =>{
//Check that all required fields are filled out
let firstName =typeof(data.payload.firstName) ==='string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
let lastName =typeof(data.payload.lastName) ==='string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
let phone =typeof(data.payload.phone) ==='string' && data.payload.phone.trim().length >  10 ? data.payload.phone.trim() : false;
let password =typeof(data.payload.password) ==='string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
let tosAgreement =typeof(data.payload.tosAgreement) ==='boolean' && data.payload.tosAgreement === true ? true : false;

if(firstName && lastName && phone && password && tosAgreement){
    //Making sure that the users does not already exist
    _data.read('users', phone, (err, data) =>{
        if(err){
            //Hash the password
            let hashedPassword = helpers.hash(password);

            //Create the user object
            if(hashedPassword){
                let userObject = {
                    'firstName': firstName,
                    'lastName' : lastName,
                    'phone' : phone,
                    'hashedPassword': hashedPassword,
                    'tosAgreement': true
                };
    
                //Store the user
                _data.create('users',phone, userObject, (err) =>{
                    if(!err){
                        cb(200, {'Message': "User created successfully "});
                    }else{
                        console.log(err);
                        cb(500, {'Error': "Could not create the new user"});
                    }
                });
            }else{
                cb(500, {'Error': "Could not not hash the user\'s password"});
            }
           
        }else{
            //USer with phone number already exist
            cb(400, {'Error': "A user with that phone number already exist"});
        }
    });
}else{
    cb(400, {'Error': "Missing required fields"});
}


};

//Users -GET
handlers._users.get =(data, cb) =>{

};

//Users -PUT
handlers._users.put =(data, cb) =>{

};

//Users -DELETE
handlers._users.delete =(data, cb) =>{

};

//Ping handler
handlers.ping = (data, cb) =>{
 cb(200);
};

//Not found handler
handlers.notFound = (data, cb) =>{
cb(404);
};



//Export Handlers
module.exports = handlers;