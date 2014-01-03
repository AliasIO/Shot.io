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
					navItems: { createAlbum: JQuery; editAlbums: JQuery } = { createAlbum: null, editAlbums: null },
					editAlbums: JQuery,
					multiEdit = new MultiEdit<Models.Album>(),
					dragDrop = new DragDrop<Models.Album>();

				navItems.createAlbum = $(Handlebars.compile($('#template-nav-item').html())({
					text: 'Add album',
					icon: 'plus-circle',
					right: true
				}));

				navItems.createAlbum
					.on('click', (e) => {
						var modal = $(Handlebars.compile($('#template-modals-albums-create').html())({}));

						multiEdit.toggle(false);

						e.preventDefault();

						$(e.target).blur();

						modal
							.on('submit', 'form', (e) => {
								var
									title = modal.find(':input[name="title"]').val(),
									album: Models.Album;

								if ( title ) {
									album = new Models.Album({ title: title });

									album
										.save()
										.done(() => {
											album.data.link = SHOT.rootPath + 'album/grid/' + album.data.id;
											album.data.pending = false;

											album.render();
										})
										.fail(() => {
											album.data.pending = false;
											album.data.error = true;

											album.render();
										});

									thumbnailGrid.append(album.render().el);

									albums.push(album);
									multiEdit.push(album);
									dragDrop.push(album);

									// Scroll to last album
									$('html, body').animate({
										scrollTop: album.el.offset().top
									}, 1000);
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

				navItems.editAlbums = $(Handlebars.compile($('#template-nav-item').html())({
					text: 'Edit albums',
					icon: 'pencil',
					right: true
				}));

				navItems.editAlbums
					.on('click', (e) => {
						e.preventDefault();

						multiEdit.toggle();
					})
					.appendTo('.top-bar .right');

				// Edit albums
				editAlbums = $(Handlebars.compile($('#template-dock-albums').html())({}));

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
							modal = $(Handlebars.compile($('#template-modals-albums-edit-selection').html())({})),
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
							modal = $(Handlebars.compile($('#template-modals-albums-delete-selection').html())({})),
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

						albums.forEach((album) => {
							album.data.draggable = true;

							album.render();
						});
					})
					.on('deactivate', () => {
						editAlbums
							.stop()
							.animate({ bottom: -20, opacity: 0 }, 'fast');

						albums.forEach((album) => {
							album.data.draggable = false;

							album.render();
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

						$.post(SHOT.rootPath + 'ajax/saveAlbumsOrder', { items: items });
					});

				if ( SHOT.albums ) {
					SHOT.albums.forEach((albumData) => {
						var album = new Models.Album(albumData);

						album.data.link = SHOT.rootPath + 'album/grid/' + album.data.id;

						thumbnailGrid.append(album.render().el);

						albums.push(album);
						multiEdit.push(album);
						dragDrop.push(album);
					});
				}
			}
		}
	}
}
