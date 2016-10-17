$(function() {
	var arr = [];
	var isTime = function(str) {
		return str.trim().slice(-1).toLowerCase() === 's';
	};
	var isDistance = function(str) {
		return str.trim().slice(-2).toLowerCase() === 'px';
	};


	var ZanimateEl = function(el) {
		this.el = el;
		this.anchor = $(el.data('anchor') || this.el);
		this.offset = el.data('offset') || 15;
		this.props = el.data('zan').split(' ');
		this.parseProps();
		this.x = 0;
		this.y = 0;
		this.opacity = 1;
		this.done = false;

		this.wind();
		this.handleScroll();
		$(window).scroll(this.handleScroll.bind(this));
	};
	ZanimateEl.prototype = {

		cancel: function() {
			this.done = true;
		},

		each: function(callback) {
			for (var i = 0; i < this.props.length; i++) {
				callback.call(this.props[i], i, this.props);
			}
		},

		finish: function() {
			this.unwind();
		},

		handleScroll: function() {
			if (this.done) return;

			var distanceDown = $(window).scrollTop() + $(window).height(),
				offset = this.anchor.offset().top + ($(window).height() / 100 * this.offset);
			if (distanceDown >= offset) {
				this.unwind();
				this.done = true;
			}
		},

		unwind: function() {
			var self = this

			this.each(function() {
				var prop = this;
				window.setTimeout(function() {
					self.el.css('transition', 'opacity ' + prop.duration + 's, transform ' + prop.duration + 's');
					self.el.css({
						opacity: 1,
						transform: self.transform
					});
				}, prop.delay * 1000);
			});
		},

		wind: function() {
			var self = this;
			self.each(function() {
				self[this.animation]();
				if (this.direction) self[this.direction](this.distance);
			});

			if (window.getComputedStyle(self.el[0]).display === 'inline') self.el.css('display', 'inline-block');
			self.el.css({
				opacity: self.opacity,
				transform: 'translateX(' + self.x + 'px) translateY(' + self.y + 'px)'
			});
		},

		fadein: function() { this.opacity = 0; },
		slidein: function() { this.opacity = 0; },
		slide: function() {},

		up: function(distance) { this.y += distance; },
		right: function(distance) { this.x -= distance; },
		down: function(distance) { this.y -= distance; },
		left: function(distance) { this.x += distance; },

		/*
			Accept props of the following forms:
				form 1) animationName-direction-distance-duration-[delay]   (slide-left-200px-.4s-.2s)
				form 2) animationName-direction-duration-[delay]			(slide-left-.4s-.2s)
				form 3) animationName-distance-duration-[delay]			 (slide-200px-.4s-.2s)
				form 4) animationName-duration-[delay]					  (slide-.4s-.2s)
		*/
		parseProps: function() {
			var self = this;
			self.each(function(i) {
				var pieces = this.split('-'),
					animation = pieces.shift(),
					direction = pieces.shift(),
					distance, duration, delay;

				if (isDistance(direction)) {

					// form 3
					distance = direction;
					direction = '';
					duration = pieces.shift();
				} else if (isTime(direction)) {

					// form 4
					duration = direction;
					direction = '';
				} else {

					// form 1
					distance = pieces.shift();

					if (isTime(distance)) {

						// form 2
						duration = distance;
						distance = '';
					} else {

						// continue form 1
						duration = pieces.shift();
					}
				}
				delay = pieces.shift();

				self.props[i] = {
					animation: animation,
					direction: direction || 'left',
					distance: parseInt(distance) || 48,
					duration: parseFloat(duration) || 0.4,
					delay: parseFloat(delay) || 0
				};
			});
		},

		get transform() {
			return 'translateX(0px) translateY(0px)'
		}
	};



	var ZanimateColl = function(els) {
		var self = this;
		els.each(function() {
			self.push(new ZanimateEl($(this)));
		});
	};
	ZanimateColl.prototype = {
		length: 0,
		push: arr.push,
		splice: arr.splice,
		each: function(callback) {
			for (var i = 0; i < this.length; i++) {
				this.callback.call(this[i], i, this);
			}
		},

		cancel: function() {
			this.each(function() {
				this.cancel();
			});
		},
		finish: function() {
			this.each(function() {
				this.finish();
			});
		}
	};


	window.zanimate = new ZanimateColl($('[data-zan]'));
});
