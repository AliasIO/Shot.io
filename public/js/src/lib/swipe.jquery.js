(function($) {
	var Swipe = function(el, callback) {
		var self = this;

		this.el = $(el);
		this.callback = callback;
		this.pos = { start: { x: 0, y: 0 }, end: { x: 0, y: 0 } };
		this.startTime;

		el.on('touchstart', function(e) { self.touchStart(e); });
		el.on('touchmove',  function(e) { self.touchMove(e); });
		el.on('touchend',   function(e) { self.swipeEnd(); });
		el.on('mousedown',  function(e) { self.mouseDown(e); });
	};

	Swipe.prototype = {
		touchStart: function(e) {
			var touch = e.originalEvent.touches[0];

			this.swipeStart(touch.pageX, touch.pageY);
		},

		touchMove: function(e) {
			var touch = e.originalEvent.touches[0];

			this.swipeMove(touch.pageX, touch.pageY);
		},

		mouseDown: function(e) {
			var self = this;

			this.swipeStart(e.pageX, e.pageY);

			this.el.on('mousemove', function(e) { self.mouseMove(e); });
			this.el.on('mouseup', function() { self.mouseUp(); });
		},

		mouseMove: function(e) {
			this.swipeMove(e.pageX, e.pageY);
		},

		mouseUp: function() {
			this.swipeEnd();

			this.el.off('mousemove');
			this.el.off('mouseup');
		},

		swipeStart: function(x, y) {
			this.pos.start.x = x;
			this.pos.start.y = y;
			this.pos.end.x = x;
			this.pos.end.y = y;

			this.startTime = new Date().getTime();

			this.trigger('start');
		},

		swipeMove: function(x, y) {
			this.pos.end.x = x;
			this.pos.end.y = y;

			this.trigger('move');
		},

		swipeEnd: function() {
			this.trigger('end');
		},

		trigger: function(e) {
			var
				x = this.pos.start.x - this.pos.end.x,
				y = this.pos.end.y - this.pos.start.y,
				radians = Math.atan2(y, x),
				direction = 'up',
				distance = Math.round(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))),
				angle = Math.round(radians * 180 / Math.PI),
				speed = Math.round(distance / ( new Date().getTime() - this.startTime ) * 1000);

			if ( angle < 0 ) {
				angle = 360 - Math.abs(angle);
			}

			if ( ( angle <= 45 && angle >= 0 ) || ( angle <= 360 && angle >= 315 ) ) {
				direction = 'left';
			} else if ( angle >= 135 && angle <= 225 ) {
				direction = 'right';
			} else if ( angle > 45 && angle < 135 ) {
				direction = 'down';
			}

			this.callback.apply(this.el, [ e, { x: x, y: y, direction: direction, distance: distance, angle: angle, speed: speed } ]);
		}
	};

	$.fn.swipe = function(callback) {
		var swipe = new Swipe(this, callback);
	};
})(jQuery);
