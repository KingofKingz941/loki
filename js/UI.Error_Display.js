/**
 * @class Provides a nicely-formatted inline error display.
 * @constructor
 * @param {HTMLElement} the element into which the message will be inserted
 */
UI.Error_Display = function(message_container)
{
	var doc = message_container.ownerDocument;
	var dh = new Util.Document(doc);
	
	var self = this;
	
	this.display = null;
	
	function create(message, retry, retry_text)
	{
		if (!retry)
		    retry = null;
		else if (!retry_text)
		    retry_text = 'Retry';
		
		var link;
		if (retry) {
			link = dh.create_element('a',
				{
					href: '#',
					className: 'retry',
					style: {display: 'block'}
				},
				[retry_text]);
			
			Util.Event.add_event_listener(link, 'click', function(e) {
				if (!e)
					var e = window.event;

				try {
					retry();
				} catch (e) {
					self.show('Failed to retry: ' + (e.message || e), retry);
				} finally {
					return Util.Event.prevent_default(e);
				}
			});
		}

		self.display = dh.create_element('p', {className: 'error'});
		self.display.innerHTML = message;
		if (link)
		    self.display.appendChild(link);
		message_container.appendChild(self.display);
	}
	
	function remove()
	{
		if (this.display.parentNode)
			this.display.parentNode.removeChild(this.display);
		this.display = null;
	}
	
	this.show = function(message, retry, retry_text)
	{
		if (!retry)
			var retry = null;
		
		if (this.display)
			remove.call(this);
		
		create.call(this, message, retry, retry_text);
	}
	
	this.clear = function()
	{
		if (this.display)
			remove.call(this);
	}
}