module Shot {
	/**
	 * Album
	 */
	export module Album {
		/**
		 * Album carousel
		 */
		export class Carousel {
			private index = 0;
			private images: Image[] = [];
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
					this.render(e.originalEvent.state.id);
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
					this.images.push(new Image(data));
				});

				wrap.appendTo(carousel);

				this.render(this.currentId);

				return this;
			}

			/**
			 * Update the carousel UI
			 */
			render(id?: number): Carousel {
				var images = { previous: <Image> null, current: <Image> null, next: <Image> null };

				// Jump to a specific image
				if ( id !== undefined ) {
					this.currentId = id;

					// Get index
					$.each(this.images, (i, image: Image) => {
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
					.html('<i class="icon-picture"/>&nbsp;' + images.current.data.title);

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

					if ( image instanceof Image ) {
						anchor = this[container].find('.image a');

						anchor
							.attr('href', SHOT.rootPath + 'album/carousel/' + SHOT.album.id + '/' + image.data.id)
							.attr('data-id', image.data.id);

						image
							.appendTo(anchor)
							.render(2048);
					}
				});

				return this;
			}
		}

		/**
		 * Album image
		 */
		class Image {
			el;
			preview: Preview;

			constructor(public data) {
				this.el = $('<img/>');

				return this;
			}

			/**
			 * Add image to DOM, display preview image while loading
			 */
			appendTo(parent): Image {
				this.preview = new Preview({ x: this.data.width, y: this.data.height }, parent, this.data.paths.preview);

				this.el.appendTo(parent);

				return this;
			}

			/**
			 * Load the image, replace preview image
			 */
			render(size: number): Image {
				var el = $('<img/>');

				el.prop('src', this.data.paths[size] ? this.data.paths[size] : this.data.paths['original']);

				el.on('load', (e) => {
					// Replace previously rendered image
					this.el.replaceWith($(e.target));

					// Remove preview image
					if ( this.preview ) {
						this.preview.destroy();
					}
				});

				return this;
			}
		}

		/**
		 * Album preview image
		 */
		class Preview {
			private el;
			private id: number;

			constructor(size, parent, filePath) {
				this.id = new Date().getTime() + Math.round(Math.random() * 999);

				this.el = $('<img/>');

				// Render pre-load image in place of the actual image
				$(window).on('resize.' + this.id, () => {
					var parentSize = { x: parent.width(), y: parent.height() };

					if ( size.x > parentSize.x ) {
						size.y *= parentSize.x / size.x;
						size.x  = parentSize.x;
					}

					if ( size.y > parentSize.y ) {
						size.x *= parentSize.y / size.y;
						size.y  = parentSize.y;
					}

					this.el.css({
						position: 'absolute',
						top: ( parentSize.y / 2 ) - ( size.y / 2 ),
						height: size.y,
						width: size.x
					});

					switch ( parent.css('textAlign') ) {
						case 'start':
							this.el.css({ left: 0 });

							break;
						case 'center':
							this.el.css({ left: ( parentSize.x / 2 ) - ( size.x / 2 ) });

							break;
						case 'right':
							this.el.css({ right: 0 });

							break;
					}
				})
				.trigger('resize');

				this.el
					.addClass('preview')
					.prop('src', filePath)
					.appendTo(parent);

				return this;
			}

			/**
			 * Remove the image
			 */
			public destroy(): void {
				this.el.remove();

				$(window).off('resize.' + this.id);
			}
		}
	}
} 
