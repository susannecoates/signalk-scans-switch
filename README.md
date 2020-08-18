![SCANS Logo](https://susannecoates.net/sites/default/files/2020-08/scans_logo.jpg)
# SignalK SCANS Switch
SignalK Node.js plugin for controlling switches connected to GPIO pins on the Raspberry Pi. 

## LICENSE
scans_signalk_swich is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation in version 3 of the License. \

scans_signalk_switch is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.\

You should have received a copy of the GNU General Public License along with scans_signalk_switch.  If not, see <https://www.gnu.org/licenses/>.\

## Installation
This short tutorial assuem you an installed and working signalK Node JS server. If not, the software and instructions for doing this are here: https://github.com/SignalK/signalk-server-node \

Plugins are installed in the node_modules directory inside SignalK server's configuration directory ($HOME/.signalk by default). \

    $ cd ~/.signalk/node_modules
    $ git clone https://github.com/susannecoates/signalk_scans_switch.git

## Controlling digital switches on the Raspberry PI
Generate a version 4 UUID on the RPI command line by typing:\

    uuid

which will produce output like this:\

    fddd9e58-e0e7-11ea-b681-07151df731b6

This UUID will be used as the requestID for the next step. Now you need to get authenticate with the server and get a token. 

if your SignalK server is at 192.168.1.10, and your user name on the server is system, and your password is system123, then 
Using cURL this would look like:

    curl -X POST \
      http://192.168.1.10/signalk/v1/auth/login \
      -H 'cache-control: no-cache' \
      -H 'content-type: application/json' \
      -d '{
      "requestId": "fddd9e58-e0e7-11ea-b681-07151df731b6",
      "username": "system",
      "password": "system123"
    }'

or in NodeJS this would look like

    var http = require("http");

    var options = {
      "method": "POST",
      "hostname": "192.168.1.10",
      "port": null,
      "path": "/signalk/v1/auth/login",
      "headers": {
        "content-type": "application/json",
        "cache-control": "no-cache",
      }
    };

    var req = http.request(options, function (res) {
      var chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function () {
        var body = Buffer.concat(chunks);
        console.log(body.toString());
      });
    });

    req.write(JSON.stringify({ requestId: 'fddd9e58-e0e7-11ea-b681-07151df731b6',
      username: 'system',
      password: 'system123' }));
    req.end();

Whichever method you choose to use the server should respond back (in JSON format) with the token.

    {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InN5c3RlbSIsImlhdCI6MTU5NzcxMDY0MCwiZXhwIjoxNTk3Nzk3MDQwfQ.hHYmpHmIyONFVUClhnXAPGP81-s1PU90ae8D-bLllGw"
    }
