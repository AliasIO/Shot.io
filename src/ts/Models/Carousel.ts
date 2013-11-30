module Shot {
	export module Models {
		/**
		 * Carousel model
		 */
		export class Carousel {
			el: JQuery;
			index = 0;
			images: Models.Image[] = [];

			private animating = false;
			private current: Models.Image;
			private previous: Models.Image;
			private next: Models.Image;
			private template: string;
			private offset = 0;
			private cutOff: number;

			constructor(imagesData: any[]) {
				this.template = $('#template-carousel').html();

				imagesData.forEach((data) => {
					data.urls = data.paths;
					data.link = SHOT.rootPath + 'album/' + SHOT.album.id + '/' + data.id;

					this.images.push(new Models.Image(data));
				});

				return this;
			}

			/**
			 * Render
			 */
			render(): Carousel {
				var
					el = $(Mustache.render(this.template, {})),
					destination: number,
					distance: number,
					duration: number,
					wrap: JQuery;

				if ( this.el ) {
					this.el.replaceWith(el);
				}

				this.el = el;

				wrap = this.el.find('.wrap');

				$(window).on('resize', () => {
					this.cutOff = $(window).width() / 2;
				})
				.trigger('resize');

				// Exit full screen
				$(document).on('click', '.full-screen', (e) => {
					[ 'c', 'mozC', 'webkitC', 'msC', 'oC' ].forEach((prefix) => {
						var method = prefix + 'ancelFullScreen';

						if ( typeof document[method] === 'function' ) {
							document[method]();
						}
					});
				});

				this.el.swipe()
					.on('swipeStart', (e) => {
						wrap.stop();

						this.offset = wrap.position().left;
					})
					.on('swipeMove', (e) => {
						if ( !this.animating ) {
							this.el.addClass('animating');

							this.animating = true;
						}

						wrap.css({ opacity: ( this.cutOff - Math.min(this.cutOff, Math.abs(e.swipe.x)) ) / this.cutOff, left: this.offset - Math.min(this.cutOff, Math.max(- this.cutOff, e.swipe.x)) });
					})
					.on('swipeEnd', (e) => {
						if ( e.swipe.distance < 50 || e.swipe.speed < this.cutOff || ( e.swipe.direction === 'right' && this.index === 0 ) || ( e.swipe.direction === 'left' && this.index === this.images.length - 1 ) ) {
							// Cancel animation
							wrap.stop().animate({ opacity: 1, left: '-100%' }, 'normal', 'easeOutQuad', () => {
								this.el.removeClass('animating');

								this.animating = false;
							});
						} else {
							// Finish animation
							destination = this.offset + ( e.swipe.direction === 'right' ? this.cutOff : - this.cutOff );
							distance = Math.abs(destination - wrap.position().left);
							duration = distance / e.swipe.speed * 1000;

							wrap.stop().animate({ opacity: 0, left: destination }, duration, 'easeOutQuad', () => {
								wrap
									.stop()
									.css({ left: '-100%'})
									.animate({ opacity: 1 }, duration / 2, 'easeInQuad');

								this.el.removeClass('animating');

								this.animating = false;

								this.show(e.swipe.direction === 'right' ? ( this.previous ? this.previous.data.id : null ) : ( this.next ? this.next.data.id : null ));
							});
						}
					});

				return this;
			}

			/**
			 * Show image
			 */
			show(id: number): Carousel {
				if ( this.current && this.current.data.id === id ) {
					return;
				}

				// Get index
				this.images.forEach((image: Models.Image, i) => {
					if ( image.data.id === id ) {
						this.index = i;
					}
				});

				this.previous = this.index > 0 ? this.images[this.index - 1] : null;
				this.current = this.images[this.index];
				this.next = this.images.length > this.index + 1 ? this.images[this.index + 1]: null;

				['previous', 'current', 'next'].forEach((container) => {
					var el = this.el.find('.' + container);

					el.empty();

					if ( this[container] ) {
						el.append(this[container].render().el);

						this[container].el.on('click', (e) => {
							e.preventDefault();

							if ( container === 'current' ) {
								if ( !this.animating ) {
									this.fullScreen(this[container]);
								}
							} else {
								this.show(this[container].data.id);
							}
						});
					}
				});

				this.el.trigger('change', this.current);

				return this;
			}

			/**
			 * View image full screen
			 */
			fullScreen(image: Models.Image): Carousel {
				var
					fullScreen = $('.full-screen').get(0),
					el = $(fullScreen).find('img'),
					img = $('<img>');

				el.prop('src', image.el.find('img').attr('src'));

				// Load full size image
				img
					.on('load', () => {
						el.replaceWith(el);
					})
					.prop('src', SHOT.rootPath + image.data.paths.original);

				[ 'r', 'mozR', 'webkitR', 'msR', 'oR' ].forEach((prefix) => {
					var method = prefix + 'equestFullScreen';

					if ( typeof fullScreen[method] === 'function' ) {
						fullScreen[method]();

						return false;
					}
				});

				return this;
			}
		}
	}
}
