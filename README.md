![SCANS Logo](https://susannecoates.net/sites/default/files/2020-08/scans_logo.jpg)
# SignalK SCANS Switch
SignalK Node.js plugin for controlling switches connected to GPIO pins on the Raspberry Pi. The plugin allows you to make ReSTful calls

## LICENSE
scans_signalk_swich is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation in version 3 of the License. \

scans_signalk_switch is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.\

You should have received a copy of the GNU General Public License along with scans_signalk_switch.  If not, see <https://www.gnu.org/licenses/>.\

## Installation
This short tutorial assuem you an installed and working signalK Node JS server. If not, the software and instructions for doing this are here: https://github.com/SignalK/signalk-server-node \

Plugins are installed in the node_modules directory inside SignalK server's configuration directory ($HOME/.signalk by default). \

    $ cd ~/.signalk/node_modules
    $ git clone https://github.com/susannecoates/signalk_scans_switch.git

## Configuring the Plugin

![SCANS Plugin Configuration](https://susannecoates.net/sites/default/files/2020-08/plugin_configuration_1.jpg)

## Using the Plugin to Control Digital Switches

### RPI GPIO Testing Setup

### ReSTful Interactions with the SignalK Server
1. generate a version 4 UUID
Generate a version 4 UUID on the RPI command line by typing:\

    uuid

which will produce output like this:\

    fddd9e58-e0e7-11ea-b681-07151df731b6

This UUID will be used as the requestID for the next step. Now you need to get authenticate with the server and get a token. 

2. Get a token

if your SignalK server is at 192.168.1.10, and your user name on the server is system, and your password is system123, then 
Using cURL this would look like:

    <?php
    $curl = curl_init();
    curl_setopt_array($curl, array(
      CURLOPT_URL => "http://192.168.1.10/signalk/v1/auth/login",
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_ENCODING => "",
      CURLOPT_MAXREDIRS => 10,
      CURLOPT_TIMEOUT => 30,
      CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
      CURLOPT_CUSTOMREQUEST => "POST",
      CURLOPT_POSTFIELDS => "{\n  \"requestId\": \"fddd9e58-e0e7-11ea-b681-07151df731b6\",\n  \"username\": \"system\",\n  \"password\": \"system123\"\n}",
      CURLOPT_HTTPHEADER => array(
        "cache-control: no-cache",
        "content-type: application/json"
      ),
    ));
    $response = curl_exec($curl);
    $err = curl_error($curl);
    curl_close($curl);
    if ($err) {
      echo "cURL Error #:" . $err;
    } else {
      echo $response;
    }

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
    
3. Make a PUT request

Using cURL in PHP

    <?php
    $curl = curl_init();
    curl_setopt_array($curl, array(
      CURLOPT_PORT => "80",
      CURLOPT_URL => "http://192.168.1.10:80/signalk/v1/api/vessels/self/electrical/switches/platformlights.state",
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_ENCODING => "",
      CURLOPT_MAXREDIRS => 10,
      CURLOPT_TIMEOUT => 30,
      CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
      CURLOPT_CUSTOMREQUEST => "PUT",
      CURLOPT_POSTFIELDS => "{\n   \"value\": 1\n}",
      CURLOPT_HTTPHEADER => array(
        "cache-control: no-cache",
        "content-type: application/json",
        "token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InN5c3RlbSIsImlhdCI6MTU5NzcxMDY0MCwiZXhwIjoxNTk3Nzk3MDQwfQ.hHYmpHmIyONFVUClhnXAPGP81-s1PU90ae8D-bLllGw"
      ),
    ));
    $response = curl_exec($curl);
    $err = curl_error($curl);
    curl_close($curl);
    if ($err) {
      echo "cURL Error #:" . $err;
    } else {
      echo $response;
    }

In NodsJS

    var http = require("http");
    var options = {
      "method": "PUT",
      "hostname": "192.168.0.21",
      "port": "80",
      "path": "/signalk/v1/api/vessels/self/electrical/switches/platformlights.state",
      "headers": {
        "content-type": "application/json",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InN5c3RlbSIsImlhdCI6MTU5NzcxMDY0MCwiZXhwIjoxNTk3Nzk3MDQwfQ.hHYmpHmIyONFVUClhnXAPGP81-s1PU90ae8D-bLllGw",
        "cache-control": "no-cache",
        "postman-token": "bbb04c10-bca4-13e0-ef83-14d8a2099fa0"
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

    req.write(JSON.stringify({ value: 1 }));
    req.end();
    }
    
If successful, the server will respond with:

    {
      "state": "PENDING",
      "requestId": "63effa0f-9fcd-471a-92b9-7d5d6a34d0c8",
      "statusCode": 202,
      "href": "/signalk/v1/requests/63effa0f-9fcd-471a-92b9-7d5d6a34d0c8",
      "user": "system",
      "action": {
        "href": "/signalk/v1/requests/63effa0f-9fcd-471a-92b9-7d5d6a34d0c8"
    }

