module Shot {
	/**
	 * Ajax upload
	 */
	export module AjaxUpload {
		var fileTypes = [
			'image/jpg',
			'image/jpeg',
			'image/png',
			'image/gif',
			'image/bmp'
		];

		/**
		 * Ajax upload form
		 */
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

		/**
		 * Ajax upload file
		 */
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

		/**
		 * Ajax upload image
		 */
		class Image extends File {
			thumbnailSize = 480;

			constructor(public file, public thumbnailGrid) {
				super(file, thumbnailGrid);

				return this;
			}

			/**
			 * Create temporary thumbnail while uploading file
			 */
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

		/**
		 * Ajax upload file progress bar
		 */
		class ProgressBar {
			el;

			constructor(public thumbnail) {
				var wrap = $('<div class="progressbar-wrap"/>');

				this.el = $('<div class="progressbar"/>');

				wrap.append(this.el);

				thumbnail.find('.container').append(wrap);
			}

			/**
			 * Update progress bar value
			 */
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
}
