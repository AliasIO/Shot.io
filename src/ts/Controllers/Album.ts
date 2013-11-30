module Shot {
	export module Controllers {
		/**
		 * Album controller
		 */
		export class Album {
			/**
			 * Grid action
			 */
			grid(): void {
				var
					thumbnailGrid = $('.thumbnail-grid'),
					thumbnails: Array<Models.Thumbnail> = [],
					album = new Models.Album(SHOT.album),
					navItems: { album: JQuery; editAlbum: JQuery; editThumbnails: JQuery; upload: JQuery } = {
						album: null,
						editAlbum: null,
						editThumbnails: null,
						upload: null
					},
					editThumbnails: JQuery,
					multiEdit = new MultiEdit<Models.Thumbnail>(),
					dragDrop = new DragDrop<Models.Thumbnail>(),
					preRender = this.preRender;

				// Nav items
				navItems.album = $(Mustache.render($('#template-nav-item').html(), {
					text: album.data.title,
					icon: 'folder',
					left: true,
					path: SHOT.rootPath + 'album/grid/' + album.data.id
				}));

				navItems.album.appendTo('.top-bar .left');

				navItems.upload = $(Mustache.render($('#template-nav-item').html(), {
					text: 'Add images',
					icon: 'plus-circle',
					right: true
				}));

				navItems.upload
					.on('click', (e) => {
						var modal = $(Mustache.render($('#template-modals-thumbnails-upload').html(), {}));

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
										thumbnail.data.formData.append('albumId', album.data.id);

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
																thumbnail.data.link = SHOT.rootPath + 'album/carousel/' + album.data.id + '/' + data.id;
																thumbnail.data.pending = false;

																thumbnail.render();
															});
														})
														.prependTo(thumbnail.el.find('.container'))
														.prop('src', data.path);
												});
											})
											.progress((data) => {
												progressBar.set(data);
											})
											.fail((e) => {
												thumbnail.data.pending = false;
												thumbnail.data.error = true;

												thumbnail.render();

												progressBar.set(0);
											});

										thumbnail.el.find('.container').append(progressBar.el);

										thumbnailQueue.push(thumbnail);

										multiEdit.push(thumbnail);
										dragDrop.push(thumbnail);
									}
								});

								// Pre render all thumbnails, one at a time
								(function nextThumbnail() {
									if ( thumbnailQueue.length ) {
										preRender(thumbnailQueue.shift(), () => nextThumbnail());
									}
								})();

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
					})
					.appendTo('.top-bar .right');

				navItems.editThumbnails = $(Mustache.render($('#template-nav-item').html(), {
					text: 'Edit images',
					icon: 'pencil',
					right: true
				}));

				navItems.editThumbnails
					.on('click', (e) => {
						e.preventDefault();

						multiEdit.toggle();
					})
					.appendTo('.top-bar .right');

				// Edit album
				navItems.editAlbum = $(Mustache.render($('#template-nav-item').html(), {
					text: 'Edit album',
					icon: 'pencil',
					right: true
				}));

				navItems.editAlbum
					.on('click', (e) => {
						var modal = $(Mustache.render($('#template-modals-albums-edit').html(), {}));

						e.preventDefault();

						modal
							.on('submit', 'form', (e) => {
								var title = modal.find(':input[name="title"]').val();

								e.preventDefault();

								if ( title ) {
									album.data.title = title;

									navItems.album.find('.text').text(title);

									document.title = title; // TODO Add website name

									album.save();
								}

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
					.appendTo('.top-bar .right');

				// Edit thumbnails
				editThumbnails = $(Mustache.render($('#template-dock-thumbnails').html(), {}));

				editThumbnails
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
							modal = $(Mustache.render($('#template-modals-thumbnails-edit-selection').html(), {})),
							selection = multiEdit.getSelection();

						modal
							.on('submit', 'form', (e) => {
								var
									ids: Array<number> = [],
									selection = multiEdit.getSelection(),
									title = modal.find(':input[name="title"]').val();

								e.preventDefault();

								selection.forEach((thumbnail) => {
									ids.push(thumbnail.data.id);

									thumbnail.data.pending = true;
									thumbnail.data.error = false;

									if ( title ) {
										thumbnail.data.title = title;
									}

									thumbnail.render();
								});

								$.post(SHOT.rootPath + 'ajax/saveImages', { ids: ids, title: title })
									.done(() => {
										selection.forEach((thumbnail) => {
											thumbnail.data.pending = false;

											thumbnail.render();
										});
									})
									.fail(() => {
										selection.forEach((thumbnail) => {
											thumbnail.data.pending = false;
											thumbnail.data.error = true;

											thumbnail.render();
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
							modal = $(Mustache.render($('#template-modals-thumbnails-delete-selection').html(), {})),
							selection = multiEdit.getSelection();

						e.preventDefault();

						$(e.target).blur();

						modal
							.on('submit', 'form', (e) => {
								var
									ids: Array<number> = [],
									selection = multiEdit.getSelection();

								e.preventDefault();

								selection.forEach((thumbnail) => {
									ids.push(thumbnail.data.id);

									thumbnail.el.remove();
								});

								$.post(SHOT.rootPath + 'ajax/deleteImages', { ids: ids });

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

						editThumbnails
							.find('.select-none, .edit, .delete')
							.attr('disabled', !selectedCount);

						editThumbnails
							.find('.select-all')
							.attr('disabled', selectedCount === thumbnails.length);
					})
					.on('activate', () => {
						editThumbnails
							.stop()
							.css({ bottom: -20, opacity: 0 })
							.show()
							.animate({ bottom: 0, opacity: 1 });
					})
					.on('deactivate', () => {
						editThumbnails
							.stop()
							.animate({ bottom: -20, opacity: 0 }, 'fast');

						multiEdit.selectAll(false);
					});

				if ( SHOT.thumbnails ) {
					SHOT.thumbnails.forEach((thumbnailData) => {
						var thumbnail = new Models.Thumbnail(thumbnailData);

						thumbnail.data.link = SHOT.rootPath + 'album/carousel/' + album.data.id + '/' + thumbnail.data.id;

						thumbnailGrid.append(thumbnail.render().el);

						thumbnails.push(thumbnail);

						multiEdit.push(thumbnail);
						dragDrop.push(thumbnail);

						thumbnail.el.on('click', (e) => {
							console.log(thumbnail.el.offset());
						});
					});
				}
			}

			/**
			 * Carousel action
			 */
			carousel(): void {
				var
					carousel = new Models.Carousel(SHOT.images),
					album = new Models.Album(SHOT.album),
					id: number,
					navItems: { album: JQuery; thumbnail: JQuery; } = {
						album: null,
						thumbnail: null
					};

				$(document).foundation('interchange', {
					named_queries: {
						'1600': 'only screen and (min-width: 1024px)',
						'2048': 'only screen and (min-width: 1600px)',
						'original': 'only screen and (min-width: 2048px)'
					}
				});

				carousel.render();

				// Obtain image ID from URL
				id = parseInt(location.pathname.replace(/^\/album\/carousel\/\d\/(\d)/, (match, a) => { return a; }));

				// Nav item
				navItems.album = $(Mustache.render($('#template-nav-item').html(), {
					text: album.data.title.replace(/&amp;/g, '&'),
					icon: 'folder',
					url: SHOT.rootPath + 'album/grid/' + album.data.id,
					left: true
				}));

				navItems.album.appendTo('.top-bar .left');

				// Carousel events
				carousel.el.on('change', (e, image: Models.Image) => {
					// Nav item
					if ( navItems.thumbnail ) {
						navItems.thumbnail.remove();
					}

					navItems.thumbnail = $(Mustache.render($('#template-nav-item').html(), {
						text: image.data.title.replace(/&amp;/g, '&'),
						icon: 'picture-o',
						url: SHOT.rootPath + 'album/carousel/' + album.data.id + '/' + image.data.id,
						left: true
					}));

					navItems.thumbnail.appendTo('.top-bar .left');

					// Update the URL
					if ( image.data.id !== id ) {
						id = image.data.id;

						history.pushState({ id: id }, '', '/album/carousel/' + album.data.id + '/' + id);
					}

					$(document).foundation('interchange', 'reflow');
				});

				$('#carousel-wrap').append(carousel.el);

				if ( id ) {
					carousel.show(id);
				}

				$(window).on('popstate', (e) => {
					if ( e.originalEvent.state ) {
						carousel.show(e.originalEvent.state.id);
					}
				});

				// Keyboard shortcuts
				$(document).on('keydown', (e) => {
					switch ( e.keyCode ) {
						case 35: // End
							e.preventDefault();

							if ( carousel.index < carousel.images.length - 1 ) {
								carousel.show(carousel.images[carousel.images.length - 1].data.id);
							}

							break;
						case 36: // Home
							e.preventDefault();

							if ( carousel.index > 0 ) {
								carousel.show(carousel.images[0].data.id);
							}

							break;
						case 33: // Page up
						case 37: // Left arrow
						case 38: // Up arrow
							e.preventDefault();

							if ( carousel.index > 0 ) {
								carousel.show(carousel.images[carousel.index - 1].data.id);
							}

							break;
						case 32: // Space
						case 34: // Page down
						case 39: // Right arrow
						case 40: // Down arrow
							e.preventDefault();

							if ( carousel.index < carousel.images.length - 1 ) {
								carousel.show(carousel.images[carousel.index + 1].data.id);
							}

							break;
					}
				});

				$(window).trigger('resize');
			}

			/**
			 * Pre render thumbnail
			 */
			private preRender = (thumbnail: Models.Thumbnail, callback: () => void) => {
				var
					reader = new FileReader(),
					thumbnailSize = 480;

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
			}
		}
	}
}
