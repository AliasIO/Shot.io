declare var SHOT, $;

module Shot {
	export class App {
		constructor() {
			// Prevent dragging of ghost image in Firefox
			$(document)
				.on('dragstart', 'img', (e) => {
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
			private files = [];
			private thumbnailQueue = [];

			constructor(private input, private thumbnailGrid) {
				var self:Form = this;

				input.change(function() {
					$.each(this.files, function() {
						var image;

						if ( this.name && $.inArray(this.type, fileTypes) !== -1 ) {
							image = new Image(this, self.thumbnailGrid);

							self.files.push(image);
							self.thumbnailQueue.push(image);
						}
					});

					self.nextThumbnail();
				});

				return this;
			}

			/**
			 * Create next thumbnail in queue
			 */
			nextThumbnail() {
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
				var 
					self:File = this,
					formData = new FormData();
				
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
									self.progressBar.set(( e.loaded / e.total ) * 100);
								}
							}, false);
						}

						return xhr;
					}
				}, 'json')
				.done((data) => {
					self.progressBar.set(100, function() {
						var image = $('<img/>');

						image
							.hide()
							.on('load', function() { 
								// Replace temporary thumbnail with processed image
								self.thumbnail.find('.temporary').fadeOut('fast', function() {
									$(this).remove();
								});

								// Remove processing indicator
								self.thumbnail.find('.processing').fadeOut('fast');

								// Reveal the processed image
								$(this).fadeIn('fast');
							})
							.prependTo(self.thumbnail.find('.container'))
							.prop('src', SHOT.rootPath + 'photos/thumb/smart/' + data.filename);
					});
				})
				.fail((e) => {
					self.progressBar.set(0);

					self.thumbnail.find('.container').addClass('error');

					console.log('fail');
				});

				return this;
			}
		}

		class Image extends File {
			thumbnailSize:number = 480;

			constructor(public file, public thumbnailGrid) {
				super(file, thumbnailGrid);

				return this;
			}

			createThumbnail(callback: () => void) {
				var
					self:Image = this,
					reader = new FileReader();

				callback = typeof callback === 'function' ? callback : () => {};

				// Generate temporary thumbnail
				reader.onload = (e) => {
					var image = $('<img/>');

					image.on('load', function() {
						var
							canvas = $('<canvas/>').get(0),
							size = { 
								x: this.width  < this.height ? self.thumbnailSize : this.width  * self.thumbnailSize / this.height,
								y: this.height < this.width  ? self.thumbnailSize : this.height * self.thumbnailSize / this.width
								};

						canvas.width  = self.thumbnailSize;
						canvas.height = self.thumbnailSize;

						// Center image on canvas
						canvas
							.getContext('2d')
							.drawImage(this, ( canvas.width - size.x ) / 2, ( canvas.height - size.y ) / 2, size.x, size.y);

						$(canvas)
							.css({ opacity: 0 })
							.animate({ opacity: .5 }, 'fast')
							.addClass('temporary')
							.prependTo(self.thumbnail.find('.container'));

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

			set(percentage: number, callback: () => void) {
				var self:ProgressBar = this;

				this.el.stop(true, true).animate({ width: percentage + '%' }, 200, function() {
					if ( percentage === 100 ) {
						self.el.fadeOut('fast');
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
			private images = [];

			constructor(public carousel, imagesData: any[]) {
				var 
					self:Carousel = this,
					dragStart = { x: 0, y: 0 },
					offset = 0,
					wrap = $('<div class="wrap"/>'),
					cutOff:number;

				$(window).on('resize', function() {
					cutOff = $(window).width() / 2;
				})
				.trigger('resize');

				$.each([ 'previous', 'current', 'next' ], function() {
					wrap.append('<div class="' + this + '"><a class="image"><div class="valign"/></a></div>');
				});

				$(carousel).swipe(function(e, swipe) {
					var
						opacity,
						destination,
						distance,
						duration;

					if ( e === 'start' ) {
						wrap.stop();

						offset = wrap.position().left;

						carousel.addClass('animating');
					}

					if ( e === 'move' ) {
						wrap.css({ opacity: ( cutOff - Math.min(cutOff, Math.abs(swipe.x)) ) / cutOff, left: offset - Math.min(cutOff, Math.max(- cutOff, swipe.x)) });
					}

					if ( e === 'end' ) {
						if ( swipe.distance < 50 || swipe.speed < cutOff || ( swipe.direction === 'right' && self.index === 0 ) || ( swipe.direction === 'left' && self.index === self.images.length - 1 ) ) {
							// Cancel animation
							wrap.stop().animate({ opacity: 1, left: '-100%' }, 'normal', 'easeOutQuad', function() {
								carousel.removeClass('animating');
							});
						} else {
							// Finish animation
							destination = offset + ( swipe.direction === 'right' ? cutOff : - cutOff );
							distance = Math.abs(destination - wrap.position().left);
							duration = distance / swipe.speed * 1000;

							wrap.stop().animate({ opacity: 0, left: destination }, duration, 'easeOutQuad', function() {
								wrap
									.stop()
									.css({ left: '-100%'})
									.animate({ opacity: 1 }, duration / 2, 'easeInQuad');

								self.index += swipe.direction === 'right' ? -1 : 1;

								self.render();

								carousel.removeClass('animating');
							});
						}
					}
				});

				$.each(imagesData, function() {
					self.images.push(new Image(this));
				});

				wrap.appendTo(carousel);

				this.render();

				return this;
			}

			render() {
				var
					previous:Image,
					current:Image,
					next:Image;

				this.index = Math.max(0, Math.min(this.images.length - 1, this.index));

				this.carousel.find('.image img').remove();

				current = this.images[this.index];

				current
					.appendTo(this.carousel.find('.current .image'))
					.render(2048);

				if ( this.index > 0 ) {
					previous = this.images[this.index - 1];

					previous
						.appendTo(this.carousel.find('.previous .image'))
						.render(2048);
				}

				if ( this.images.length > this.index + 1 ) {
					next = this.images[this.index + 1];

					next
						.appendTo(this.carousel.find('.next .image'))
						.render(2048);
				}

				return this;
			}
		}

		class Image {
			el;
			preview:Preview;

			constructor(private data) {
				var self:Image = this;

				this.el = $('<img/>');

				return this;
			}

			appendTo(parent) {
				var self:Image = this;

				this.preview = new Preview({ x: this.data.width, y: this.data.height }, parent, this.data.paths.preview);

				this.el.appendTo(parent);

				return this;
			}

			render(size:number) {
				var 
					self:Image = this,
					el = $('<img/>');

				el.prop('src', this.data.paths[size] ? this.data.paths[size] : this.data.paths['original']);

				el.on('load', function() {
					// Replace previously rendered image
					self.el.replaceWith(this);

					// Remove preview image
					if ( self.preview ) {
						self.preview.destroy();
					}
				});

				return this;
			}
		}

		class Preview {
			private el;

			private id;

			constructor(size, parent, filePath) {
				var self = this;

				this.id = new Date().getTime() + Math.round(Math.random() * 999);

				this.el = $('<img/>');

				// Render pre-load image in place of the actual image
				$(window).on('resize.' + this.id, function() {
					var parentSize = { x: parent.width(), y: parent.height() };

					if ( size.x > parentSize.x ) {
						size.y *= parentSize.x / size.x;
						size.x  = parentSize.x;
					}

					if ( size.y > parentSize.y ) {
						size.x *= parentSize.y / size.y;
						size.y  = parentSize.y;
					}

					self.el.css({
						position: 'absolute',
						top: ( parentSize.y / 2 ) - ( size.y / 2 ),
						height: size.y,
						width: size.x
					});

					switch ( parent.css('textAlign') ) {
						case 'start':
							self.el.css({ left: 0 });

							break;
						case 'center':
							self.el.css({ left: ( parentSize.x / 2 ) - ( size.x / 2 ) });

							break;
						case 'right':
							self.el.css({ right: 0 });

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

			public destroy() {
				var self:Preview = this;

				this.el.stop().fadeOut('fast', function() {
					$(window).off('resize.' + self.id);

					$(this).remove();

					self = null;
				});
			}
		}
	}
}

$(function() {
	SHOT.app = new Shot.App();
});
