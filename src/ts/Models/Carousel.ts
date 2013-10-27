module Shot {
	export module Models {
		/**
		 * Carousel model
		 */
		export class Carousel {
			private index = 0;
			private images: Models.Image[] = [];
			private animating = false;
			private previous;
			private current;
			private next;
			private currentId: number;
			private breadcrumb;

			constructor(public carousel, imagesData: any[]) {
				var
					offset = 0,
					wrap = $('<div class="wrap"/>'),
					cutOff: number;

				// Obtain image ID from URL
				this.currentId = parseInt(location.pathname.replace(/^\/album\/carousel\/[0-9]+\/([0-9]+)/, (match, a) => { return a; }));

				$(window).on('popstate', (e) => {
					if ( e.originalEvent.state ) {
						this.render(e.originalEvent.state.id);
					}
				});

				$(window).on('resize', () => {
					cutOff = $(window).width() / 2;
				})
				.trigger('resize');

				// Keyboard shortcuts
				$(document).on('keydown', (e) => {
					switch ( e.keyCode ) {
						case 35: // End
							e.preventDefault();

							if ( this.index < this.images.length - 1 ) {
								this.index = this.images.length - 1;

								this.render();
							}

							break;
						case 36: // Home
							e.preventDefault();

							if ( this.index > 0 ) {
								this.index = 0;

								this.render();
							}

							break;
						case 33: // Page up
						case 37: // Left arrow
						case 38: // Up arrow
							e.preventDefault();

							if ( this.index > 0 ) {
								this.index --;

								this.render();
							}

							break;
						case 32: // Space
						case 34: // Page down
						case 39: // Right arrow
						case 40: // Down arrow
							e.preventDefault();

							if ( this.index < this.images.length - 1 ) {
								this.index ++;

								this.render();
							}

							break;
					}
				});

				// Exit full screen
				$('.full-screen').on('click', (e) => {
					$.each([ 'c', 'mozC', 'webkitC', 'msC', 'oC' ], (i, prefix) => {
						var method = prefix + 'ancelFullScreen';

						if ( typeof document[method] === 'function' ) {
							document[method]();
						}
					});
				});

				// Breadcrumb
				this.breadcrumb = $('<a/>');

				$('<li/>')
					.append(this.breadcrumb)
					.appendTo('.top-bar .breadcrumbs');

				$('.top-bar .breadcrumbs').append('<li class="divider"/>');

				$.each([ 'previous', 'current', 'next' ], (i, container) => {
					this[container] = $('<div class="' + container + '"><div class="image"><a><div class="valign"/></a></div></div>');

					wrap.append(this[container]);
				});

				wrap.find('.image a').on('click', (e) => {
					e.preventDefault();

					if ( !this.animating ) {
						// Clicked Current image
						if ( this.current.has(e.target).length ) {
							this.fullScreen(this.images[this.index]);
						}

						// Clicked Previous image
						if ( this.previous.has(e.target).length ) {
							this.index --;

							this.render();
						}

						// Clicked Next image
						if ( this.next.has(e.target).length ) {
							this.index ++;

							this.render();
						}
					}
				});

				$(carousel).swipe((e, swipe) => {
					var
						opacity: number,
						destination: number,
						distance: number,
						duration: number;

					if ( e === 'start' ) {
						wrap.stop();

						offset = wrap.position().left;
					}

					if ( e === 'move' ) {
						if ( !this.animating ) {
							carousel.addClass('animating');

							this.animating = true;
						}

						wrap.css({ opacity: ( cutOff - Math.min(cutOff, Math.abs(swipe.x)) ) / cutOff, left: offset - Math.min(cutOff, Math.max(- cutOff, swipe.x)) });
					}

					if ( e === 'end' ) {
						if ( swipe.distance < 50 || swipe.speed < cutOff || ( swipe.direction === 'right' && this.index === 0 ) || ( swipe.direction === 'left' && this.index === this.images.length - 1 ) ) {
							// Cancel animation
							wrap.stop().animate({ opacity: 1, left: '-100%' }, 'normal', 'easeOutQuad', () => {
								carousel.removeClass('animating');

								this.animating = false;
							});
						} else {
							// Finish animation
							destination = offset + ( swipe.direction === 'right' ? cutOff : - cutOff );
							distance = Math.abs(destination - wrap.position().left);
							duration = distance / swipe.speed * 1000;

							wrap.stop().animate({ opacity: 0, left: destination }, duration, 'easeOutQuad', () => {
								wrap
									.stop()
									.css({ left: '-100%'})
									.animate({ opacity: 1 }, duration / 2, 'easeInQuad');

								this.index += swipe.direction === 'right' ? -1 : 1;

								this.render();

								carousel.removeClass('animating');

								this.animating = false;
							});
						}
					}
				});

				$.each(imagesData, (i, data) => {
					this.images.push(new Models.Image(data));
				});

				wrap.appendTo(carousel);

				this.render(this.currentId);

				return this;
			}

			/**
			 * Update the carousel UI
			 */
			render(id?: number): Carousel {
				var images = { previous: <Models.Image> null, current: <Models.Image> null, next: <Models.Image> null };

				// Jump to a specific image
				if ( id !== undefined ) {
					this.currentId = id;

					// Get index
					$.each(this.images, (i, image: Models.Image) => {
						if ( image.data.id === this.currentId ) {
							this.index = i;
						}
					});
				}

				// Sanity check index value
				this.index = Math.max(0, Math.min(this.images.length - 1, this.index));

				images.current = this.images[this.index];

				// Update the URL
				if ( this.currentId === images.current.data.id ) {
					history.replaceState({ id: this.currentId }, '');
				} else {
					this.currentId = images.current.data.id;

					history.pushState({ id: this.currentId }, '', '/album/carousel/' + SHOT.album.id + '/' + images.current.data.id);
				}

				this.breadcrumb
					.prop('href', SHOT.rootPath + 'album/carousel/' + SHOT.album.id + '/' + images.current.data.id)
					.html('<i class="fa fa-picture-o"/>&nbsp;' + images.current.data.title);

				this.carousel.find('.image img').remove();

				if ( this.index > 0 ) {
					images.previous = this.images[this.index - 1];
				}

				if ( this.images.length > this.index + 1 ) {
					images.next = this.images[this.index + 1];
				}

				$.each([ 'previous', 'current', 'next' ], (i, container) => {
					var
						anchor,
						image = images[container];

					if ( image instanceof Models.Image ) {
						anchor = this[container].find('.image a');

						if ( container === 'current' ) {
							anchor.attr('href', SHOT.rootPath + 'image/fullscreen/' + image.data.id)
						} else {
							anchor.attr('href', SHOT.rootPath + 'album/carousel/' + SHOT.album.id + '/' + image.data.id)
						}

						image
							.appendTo(anchor)
							.render(2048);
					}
				});

				return this;
			}

			/**
			 * View image full screen
			 */
			fullScreen(image: Models.Image): Carousel {
				var
					fullScreen = $('.full-screen').get(0),
					clone = image.el.clone(),
					el = $('<img/>');

				$(fullScreen).html('<div class="valign"></div>').append(clone);

				// Load full size image
				el
					.on('load', () => {
						$(fullScreen).find('img').replaceWith(el);
					})
					.prop('src', image.data.paths.original);

				$.each([ 'r', 'mozR', 'webkitR', 'msR', 'oR' ], (i, prefix) => {
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
