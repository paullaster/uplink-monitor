/*
*Library for storing and editing data
*
*/

//Dependencies
const fs = require('fs');
const path = require('path');



//Container for the module (To beexported)
let lib = {};

//Base directory of the data folder
lib.baseDir = path.join(__dirname, '/../.data/');

//Write data t oa file
lib.create = (dir, file, data, cb) =>{
    //Open the file for writing
    fs.open(lib.baseDir+dir+'/'+file+'.json','wx', (err, fileDescriptor) =>{
        if(!err && fileDescriptor) {
            //Convert data String
            let StringData = JSON.stringify(data);

            //Write to file and close it
            fs.writeFile(fileDescriptor, StringData, (err) =>{
                if(!err){
                    fs.close(fileDescriptor, (err) =>{
                        if(!err){
                            cb(false);
                        }else{
                            cb("Error Closing new file");
                        }
                    });
                }else{
                    cb("Error writing to new file");
                }
            });
        }else{
            cb("Error creating new file, It may already exist");
        }
    });
};

//Read data from a file
lib.read = (dir, file, cb) =>{
    fs.readFile(lib.baseDir+dir+'/'+file+'.json','utf-8', (err, data)=>{
        cb(err, data);
    });
};

//Update existing fie
lib.update = (dir, file, data, cb)=>{
 //Open the file for writing
 fs.open(lib.baseDir+dir+'/'+file+'.json','r+', (err,fileDescriptor) =>{
    if(!err && fileDescriptor){

        //Convert the data to string
        let stringData = JSON.stringify(data);

        //Truncate the file
        fs.ftruncate(fileDescriptor, (err) =>{
            if(!err){
                //Write to file and close it
                fs.writeFile(fileDescriptor, stringData, (err) =>{
                    if(!err){
                        fs.close(fileDescriptor, (err)=>{
                            if(!err){
                                cb(false);
                            }else{
                                cb('There was error closing the existing file');
                            }
                        });
                    }else{
                        cb('Error writing to existing file!')
                    }
                });
            }else{
                cb('Error Truncating file!');
            }
        });

    }else{
        cb('Could not open the file for updating, It may not exist');
    }
 });
};

//Delete a file
lib.delete = (dir,file,cb) =>{
//Unlink file
fs.unlink(lib.baseDir+dir+'/'+file+'.json', (err) =>{
    if(!err){
        cb(false);
    }else{
        cb('Error deleting file');
    }
});

};

//Export the module
module.exports = lib;

