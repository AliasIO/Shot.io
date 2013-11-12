module Shot {
	export module Controllers {
		/**
		 * Index controller
		 */
		export class Index {
			/**
			 * Index action
			 */
			index(): void {
				var
					thumbnailGrid = $('.thumbnail-grid'),
					albums: Array<Models.Album> = [],
					navItem: JQuery,
					editAlbums: JQuery,
					multiEdit = new MultiEdit<Models.Album>();

				// Nav items
				/*

				navItems.upload = $(Mustache.render($('#template-nav-item').html(), {
					text: 'Upload images',
					icon: 'picture-o',
					right: true
				}));

				navItems.upload
					.on('click', (e) => {
						var modal = $(Mustache.render($('#template-edit-albums-upload').html(), {}));

						modal
							.on('change', ':input[type="file"]', (e: any) => {
								var
									thumbnailSize = 480,
									thumbnailQueue: Models.Thumbnail[] = [],
									fileTypes = [
										'image/jpg',
										'image/jpeg',
										'image/png',
										'image/gif',
										'image/bmp'
									];

								e.preventDefault();

								$.each(e.target.files, (i, file) => {
									var
										thumbnail,
										progressBar;

									if ( file.name && $.inArray(file.type, fileTypes) !== -1 ) {
										thumbnail   = new Models.Thumbnail({ title: file.name.replace(/\..{1,4}$/, ''), file: file, formData: new FormData() }).render();
										progressBar = new Models.ProgressBar().render();

										thumbnail.data.formData.append('image', file);
										thumbnail.data.formData.append('albumId', SHOT.album.id);

										thumbnail.el.find('.container').append(progressBar.el);

										thumbnailGrid.prepend(thumbnail.el);

										$(thumbnail).on('delete', () => {
											thumbnail.el.remove();

											thumbnail = null;
										});

										thumbnail.save()
											.done((data) => {
												progressBar.set(100, () => {
													var image = $('<img/>');

													image
														.hide()
														.on('load', (e) => {
															// Replace temporary thumbnail with processed image
															thumbnail.el.find('.temporary').fadeOut('fast', function() {
																$(this).remove();
															});

															// Remove processing indicator
															thumbnail.el.find('.processing').fadeOut('fast');

															// Reveal the processed image
															$(e.target).fadeIn('fast', () => {
																thumbnail.data.link = SHOT.rootPath + 'album/carousel/' + SHOT.album.id + '/' + data.id;

																thumbnail.render();
															});
														})
														.prependTo(thumbnail.el.find('.container'))
														.prop('src', data.path);

													multiEdit.push(thumbnail);
												});
											})
											.progress((data) => {
												progressBar.set(data);
											})
											.fail((e) => {
												progressBar.set(0);

												thumbnail.el.find('.container').addClass('error');

												console.log('fail');
											});

										thumbnailQueue.push(thumbnail);
									}
								});


								// Pre render all thumbnails, one at a time
								(function nextThumbnail() {
									if ( thumbnailQueue.length ) {
										this.preRender(thumbnailQueue.shift(), () => nextThumbnail());
									}
								})();

							})
							.on('click', '.cancel', (e) => {
								modal.remove();
							})
							.appendTo('body')
							.show()
							.find('.modal-content')
							.css({ marginTop: $(document).scrollTop() + 'px' });

						e.preventDefault();
					})
					.appendTo('.top-bar .right');

				*/

				navItem = $(Mustache.render($('#template-nav-item').html(), {
					text: 'Edit albums',
					icon: 'pencil',
					right: true
				}));

				navItem
					.on('click', (e) => {
						e.preventDefault();

						multiEdit.toggle();
					})
					.appendTo('.top-bar .right');

				// Edit albums
				editAlbums = $(Mustache.render($('#template-edit-albums').html(), {}));

				editAlbums
					.on('click', '.select-all', (e) => {
						e.preventDefault();

						$(e.target).blur();

						multiEdit.selectAll(true);
					})
					.on('click', '.select-none', (e) => {
						e.preventDefault();

						$(e.target).blur();

						multiEdit.selectAll(false);
					})
					.on('click', '.close', (e) => {
						e.preventDefault();

						$(e.target).blur();

						multiEdit.toggle(false);
					})
					.on('click', '.edit', (e) => {
						var
							modal = $(Mustache.render($('#template-edit-albums-edit').html(), {})),
							selection = multiEdit.getSelection();

						modal
							.on('submit', 'form', (e) => {
								var
									ids: Array<number> = [],
									selection = multiEdit.getSelection(),
									title = modal.find(':input[name="title"]').val();

								e.preventDefault();

								selection.forEach((album) => {
									ids.push(album.data.id);

									album.data.pending = true;
									album.data.error = false;

									if ( title ) {
										album.data.title = title;
									}

									album.render();
								});

								$.post(SHOT.rootPath + 'ajax/saveAlbums', { ids: ids, title: title })
									.done(() => {
										selection.forEach((album) => {
											album.data.pending = false;

											album.render();
										});
									})
									.fail(() => {
										selection.forEach((album) => {
											album.data.pending = false;
											album.data.error = true;

											album.render();
										});
									});

								modal.remove();
							})
							.on('click', '.cancel', (e) => {
								modal.remove();
							})
							.appendTo('body')
							.show()
							.find('.modal-content')
							.css({ marginTop: $(document).scrollTop() + 'px' });

						e.preventDefault();

						$(e.target).blur();
					})
					.on('click', '.delete', (e) => {
						var
							modal = $(Mustache.render($('#template-edit-albums-delete').html(), {})),
							selection = multiEdit.getSelection();

						e.preventDefault();

						$(e.target).blur();

						modal
							.on('submit', 'form', (e) => {
								var
									ids: Array<number> = [],
									selection = multiEdit.getSelection();

								e.preventDefault();

								selection.forEach((album) => {
									ids.push(album.data.id);

									album.el.remove();
								});

								$.post(SHOT.rootPath + 'ajax/deleteAlbums', { ids: ids });

								modal.remove();
							})
							.on('click', '.cancel', (e) => {
								modal.remove();
							})
							.appendTo('body')
							.show()
							.find('.modal-content')
							.css({ marginTop: $(document).scrollTop() + 'px' });
					})
					.appendTo('body');

				// Multi edit events
				$(multiEdit)
					.on('change', () => {
						var selectedCount = multiEdit.getSelection().length;

						editAlbums
							.find('.select-none, .edit, .delete')
							.attr('disabled', !selectedCount);

						editAlbums
							.find('.select-all')
							.attr('disabled', selectedCount === albums.length);
					})
					.on('activate', () => {
						editAlbums
							.stop()
							.css({ bottom: -20, opacity: 0 })
							.show()
							.animate({ bottom: 0, opacity: 1 });
					})
					.on('deactivate', () => {
						editAlbums
							.stop()
							.animate({ bottom: -20, opacity: 0 }, 'fast');

						multiEdit.selectAll(false);
					})
					.trigger('change');

				multiEdit.toggle(true);

				if ( SHOT.albums ) {
					SHOT.albums.forEach((albumData) => {
						var album = new Models.Album(albumData);

						album.data.link = SHOT.rootPath + 'album/grid/' + album.data.id;

						thumbnailGrid.prepend(album.render().el);

						albums.push(album);

						multiEdit.push(album);
					});
				}
			}

			/**
			 * Pre render thumbnail
			 */
			/*
			private preRender = (thumbnail: Models.Thumbnail, callback: () => void) => {
				var reader = new FileReader();

				callback = typeof callback === 'function' ? callback : () => {};

				// Generate temporary thumbnail
				reader.onload = (e) => {
					var image = $('<img/>');

					image.on('load', (e: any) => {
						var
							canvas = $('<canvas/>').get(0),
							size = {
								x: e.target.width  < e.target.height ? thumbnailSize : e.target.width  * thumbnailSize / e.target.height,
								y: e.target.height < e.target.width  ? thumbnailSize : e.target.height * thumbnailSize / e.target.width
								};

						canvas.width  = thumbnailSize;
						canvas.height = thumbnailSize;

						// Center image on canvas
						canvas
							.getContext('2d')
							.drawImage(e.target, ( canvas.width - size.x ) / 2, ( canvas.height - size.y ) / 2, size.x, size.y);

						$(canvas)
							.hide()
							.fadeIn('fast')
							.addClass('temporary')
							.prependTo(thumbnail.el.find('.container'));

						callback();
					});

					image.on('error', () => callback());

					image.prop('src', e.target.result);
				}

				reader.onerror = () => callback();

				reader.readAsDataURL(thumbnail.data.file);
			};
			*/
		}
	}
}
