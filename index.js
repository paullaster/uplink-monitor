/*
*This is the primary file for the API

*/

//Dependecies

const http = require('http');
const  url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;



//the server should repsond to all request with a string

const server = http.createServer((req,res) =>{
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
            'payload': buffer
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
            res.writeHead(statusCode);
            res.end(payloadString);
            //Log the reponse path
            console.log("We are returning this response: ", statusCode, payloadString);
          });
        
        });

});

// Start the server and have it listen on port 5000
server.listen(5000,()=>{
    console.log("the server is listening on port 5000")
});

//Define Handlers
let handlers ={};
//sample handler
handlers.sample = (data, cb)=>{
//Call back HTTP status code, and a payload object
cb(406, {'name': "sample handler"});
};

//Not found handler
handlers.notFound = (data, cb) =>{
cb(404);
};

//Define the request router
const router ={
  "sample" : handlers.sample
};