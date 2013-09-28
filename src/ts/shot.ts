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
			private index = 1;
			private images = [];

			constructor(public carousel, imagesData: any[]) {
				var 
					self:Carousel = this,
					previous:Image,
					current:Image,
					next:Image,
					dragStart = { x: 0, y: 0 },
					offset = 0,
					wrap = $(carousel).find('.wrap'),
					cutOff = $(window).width() / 2
					;

				$(carousel).swipe(function(e, swipe) {
					if ( e === 'start' ) {
						offset = wrap.position().left;
					}

					if ( e === 'move' ) {
						wrap.css({ opacity: ( cutOff - Math.min(cutOff, Math.abs(swipe.x)) ) / cutOff, left: offset - Math.min(cutOff, Math.max(- cutOff, swipe.x)) });
					}

					if ( e === 'end' ) {
						if ( swipe.distance < 100 || swipe.speed < cutOff ) {
							wrap.stop().animate({ opacity: 1, left: '-100%' });
						} else {
							var destination = offset + ( swipe.direction === 'right' ? cutOff : - cutOff );

							var distance = Math.abs(destination) - Math.abs(wrap.position().left);

							var duration = distance / swipe.speed * 1000;

							console.log(duration);

							wrap.animate({ opacity: 0, left: destination }, duration);
						}
					}
				});

				$.each(imagesData, function() {
					self.images.push(new Image(this));
				});

				current = this.images[this.index];

				if ( this.index > 0 ) {
					previous = this.images[this.index - 1];
				}

				if ( this.images.length > this.index + 1 ) {
					next = this.images[this.index + 1];
				}

				previous.setSize(2048);
				current.setSize(2048);
				next.setSize(2048);

				this.carousel.find('.image').append('<div class="vertical-align"/>');

				this.carousel.find('.previous .image').append(previous.image);
				this.carousel.find('.current .image').append(current.image);
				this.carousel.find('.next .image').append(next.image);
			}
		}

		class Image {
			public image;

			constructor(private data) {
				var 
					self:Image = this,
					resizeTimeout;
					;

				this.image = $('<img/>');

				this.image.on('load', function() {
					$(window).on('resize', () => {
						clearTimeout(resizeTimeout);

						resizeTimeout = setTimeout(() => self.onWindowResize(), 10);
					})
					.trigger('resize');
				});
			}

			setSize(size:number) {
				this.image.prop('src', this.data.paths[size] ? this.data.paths[size] : this.data.paths['original']);
			}

			/**
			 * On window resize
			 */
			onWindowResize() {
				//this.image.stop().animate({ marginTop: Math.max(0, ( this.image.parent().height() - this.image.height() ) / 2) }, 'fast');
			}
		}
	}
}

$(function() {
	SHOT.app = new Shot.App();
});
