/*
*This is the primary file for the API

*/

//Dependecies

const http = require('http');
const https = require('https');
const  url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./lib/config');
const fs = require('fs');
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');
//const _data = require('./lib/data');

// //TESTING 
// // @TODO  comment out this
// _data.delete('test1','newfile', (err) =>{
//   console.log('There was an error', err );
// });

//the server should repsond to all request with a string
//Instanciating http server
const httpServer = http.createServer((req,res) =>{
     
unifiedServer(req, res);
});

// Start the http server 
httpServer.listen(config.httpPort,()=>{
    console.log("the server is listening on port", config.httpPort + " in", config.envName + " mode" )
});

//Instanciate the https server
let httpsServerOptions = {
 'Key':fs.readFileSync('./https/key.pem'),
 'cert':fs.readFileSync('./https/cert.pem')
};
const httpsServer = https.createServer(httpsServerOptions,(req,res) =>{
     
  unifiedServer(req, res);
  });


//Start the https server
httpsServer.listen(config.httpsPort,()=>{
  console.log("the server is listening on port", config.httpsPort + " in", config.envName + " mode" )
});


//All the server logic for both https and https

let unifiedServer = (req, res) =>{
    //Get the URL and parse it
    const parsedUrl = url.parse(req.url,true);


    //Get the path
    const path = parsedUrl.pathname;
    const trimedPath = path.replace(/^\/+|\/+$/g, '');

    //Get query string as an object
    const queryStringOject = parsedUrl.query;

    // Get the HTTP method
    const method = req.method.toLocaleLowerCase();

    //Get the header as an object
    const headers = req.headers;

    //Get the payload, if any
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) =>{
      buffer += decoder.write(data);
    });
    req.on('end',() =>{
      buffer += decoder.end();

      //Choose the handler this request should go to, If one is not found, use the not found handler
      let chosenHandler = typeof(router[trimedPath]) !== 'undefined' ? router[trimedPath] : handlers.notFound;

      //Construct the data object to send to the handler
      let data ={
        'trimedPath':trimedPath,
        'queryStringObject':queryStringOject,
        'method': method,
        'headers':headers,
        'payload': helpers.parseJsonToObject(buffer)
      };

      //Route the request to the handler specified in the router
      chosenHandler(data, (statusCode, payload) =>{
        //Use the status code called back bythe handler, or default to 200
        statusCode = typeof(statusCode) ==='number' ? statusCode : 200;
        //Use the payload called back by the handler, or default to empty object
        payload = typeof(payload) ==='object' ? payload :{};


        //Convert the payload to string
        let payloadString = JSON.stringify(payload);

        //Return the response
        res.setHeader('Content-type', 'application/json');
        res.writeHead(statusCode);
        res.end(payloadString);
        //Log the reponse path
        console.log("We are returning this response: ", statusCode, payloadString);
      });
    
    });
};





//Define the request router
const router ={
  // "sample" : handlers.sample,
 'ping' : handlers.ping,
 'users': handlers.users,
 'tokens': handlers.tokens
};