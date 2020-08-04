/*
 * Copyright 2020 by Susanne Coates <scoates@susannecoates.net>
 */

module.exports = function (app) {
    let timer = null
    let plugin = {}
    let onStop = []
    let registeredPaths = []
    let configuredGPIO = [];
    let pluginOptions
    
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
		default: 'switches'
	    },
	    gpio_scheme: {
		type: 'array',
		title: 'GPIO Pin Naming scheme',
		items: {
		    type: 'string',
  		    enum: ["Board", "BCM"],
		    default: ["BCM"]
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
    
    function subscription_error(err)
    {
	app.setProviderError(err)
    }
    
    
    function actionHandler(context, path, dSource, value, cb){
	const parts = path.split('.')
	//match the parts[2] with the options to find the gpio assignment
	//app.debug(`setting ${path} to ${value}`)
	configuredGPIO[parts[2]].writeSync(value);
	return { state: 'PENDING' }
    }
    
    plugin.start = function (options) {
	//app.debug(options);
	//Initialise the GPIO here and store in configuredGPIO array
	for(i=0; i < options.switches.length; i++){
	    var machine_name = options.switches[i].switch_name.toLowerCase().replace(/\s/,"");
	    var value =  options.switches[i].switch_state;
	    configuredGPIO[machine_name] = new Gpio(options.switches[i].gpio_id,'out');
	    // Set default values
	    configuredGPIO[machine_name].writeSync(value);
	}
	app.debug(configuredGPIO['anchorlight']);
	pluginOptions = options;

	let command = {
	    context: "vessels.self",
	    subscribe: [{
		path: `electrical.switches.*`,
		period: 1000
	    }]
	}
	app.debug('subscribe %j', command);
	app.subscriptionmanager.subscribe(command, onStop, subscription_error, delta => {
	    delta.updates.forEach(update => {
		update.values.forEach(value => {
		    const path = value.path
		    const key = `${path}.${update.$source}`
		    if ( path.endsWith('state') && registeredPaths.indexOf(key) === -1 ) {
			app.debug('register action handler for path %s source %s', path, update.$source)
			app.registerActionHandler('vessels.self',
						  path,
						  (context, path, value, cb) => {
						      return actionHandler(context, path, update.$source, value, cb)
						  },
						  update.$source)
			registeredPaths.push(key)
		    }
		})
	    })
	})
	
	function createDeltaMessage () {
	    var valuesArray = [];
	    var machine_name
	    var value
            for(i=0; i < options.switches.length; i++){
		machine_name = options.switches[i].switch_name.toLowerCase().replace(/\s/,"");
		configuredGPIO[machine_name].setDirection['in'];
		value = configuredGPIO[machine_name].readSync(value);
		configuredGPIO[machine_name].setDirection['out'];
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

            app.handleMessage(plugin.id, delta)
	}

	timer = setInterval(readBankState, options.rate * 1000);
      
    }
    
    plugin.stop = function () {
	if(timer){
	    clearInterval(timer);
	    timeout = null;
	}
	
	app.debug('stop')
	onStop.forEach(f => f())
	onStop = []
    }
    return plugin
}
