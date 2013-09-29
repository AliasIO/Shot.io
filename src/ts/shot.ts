declare var SHOT, $;

module Shot {
	export class App {
		constructor() {
			// Prevent dragging of ghost image in Firefox
			$(document)
				.on('dragstart', 'img, a', (e) => {
					e.preventDefault();
				});

			switch (SHOT.controller) {
				case 'Admin':
					new AjaxUpload.Form($('#files'), $('.thumbnail-grid'));

					break;
				case 'Album':
					new Album.Carousel($('.carousel'), SHOT.images);

					break;
			}

			return this;
		}
	}

	module AjaxUpload {
		var fileTypes = [
			'image/jpg',
			'image/jpeg',
			'image/png',
			'image/gif',
			'image/bmp'
		];

		export class Form {
			private files: File[] = [];
			private thumbnailQueue: Image[] = [];

			constructor(private input, private thumbnailGrid) {
				input.on('change', (e) => {
					$.each(e.target.files, (i, file) => {
						var image;

						if ( file.name && $.inArray(file.type, fileTypes) !== -1 ) {
							image = new Image(file, this.thumbnailGrid);

							this.files.push(image);
							this.thumbnailQueue.push(image);
						}
					});

					this.nextThumbnail();
				});

				return this;
			}

			/**
			 * Create next thumbnail in queue
			 */
			nextThumbnail(): Form {
				if ( this.thumbnailQueue.length ) {
					this.thumbnailQueue.shift().createThumbnail(() => this.nextThumbnail());
				}

				return this;
			}
		}

		class File {
			thumbnail;
			progressBar;

			constructor(public file, public thumbnailGrid) {
				var formData = new FormData();
				
				formData.append('image', file);

				this.thumbnail = $('<li><div class="container"><div class="processing"/><div class="title-wrap"><div class="title"/></div></div></li>');

				this.thumbnail.find('.title').text(file.name);

				this.progressBar = new ProgressBar(this.thumbnail);

				thumbnailGrid.prepend(this.thumbnail);

				$.ajax({
					url: SHOT.rootPath + 'upload',
					type: 'POST',
					data: formData,
					processData: false,
					contentType: false,
					cache: false,
					xhr: () => {
						var xhr = $.ajaxSettings.xhr();

						// Track upload progress
						if ( xhr.upload ) {
							xhr.upload.addEventListener('progress', (e) => {
								if ( e.lengthComputable ) {
									this.progressBar.set(( e.loaded / e.total ) * 100);
								}
							}, false);
						}

						return xhr;
					}
				}, 'json')
				.done((data) => {
					this.progressBar.set(100, () => {
						var image = $('<img/>');

						image
							.hide()
							.on('load', (e) => { 
								// Replace temporary thumbnail with processed image
								this.thumbnail.find('.temporary').fadeOut('fast', function() {
									$(this).remove();
								});

								// Remove processing indicator
								this.thumbnail.find('.processing').fadeOut('fast');

								// Reveal the processed image
								$(e.target).fadeIn('fast');
							})
							.prependTo(this.thumbnail.find('.container'))
							.prop('src', SHOT.rootPath + 'photos/thumb/smart/' + data.filename);
					});
				})
				.fail((e) => {
					this.progressBar.set(0);

					this.thumbnail.find('.container').addClass('error');

					console.log('fail');
				});

				return this;
			}
		}

		class Image extends File {
			thumbnailSize = 480;

			constructor(public file, public thumbnailGrid) {
				super(file, thumbnailGrid);

				return this;
			}

			createThumbnail(callback: () => void): File {
				var reader = new FileReader();

				callback = typeof callback === 'function' ? callback : () => {};

				// Generate temporary thumbnail
				reader.onload = (e) => {
					var image = $('<img/>');

					image.on('load', (e) => {
						var
							canvas = $('<canvas/>').get(0),
							size = { 
								x: e.target.width  < e.target.height ? this.thumbnailSize : e.target.width  * this.thumbnailSize / e.target.height,
								y: e.target.height < e.target.width  ? this.thumbnailSize : e.target.height * this.thumbnailSize / e.target.width
								};

						canvas.width  = this.thumbnailSize;
						canvas.height = this.thumbnailSize;

						// Center image on canvas
						canvas
							.getContext('2d')
							.drawImage(e.target, ( canvas.width - size.x ) / 2, ( canvas.height - size.y ) / 2, size.x, size.y);

						$(canvas)
							.css({ opacity: 0 })
							.animate({ opacity: .5 }, 'fast')
							.addClass('temporary')
							.prependTo(this.thumbnail.find('.container'));

						callback();
					});

					image.on('error', () => callback());

					image.prop('src', e.target.result);
				}

				reader.onerror = () => callback();

				reader.readAsDataURL(this.file);

				return this;
			}
		}

		class ProgressBar {
			el;

			constructor(public thumbnail) {
				var wrap = $('<div class="progressbar-wrap"/>');

				this.el = $('<div class="progressbar"/>');

				wrap.append(this.el);

				thumbnail.find('.container').append(wrap);
			}

			set(percentage: number, callback: () => void): ProgressBar {
				this.el.stop(true, true).animate({ width: percentage + '%' }, 200, () => {
					if ( percentage === 100 ) {
						this.el.fadeOut('fast');
					}

					if ( typeof callback === 'function' ) {
						callback();
					}
				});

				return this;
			}
		}
	}

	module Album {
		export class Carousel {
			private index = 0;
			private images: Image[] = [];
			private animating = false;
			private previous;
			private current;
			private next;

			constructor(public carousel, imagesData: any[]) {
				var 
					offset = 0,
					wrap = $('<div class="wrap"/>'),
					cutOff: number;

				$(window).on('resize', function() {
					cutOff = $(window).width() / 2;
				})
				.trigger('resize');

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

				this.render();

				return this;
			}

			render(): Carousel {
				var images = { previous: null, current: null, next: null };

				this.index = Math.max(0, Math.min(this.images.length - 1, this.index));

				this.carousel.find('.image img').remove();

				images.current = this.images[this.index];

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
							.attr('href', image.data.id)
							.attr('data-id', image.data.id);

						image
							.appendTo(anchor)
							.render(2048);
					}
				});

				return this;
			}
		}

		class Image {
			el;
			preview: Preview;

			constructor(private data) {
				this.el = $('<img/>');

				return this;
			}

			appendTo(parent): Image {
				this.preview = new Preview({ x: this.data.width, y: this.data.height }, parent, this.data.paths.preview);

				this.el.appendTo(parent);

				return this;
			}

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

			public destroy(): void {
				this.el.remove();

				$(window).off('resize.' + this.id);
			}
		}
	}
}

$(function() {
	SHOT.app = new Shot.App();
});
