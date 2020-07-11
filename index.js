/*
 * Copyright 2020 by Susanne Coates <scoates@susannecoates.net>
 */

const Gpio = require('onoff').Gpio;

module.exports = function (app) {
  let timer = null
  let plugin = {}

  plugin.id = 'signalk-scans-switch'
  plugin.name = 'SignalK Plugin for RPI GPIO'
  plugin.description = 'SignalK Plugin to control switches on RPI GPIO'

  plugin.schema = {
    type: 'object',
    properties: {
      rate: {
        title: "Sampling Interval",
        type: 'number',
        default: 60
      },
      base_path: {
        type: 'string',
        title: 'SignalK Base Path',
        description: 'This is used to build the path in Signal K. It will be appended to \'electrical\'',
        default: 'scans.switch'
      },
      bank: {
        type: 'string',
        title: 'SignalK Bank',
        description: 'Switches are arranged in banks, each bank has up to 16 switches',
        default: 'bank0'
      }	
    }
  }

  plugin.start = function (options) {

    function createDeltaMessage (switch0, switch1, switch2) {
      return {
        'context': 'vessels.' + app.selfId,
        'updates': [
          {
            'source': {
              'label': plugin.id
            },
            'timestamp': (new Date()).toISOString(),
            'values': [
              {
                'path': 'electrical.' + options.base_path + '.' + options.bank + '.deck_light',
                'value': switch0
              }, {
                'path': 'electrical.' + options.base_path + '.' + options.bank + '.steaming_light',
                'value': switch1
              }, {
                'path': 'electrical.' + options.base_path + '.' + options.bank + '.bow_light',
                'value': switch2
              }, {
                'path': 'electrical.' + options.base_path + '.' + options.bank + '.stern_light',
                'value': switch2
              }
            ]
          }
        ]
      }
    }

    function readBankState() {
        switch0 =  1;
        switch1 =  0;
        switch2 =  1;

        //console.log(`data = ${JSON.stringify(data, null, 2)}`);

        // create message
        var delta = createDeltaMessage(switch0, switch1, switch2)

        // send temperature
        app.handleMessage(plugin.id, delta)
    }

    timer = setInterval(readBankState, options.rate * 1000);
  }

  plugin.stop = function () {
    if(timer){
      clearInterval(timer);
      timeout = null;
    }
  }

  return plugin
}
