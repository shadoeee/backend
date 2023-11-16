const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

const PORT = 3000;

// Define the root directory
const root = __dirname;

app.get('/', function(request, response) {
  let html = "";
  html += "<h1>Welcome to Filesystem API</h1>"
  html += "<a href=\"/readfiles\">Read Files</a> | "
  html += "<a href=\"/createfile\">Create Files</a>"
  response.set('Content-Type', 'text/html');
  response.send(html)
});

app.get('/readfiles', function (request, response) {
  fs.readdir(path.join(root, "files/"), "utf-8", (err, dirContent) => {
    if (err) {
      console.error(err);
      response.status(404).send('Error reading directory');
      return;
    }
    console.log(dirContent);
    response.send(dirContent);
  });
});

app.get('/createfile', function (request, response) {
  const today = new Date();
  let current_date = `${today.getDate()}-${today.toLocaleString("en-IN", {
    month: "long",
  })}-${today.getFullYear()}`;
  let current_time = `${today.getHours()}-${today.getMinutes()}-${today.getSeconds()}`;

  const fileName = current_date + "-" + current_time + ".txt"; 
  const filePath = path.join(root, "files/", fileName);

  fs.writeFile(filePath, today.toLocaleString(), (err) => {
    if (err) {
      console.error(err);
      response.status(404).send('Error creating file');
      return;
    }
    console.log("File Created Successfully at:", filePath);
    response.send('File created with filename ' + fileName + '<br> <a href="/">Go Back</a>');
  });
});

app.listen(PORT, () => console.log("Server is started in "+ PORT));
