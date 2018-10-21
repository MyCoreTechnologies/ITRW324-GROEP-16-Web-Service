//Console.log to say the server.js file has started
console.log('Server.js Accessed');

//Constant variables and variables for all used api's and directories along with the port number that wil be listen to
const http = require('http');
const app = require('./app');
const port = process.env.PORT || 3000;
const server = http.createServer(app);

//Setting the servert to listen on the port
server.listen(port);
//Console.log to show what port the server is on.
console.log('Server is listening on port number: ' + port)