/*
*These are the request handlers
*
*/




//Dependencies
const { type } = require('os');
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
        cb(405, {'Error': "This is not acceptable method"});
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
handlers._users.get =(data, cb) =>{
    //Check if the phone number is valid
    let phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length ===10 ? data.queryStringObject.phone.trim() : false;
    if(phone){
        //Get the token from the headers
        let token = typeof(data.headers.token) === 'string' ? data.headers.token : false;
        //Verify that the given token is valid for the phone number
        handlers._tokens.verifyTokens(token, phone, (tokenIsValid) =>{
            if(tokenIsValid){
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
                cb(403, {'Error': "Missing required token in the header, or token is invalid"});
            }
        });
    }else{
        cb(400, {'Error': "Missing the Phone number field"});
    }
};

//Users -PUT
//Require data: phone
//Optional data: firstName, lastName, password (at least one must be specified)
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
           //Get the token from the headers
           let token = typeof(data.headers.token) === 'string' ? data.headers.token : false;
           //Verify that the given token is valid for the phone number
           handlers._tokens.verifyTokens(token, phone, (tokenIsValid) =>{
           if(tokenIsValid){
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
               cb(403, {'Error': "Missing required token in the header, or token is invalid"});
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
handlers._users.delete =(data, cb) =>{
    //Check that the phone is valid
    let phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length ===10 ? data.queryStringObject.phone.trim() : false;
    if(phone){
         //Get the token from the headers
         let token = typeof(data.headers.token) === 'string' ? data.headers.token : false;
         //Verify that the given token is valid for the phone number
         handlers._tokens.verifyTokens(token, phone, (tokenIsValid) =>{
         if(tokenIsValid){
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
            cb(403, {'Error': "Missing required token in the header, or token is invalid"});
         }
        });
    }else{
        cb(400, {'Error': "Missing the Phone number field"});
    }
};


//Tokens
handlers.tokens = (data, cb) =>{
    let acceptableMethods = ['post', 'get', 'put', 'delete'];
    if(acceptableMethods.indexOf(data.method) > -1){
        handlers._tokens[data.method](data, cb);
    }else{
        cb(405);
    }
};

//Container for all the tokens method
handlers._tokens ={};

//Tokens -post
//Required data: phone, password
//Optional data: none
handlers._tokens.post = (data, cb) =>{
    let phone =typeof(data.payload.phone) ==='string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false;
    let password =typeof(data.payload.password) ==='string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    if(phone && password){
        //Look up the user who matches the phone number
        _data.read('user', phone, (err, userData) =>{
            if(!err && userData){
                //Hash the sent password and compare it to the password stored in the user object
                let hashedPassword = helpers.hash(password);
                if(hashedPassword === userData.hashedPassword){
                    //If valid, create a new token with a random name. Set expiration date in 1 hour in the future
                    let tokenId = helpers.createRandomString(20);
                    let expires = Date.now() + 1000 * 60 * 60;

                    let tokenObject = {
                        'phone': phone,
                        'id': tokenId,
                        'expires': expires
                    };

                    //Store the token
                    _data.create('tokens', tokenId, tokenObject, (err) =>{
                        if(!err){
                            cb(200, tokenObject);
                        }else{
                            cb(500, {'Error':"Could not create a new token"});
                        }

                    });
                }else{
                    cb(400, {'Error': "Passowrd did not match the specified user\'s stored password"});
                }
            }else{
                cb(400, {'Error': "Could not find this specified user"});
            }
        });
    }else{
        cb(400, {'Error': "Missing required field"});
    }

};

//Tokens -
//Required data: id
//Optional data: none
handlers._tokens.get = (data, cb) =>{
    //Check that the id is valid
    let id = typeof(data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length ===20 ? data.queryStringObject.id.trim() : false;
    if(id){
        //Look up the token
        _data.read('tokens', id, (err, tokenData) =>{
            if(!err && tokenData){
                cb(200, tokenData);
            }else{
                cb(404, {'Error': "User with that id does not exist"});
            }
        });
    }else{
        cb(400, {'Error': "Missing the id field"});
    }

};

//Tokens -put
//Required field: id , extend
////Optional data: none
handlers._tokens.put = (data, cb) =>{
    let id =typeof(data.payload.id) ==='string' && data.payload.id.trim().length === 20 ? data.payload.id.trim() : false;
    let extend =typeof(data.payload.extend) ==='boolean' && data.payload.extend === true ? true : false;
    if(id && extend){
        //Look up the token
        _data.read('tokens', id , (err, tokenData)=>{
            if(!err && tokenData){
                //Check to ensure the token is not already expired
                if(tokenData.expires > Date.now()){
                    //Set an expiration 1 hour from now
                    tokenData.expires = Date.now() + 1000 * 60 * 60;

                    //Store he new updates
                    _data.update('token', id, tokenData, (err) =>{
                        if(!err){
                            cb(200, {'Message': "Expiration time extended successfully"});
                        }else{
                            cb(500, {'Error':"Could not update the token expiration"});
                        }
                    });
                }else{
                    cb(400, {'Error': "The token has already expired and cannot be extended"});
                }
            }else{
                cb(400, {'Error': "Sppecified token does not exit"});
            }
        });
    }else{
        cb(400, {'Error': "Missing required required field(s) or fields(s) are invalid"});
    }


};

//Tokens -delete
//Required data: id
//Optional data : none
handlers._tokens.delete = (data, cb) =>{
  //Check that the is is valid
  let id = typeof(data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length ===20 ? data.queryStringObject.id.trim() : false;
  if(id){
      //Look up the token
      _data.read('tokens', id, (err, data) =>{
          if(!err && data){
              _data.delete('tokens', id, (err) =>{
                  if(!err){
                      cb(200, {'Message': "Token deleted successfully"});
                  }else{
                      cb(500, {'Error': "Could not delete this spceified token"});
                  }
              });
          }else{
              cb(404, {'Error': "Could not find the specified token id"});
          }
      });
  }else{
      cb(400, {'Error': "Missing the token id field"});
  }
};

//Verify if a given id is currently valid for a given user
handlers._tokens.verifyTokens = (id, phone, cb) =>{
    //Loop up the token
    _data.read('tokens', id, (err, tokenData) =>{
        if(!err && tokenData){
            //Check that the token is for a given user and has not expired
            if(tokenData.phone === phone && tokenData.expires > Date.now()){
                cb(true);
            }else{
                cb(false);
            }
        }else{
            cb(false);
        }
    });
}


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