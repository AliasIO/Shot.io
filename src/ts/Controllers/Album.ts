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
					helpers = new Helpers(),
					thumbnailGrid = $('.thumbnail-grid'),
					thumbnails: Array<Models.Thumbnail> = [],
					placeholder = $('.page-placeholder'),
					album = new Models.Album(SHOT.album),
					navItems: { album: JQuery; editAlbum: JQuery; editThumbnails: JQuery; upload: JQuery } = {
						album: null,
						editAlbum: null,
						editThumbnails: null,
						upload: null
					},
					editThumbnails: Models.Dock,
					multiEdit = new MultiEdit<Models.Thumbnail>(),
					dragDrop = new DragDrop<Models.Thumbnail>(),
					preRender = this.preRender;

				// Edit thumbnails
				editThumbnails = new Models.Dock('#template-dock-thumbnails').render();

				helpers.initDock(editThumbnails);

				$(editThumbnails)
					.on('activate', (e) => {
						multiEdit.toggle(true);
					})
					.on('deactivate', (e) => {
						multiEdit.toggle(false);
					});

				editThumbnails.el
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

						editThumbnails.toggle(false);
					})
					.on('click', '.edit', (e) => {
						var
							data,
							modal: Models.Modal,
							selection = multiEdit.getSelection();

						if ( selection.length === 1 ) {
							data = selection[0].data;
						}

						modal = new Models.Modal('#template-modals-thumbnails-edit-selection', data).render();

						modal.el
							.on('submit', 'form', (e) => {
								var
									ids: Array<number> = [],
									selection = multiEdit.getSelection(),
									title = helpers.htmlEncode(modal.el.find(':input[name="title"]').val()),
									thumbCrop = modal.el.find(':input[name="thumb-crop"]:checked').val();

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

								$.post(SHOT.rootPath + 'ajax/saveImages', { ids: ids, title: helpers.htmlDecode(title), thumbCrop: thumbCrop })
									.done(() => {
										selection.forEach((thumbnail) => {
											thumbnail.data.pending = false;

											if ( thumbCrop ) {
												thumbnail.data.path = thumbnail.data.path.replace(/\?.+$/, '?' + thumbCrop);
											}

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

								modal.close();
							});

						helpers.showModal(modal);

						e.preventDefault();

						$(e.target).blur();
					})
					.on('click', '.albums', (e) => {
						var
							modal: Models.Modal,
							albums = [],
							selection = multiEdit.getSelection();

						// All albums except the current one
						SHOT.albums.forEach((album: any) => {
							if ( album.id !== SHOT.album.id ) {
								albums.push(album);
							}
						});

						modal = new Models.Modal('#template-modals-thumbnails-albums', { albums: albums, album: SHOT.album }).render();

						modal.el
							.on('submit', 'form', (e) => {
								var
									ids: Array<number> = [],
									selection = multiEdit.getSelection(),
									add: Array<number> = [],
									remove = modal.el.find(':input[name="remove"]').is(':checked') ? album.data.id : null,
									removeOther = modal.el.find(':input[name="remove_other"]').is(':checked') ? album.data.id : null;

								e.preventDefault();

								selection.forEach((thumbnail) => {
									ids.push(thumbnail.data.id);

									if ( remove ) {
										thumbnail.el.remove();

										helpers.arrayPull(thumbnails, thumbnail);

										multiEdit.pull(thumbnail);
										dragDrop.pull(thumbnail);
									} else {
										thumbnail.data.pending = true;
										thumbnail.data.error = false;

										thumbnail.render();
									}
								});

								SHOT.albums.forEach((album: any) => {
									if ( modal.el.find(':input[name="album\\[' + album.id + '\\]"]').is(':checked') ) {
										add.push(album.id);
									}
								});

								$.post(SHOT.rootPath + 'ajax/saveImages', {
									ids: ids,
									albums: {
										add: add,
										remove: remove,
										removeOther: removeOther,
									}
								})
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

								modal.close();
							});

						helpers.showModal(modal);

						e.preventDefault();

						$(e.target).blur();
					})
					.on('click', '.delete', (e) => {
						var
							modal = new Models.Modal('#template-modals-thumbnails-delete-selection').render(),
							selection = multiEdit.getSelection();

						e.preventDefault();

						$(e.target).blur();

						modal.el
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

								modal.close();
							})
							.on('click', '.cancel', (e) => {
								modal.close();
							});

						helpers.showModal(modal);
					})
					.appendTo('body');

				// Multi edit events
				$(multiEdit)
					.on('change', () => {
						var selectedCount = multiEdit.getSelection().length;

						editThumbnails.el
							.find('.select-none, .edit, .albums, .delete')
							.prop('disabled', !selectedCount);

						editThumbnails.el
							.find('.select-all')
							.prop('disabled', selectedCount === thumbnails.length);
					})
					.on('activate', () => {
						thumbnailGrid.addClass('multi-edit');

						thumbnails.forEach((thumbnail) => {
							thumbnail.data.draggable = true;

							thumbnail.render();
						});
					})
					.on('deactivate', () => {
						thumbnailGrid.removeClass('multi-edit');

						thumbnails.forEach((thumbnail) => {
							thumbnail.data.draggable = false;

							thumbnail.render();
						});

						multiEdit.selectAll(false);
					});

				// Drag drop events
				$(dragDrop)
					.on('change', () => {
						var items = {};

						thumbnailGrid.find('> li').each((i, el) => {
							items[$(el).data('id')] = i;
						});

						$.post(SHOT.rootPath + 'ajax/saveImagesOrder', { albumId: album.data.id, items: items });
					});

				// Nav items
				navItems.album = $(Handlebars.compile($('#template-nav-item').html())({
					text: album.data.title,
					url: SHOT.rootPath + 'album/' + album.data.id,
					icon: 'folder',
					left: true,
					path: SHOT.rootPath + 'album/' + album.data.id
				}));

				navItems.album.appendTo('.top-bar .left');

				navItems.upload = $(Handlebars.compile($('#template-nav-item').html())({
					text: 'Add images',
					icon: 'plus-circle',
					right: true
				}));

				navItems.upload
					.on('click', (e) => {
						var modal = new Models.Modal('#template-modals-thumbnails-upload').render();

						multiEdit.toggle(false);

						modal.el
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
										notice,
										thumbnail,
										progressBar;

									if ( file.name && $.inArray(file.type, fileTypes) !== -1 ) {
										thumbnail   = new Models.Thumbnail({ title: file.name.replace(/\..{1,4}$/, ''), file: file, formData: new FormData() }).render();
										progressBar = new Models.ProgressBar().render();

										thumbnail.data.formData.append('image', file);
										thumbnail.data.formData.append('albumId', album.data.id);

										placeholder.hide();

										thumbnailGrid.append(thumbnail.el);

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
																thumbnail.data.link = SHOT.rootPath + 'album/' + album.data.id + '/image/' + data.id;
																thumbnail.data.pending = false;

																thumbnail.render();
															});
														})
														.prependTo(thumbnail.el.find('.container'))
														.prop('src', SHOT.rootPath + data.path);
												});
											})
											.progress((data) => {
												progressBar.set(data);
											})
											.fail((e) => {
												notice = new Models.Notice(e.responseJSON.error, 'error').render();

												thumbnail.data.pending = false;
												thumbnail.data.error = true;

												thumbnail.render();

												progressBar.set(0);

												helpers.showNotice(notice);
											});

										thumbnail.el.find('.container').append(progressBar.el);

										thumbnailQueue.push(thumbnail);

										thumbnails.push(thumbnail);
										multiEdit.push(thumbnail);
										dragDrop.push(thumbnail);
									} else {
										notice = new Models.Notice('Invalid file type', 'warn').render();

										helpers.showNotice(notice);
									}
								});

								// Scroll to last thumbnail
								$('html, body').animate({
									scrollTop: thumbnails[thumbnails.length - 1].el.offset().top
								}, 1000);

								// Pre render all thumbnails, one at a time
								(function nextThumbnail() {
									if ( thumbnailQueue.length ) {
										preRender(thumbnailQueue.shift(), () => nextThumbnail());
									}
								})();

								modal.close();
							});

						helpers.showModal(modal);

						e.preventDefault();
					})
					.appendTo('.top-bar .right');

				navItems.editThumbnails = $(Handlebars.compile($('#template-nav-item').html())({
					text: 'Edit images',
					icon: 'pencil',
					right: true
				}));

				navItems.editThumbnails
					.on('click', (e) => {
						e.preventDefault();

						editThumbnails.toggle();
					})
					.appendTo('.top-bar .right');

				// Edit album
				navItems.editAlbum = $(Handlebars.compile($('#template-nav-item').html())({
					text: 'Edit album',
					icon: 'pencil',
					right: true
				}));

				navItems.editAlbum
					.on('click', (e) => {
						var modal = new Models.Modal('#template-modals-albums-edit', album.data).render();

						e.preventDefault();

						modal.el
							.on('submit', 'form', (e) => {
								var title = helpers.htmlEncode(modal.el.find(':input[name="title"]').val());

								e.preventDefault();

								if ( title ) {
									album.data.title = title;

									navItems.album.find('.text').text(helpers.htmlDecode(title));

									document.title = SHOT.siteName + ' - ' + helpers.htmlDecode(title);

									album.save();
								}

								modal.close();
							});

						helpers.showModal(modal);
					})
					.appendTo('.top-bar .right');

				if ( SHOT.thumbnails.length ) {
					placeholder.hide();

					SHOT.thumbnails.forEach((thumbnailData) => {
						var thumbnail = new Models.Thumbnail(thumbnailData);

						thumbnail.data.link = SHOT.rootPath + 'album/' + album.data.id + '/image/' + thumbnail.data.id;

						thumbnailGrid.append(thumbnail.render().el);

						thumbnails.push(thumbnail);
						multiEdit.push(thumbnail);
						dragDrop.push(thumbnail);
					});
				}
			}

			/**
			 * Carousel action
			 */
			carousel(): void {
				var
					helpers = new Helpers(),
					carousel = new Models.Carousel(SHOT.images),
					album = new Models.Album(SHOT.album),
					id: number,
					navItems: { album: JQuery; thumbnail: JQuery; exif: JQuery } = {
						album: null,
						thumbnail: null,
						exif: null
					};

				Foundation.libs.interchange.events(); // Workaround for apparent Foundation Interchange bug

				$(document).foundation('interchange', {
					named_queries: {
						'1600': 'only screen and (min-width: 1024px)',
						'2048': 'only screen and (min-width: 1600px)',
						'original': 'only screen and (min-width: 2048px)'
					}
				});

				carousel.render();

				// Obtain image ID from URL
				id = parseInt(location.pathname.replace(/^\/album\/\d\/image\/(\d)/, (match, a) => { return a; }));

				// Nav items
				navItems.album = $(Handlebars.compile($('#template-nav-item').html())({
					text: album.data.title,
					icon: 'folder',
					url: SHOT.rootPath + 'album/' + album.data.id,
					left: true
				}));

				navItems.album.appendTo('.top-bar .left');

				navItems.exif = $(Handlebars.compile($('#template-nav-item').html())({
					text: 'Exif',
					icon: 'info-circle',
					right: true
				}));

				navItems.exif.appendTo('.top-bar .right');

				navItems.exif
					.on('click', (e) => {
						var modal = new Models.Modal('#template-modals-images-exif', { exif: carousel.getCurrent().data.exif }).render();

						helpers.showModal(modal);

						e.preventDefault();
					})
					.appendTo('.top-bar .right');

				// Carousel events
				carousel.el.on('change', (e, image: Models.Image) => {
					// Nav item
					if ( navItems.thumbnail ) {
						navItems.thumbnail.remove();
					}

					navItems.thumbnail = $(Handlebars.compile($('#template-nav-item').html())({
						text: image.data.title,
						icon: 'picture-o',
						url: SHOT.rootPath + 'album/' + album.data.id + '/image/' + image.data.id,
						left: true
					}));

					navItems.thumbnail.appendTo('.top-bar .left');

					// Update the URL
					if ( image.data.id !== id ) {
						id = image.data.id;

						history.pushState({ id: id }, '', '/album/' + album.data.id + '/image/' + id);
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
							canvas = <HTMLCanvasElement> $('<canvas/>').get(0),
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
