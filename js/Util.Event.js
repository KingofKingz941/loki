/**
 * Does nothing.
 *
 * @class A container for functions relating to events. (Not that it
 * matters much, but it makes sense for even functions that work
 * primarily on something other than an event (for example,
 * add_event_listener works primarily on a node) to be in here rather
 * than elsewhere (for example, Util.Node) because all evente-related
 * function are in the DOM2+ standards defined in non-core modules,
 * i.e.
 */
Util.Event = {};

/**
 * Creates a wrapper around a function that ensures it will always be called
 * with the event object as its sole parameter.
 *
 * @param	func	the function to wrap
 */
Util.Event.listener = function(func)
{	
	return function() {
		return func(arguments[0] || window.event);
	};
};

/**
 * Adds an event listener to a node. 
 * <p>
 * N.B., for reference, that it is dangerous in IE to attach as a
 * listener a public method of an object. (The browser may crash.) See
 * Loki's Listbox.js for a workaround.
 *
 * @param	node		the node to which to add the event listener
 * @param	type		a string indicating the type of event to listen for, e.g. 'click', 'mouseover', 'submit', etc.
 * @param	listener	a function which will be called when the event is fired, and which receives as a paramater an
 *                      Event object (or, in IE, a Util.Event.DOM_Event object)
 */
Util.Event.add_event_listener = function(node, type, listener)
{
	if (!Util.is_valid_object(node)) {
		throw new TypeError("Cannot listen for a '" + type + "' event on a " +
			"non-object.");
	} else if (!type || !listener) {
		throw new Error("Must provide an event type and a callback function " +
			"to add an event listener.");
	}
	
	if (node.addEventListener) {
		node.addEventListener(type, listener, false);
	} else if (node.attachEvent) {
		node.attachEvent('on' + type, listener);
	} else {
		throw new Util.Unsupported_Error('modern event handling');
	}
};

/**
 * (More intelligently and concisely) adds an event listener to a node.
 * @param {Node}	target	the node to which to add the event listener
 * @param {string}	type	the type of event to listen for
 * @param {function}	listener	the listener function that will be called
 * @param {object}	context	the "this context" in which to call the listener
 * @type void
 */
Util.Event.observe = function observe_event(target, type, listener, context) {
	if (typeof(type) !== 'string') {
		throw new TypeError('The event type to observe must be a string, ' +
			'not ' + type + '.');
	}
	
	if (target.addEventListener) {
		if (context) {
			target.addEventListener(type, function event_listener_proxy() {
				listener.apply(context, arguments);
			}, false);
		} else {
			target.addEventListener(type, listener, false);
		}
	} else if (target.attachEvent) {
		target.attachEvent('on' + type, function ie_event_listener_proxy() {
			listener.call(context || window, (arguments[0] || window.event));
		});
	} else {
		throw new Util.Unsupported_Error('modern event handling');
	}
};

/**
 * Removes an event listener from a node. Doesn't work at present.
 *
 * @param	node		the node from which to remove the event listener
 * @param	type		a string indicating the type of event to stop listening for, e.g. 'click', 'mouseover', 'submit', etc.
 * @param	listener	the listener function to remove
 */
Util.Event.remove_event_listener = function(node, type, listener)
{
	if (node.removeEventListener) {
		node.removeEventListener(type, listener, false);
	} else if (node.detachEvent) {
		node.detachEvent('on' + type, listener);
	} else {
		throw new Util.Unsupported_Error('modern event handling');
	}
};

/**
 * Tests whether the given keyboard event matches the provided key code.
 * @param {Event}	e	the keyboard event
 * @param {integer} key_code	the key code
 * @return {boolean} true if the given event represented the code, false if not
 */
Util.Event.matches_keycode = function matches_keycode(e, key_code)
{
	if (['keydown', 'keyup'].contains(e.type) && e.keyCode == keycode) {
		return true;
	} else if (e.type == 'keypress') {
		var code = (e.charCode)
			? e.charCode
			: e.keyCode; // Internet Explorer instead puts the ASCII value here.
			
			return key_code == code ||
				(key_code >= 65 && key_code <= 90 && key_code + 32 == code);
	} else {
		throw new TypeError('The given event is not an applicable ' +
			'keyboard event.');
	}
};

/**
 * Gets the mouse coordinates of the given event.
 * @type object
 * @param {Event} event	the mouse event
 * @return {x: (integer), y: (integer)}
 */
Util.Event.get_coordinates = function get_coordinates(event)
{
	var doc = (event.currentTarget || event.srcElement).ownerDocument;
	
	var x = event.pageX || event.clientX + doc.body.scrollLeft +
		doc.documentElement.scrollLeft;
	var y = event.pageY || event.clientY + doc.body.scrollTop +
		doc.documentElement.scrollTop;
		
	return {x: x, y: y};
};

Util.Event.prevent_default = function prevent_event_default(event) {
	if (typeof(event.preventDefault) == 'function') {
		event.preventDefault();
	} else {
		event.returnValue = false;
	}
	
	return false;
};

/**
 * Returns the target.
 * Taken from quirksmode.org, by Peter-Paul Koch.
 */
Util.Event.get_target = function get_event_target(e)
{
	var targ;
	
	if (e.target) targ = e.target;
	else if (e.srcElement) targ = e.srcElement;
	if (targ.nodeType == 3) // defeat Safari bug
		targ = targ.parentNode;
	return targ;
};
