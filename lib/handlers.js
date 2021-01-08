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
    if(acceptableMethods.indexOf(data.method) > -1){
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
let phone =typeof(data.payload.phone) ==='string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false;
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
//Required data: phone
//Optional data: none
// @TODO only let an authenitcated users access the object and don't let them access any one else's
handlers._users.get =(data, cb) =>{
    //Check if the phone number is valid
    let phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length ===10 ? data.queryStringObject.phone.trim() : false;
    if(phone){
        //Look up the user
        _data.read('users', phone, (err, data) =>{
            if(!err && data){
                //Remove the hashed password from the user object before returning it to the requester
                delete data.hashedPassword;
                cb(200, data);
            }else{
                cb(404, {'Error': "User with that phone number does not exist"});
            }
        });
    }else{
        cb(400, {'Error': "Missing the Phone number field"});
    }
};

//Users -PUT
//Require data: phone
//Optional data: firstName, lastName, password (at least one must be specified)
// @TODO oOnly let an authorized use updat their own object. Don't let them update any one else's
handlers._users.put =(data, cb) =>{
    //Check for the required field
    let phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false;
    //Check for the optional field
    let firstName =typeof(data.payload.firstName) ==='string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    let lastName =typeof(data.payload.lastName) ==='string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    let password =typeof(data.payload.password) ==='string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    
    //Error if the phone is invalid
    if(phone){
        //Error if nothing is sent to update
        if(firstName || lastName || password){
            //Look up the user
            _data.read('users', phone, (err, userData) =>{
                if(!err && userData){
                    //Update the neccessary fields
                    if(firstName){
                        userData.firstName = firstName;
                    }
                    if(lastName){
                        userData.lastName = lastName;
                    }
                    if(password){
                        userData.hashedPassword = helpers.hash(password);
                    }
                    //Store new updates
                    _data.update('users', phone, userData, (err) =>{
                        if(!err){
                            cb(200, {'Message' :"User updated successfully"});
                        }else{
                            console.log(err);
                            cb(500, {'Error': "Could not update the user"});
                        }
                    });
                }else{
                    cb(400, {'Error': "The specified user does not exist"});
                }
            });
        }else{
            cb(400, {'Error': "Missing the field to update"});
        }

        

    }else{
        cb(400, {'Error': "Missing the phone number field"});
    }
};

//Users -DELETE
//Required field: phone
// @TODO only let authenticated user delete their object . Don't let them delete anyone else's
//@TODO Cleanup (dlete) any other data files associated with this user
handlers._users.delete =(data, cb) =>{
    //Check that the phone is valid
    let phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length ===10 ? data.queryStringObject.phone.trim() : false;
    if(phone){
        //Look up the user
        _data.read('users', phone, (err, data) =>{
            if(!err && data){
                _data.delete('users', phone, (err) =>{
                    if(!err){
                        cb(200, {'Message': "User deleted successfully"});
                    }else{
                        cb(500, {'Error': "Could not delete this spceified user"});
                    }
                });
            }else{
                cb(404, {'Error': "Could not find the specified user"});
            }
        });
    }else{
        cb(400, {'Error': "Missing the Phone number field"});
    }
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