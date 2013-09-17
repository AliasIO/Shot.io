declare var SHOT, $;

module Shot {
	export class App {
		constructor() {
			switch (SHOT.controller) {
				case 'Admin':
					var ajaxUpload = new AjaxUpload.Form($('#files'), $('#thumbnail-grid'));

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

			constructor(private input, private thumbnailGrid) {
				var self = this;

				input.change(function() {
					$.each(this.files, function() {
						if ( this.name && $.inArray(this.type, fileTypes) !== -1 ) {
							self.files.push(new Image(this, self.thumbnailGrid));
						}
					});
				});
			}
		}

		class File {
			thumbnail;
			progressBar;

			constructor(public file, public thumbnailGrid) {
				var 
					self     = this,
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
					xhr: function() {
						var xhr = $.ajaxSettings.xhr();

						// Track upload progress
						if ( xhr.upload ) {
							xhr.upload.addEventListener('progress', function(e) {
								if ( e.lengthComputable ) {
									self.progressBar.set(( e.loaded / e.total ) * 100);
								}
							}, false);
						}

						return xhr;
					}
				}, 'json')
				.done(function(data) {
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
				.fail(function(e) {
					self.progressBar.set(0);

					console.log('fail');
				});
			}
		}

		class Image extends File {
			thumbnailSize = 480;

			constructor(public file, public thumbnailGrid) {
				super(file, thumbnailGrid);

				var
					self   = this,
					reader = new FileReader();

				// Generate temporary thumbnail
				reader.onload = function(e) {
					var image = $('<img/>');

					image.on('load', function() {
						var
							thumbnail = $('<img/>'),
							canvas    = $('<canvas/>').get(0),
							ctx       = canvas.getContext('2d'),
							size      = { 
								x: this.width  < this.height ? self.thumbnailSize : this.width  * self.thumbnailSize / this.height,
								y: this.height < this.width  ? self.thumbnailSize : this.height * self.thumbnailSize / this.width
								};

						canvas.width  = self.thumbnailSize;
						canvas.height = self.thumbnailSize;

						// Center image on canvas
						ctx.drawImage(image.get(0), ( canvas.width - size.x ) / 2, ( canvas.height - size.y ) / 2, size.x, size.y);

						thumbnail
							.css({ opacity: 0 })
							.on('load', function() { $(this).animate({ opacity: .5 }, 'fast'); })
							.prop('src', canvas.toDataURL('image/png'))
							.addClass('temporary')
							.prependTo(self.thumbnail.find('.container'));

						$(image, canvas).remove();
					});

					$(image).prop('src', e.target.result);
				}

				reader.readAsDataURL(file);

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

			set(percentage, callback) {
				var self = this;

				this.el.stop(true, true).animate({ width: percentage + '%' }, 200, function() {
					if ( percentage === 100 ) {
						self.el.fadeOut('fast');
					}

					if ( typeof callback === 'function' ) {
						callback();
					}
				});
			}
		}
	}
}

$(function() {
	SHOT.app = new Shot.App();
});
