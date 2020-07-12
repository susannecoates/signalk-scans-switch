/*
 * Copyright 2020 by Susanne Coates <scoates@susannecoates.net>
 */

module.exports = function (app) {
  let timer = null
  let plugin = {}
  var Gpio = require('onoff').Gpio

  plugin.id = 'signalk-scans-switch'
  plugin.name = 'SignalK SCANS Switch Bank I/O'
  plugin.description = 'SignalK plugin for controlling SCANS switch banks'

  plugin.schema = {
    type: 'object',
    properties: {
      rate: {
        title: "Sampling Interval",
        type: 'number',
        default: 5
      },
      base_path: {
        type: 'string',
        title: 'SignalK Base Path',
        description: 'This is used to build the path in Signal K. It will be appended to \'electrical\'',
        default: 'scans.switch'
      },
      gpio_scheme: {
	type: 'array',
	title: 'GPIO Pin Naming scheme',
	items: {
	    type: 'string',
  	    enum: ["Physical (Board)", "Broadcom (BCM)"],
	    default: ["Broadcom (BCM)"]
	}
      },	
      switches: {
          type: 'array',
	  title: ' ',
	  description: 'GPIO to Switch Mapping',
	  items: {
	      type: 'object',
	      title: 'Switch',
	      required: ["gpio_id","switch_name"],
	      properties: {		  
		  gpio_id: {
		      id: 'gpio_id',
		      type: 'number',
		      title: 'GPIO Pin ID',
		      description: 'Depending on the selected pin naming scheme, this is either the physical board pin number or the Broadcom (BCM) numeric ID.',
		      name: 'gpio_id'
		  },
		  switch_name: {
		      id: 'switch_name',
		      type: 'string',
		      description: 'The name for the switch',
		      default: ''
		  },
		  switch_state: {
		      id: 'switch_state',
		      type: 'number',
		      description: 'The current state of the switch.',
		      default: 0
		  }
	      }
	  }
      }
    }
  }

    plugin.start = function (options) {
	function createDeltaMessage () {
	var valuesArray = [];
        for(i=0; i < options.switches.length; i++){
	  var machine_name = options.switches[i].switch_name.toLowerCase().replace(/\s/,"_");
	  var value =  options.switches[i].switch_state;
	  eval("var " + machine_name + " = new Gpio(" + options.switches[i].gpio_id + ", 'out');");
	  eval(machine_name + ".writeSync(" + value + ");"); 
	  valuesArray.push(
	      {
	      'path': 'electrical.' + options.base_path + '.' +  machine_name,
              'value': value
	      }
	  );
	    
	}
	  
      var deltaArray = {
        'context': 'vessels.' + app.selfId,
        'updates': [
          {
            'source': {
              'label': plugin.id
            },
            'timestamp': (new Date()).toISOString(),
            'values': valuesArray
          }
        ]
      }
	  //console.log(`data = ${JSON.stringify(deltaArray, null, 2)}`);
      return deltaArray;
    }

    function readBankState() {
        // create message
        var delta = createDeltaMessage()

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
