/*
*This is the primary file for the API

*/

//Dependecies

const http = require('http');
const  url = require('url');



//the server should repsond to all request with a string

const server = http.createServer((req,res) =>{
       //Get the URL and parse it
        const parsedUrl = url.parse(req.url,true);


        //Get the path
        const path = parsedUrl.pathname;
        const trimedPath = path.replace(/^\/+|\/+$/g, '');
        const method = req.method.toLocaleLowerCase();



        //Send the response
          res.end('Hello Paullaster')




        //Log the reponse path

        console.log("request is received on this path", trimedPath + " with" , method +" method")
});

// Start the server and have it listen on port 5000
server.listen(5000,()=>{
    console.log("the server is listening on port 5000")
})