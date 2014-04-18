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
					helpers = new Helpers(),
					thumbnailGrid = $('.thumbnail-grid'),
					albums: Array<Models.Album> = [],
					navItems: { createAlbum: JQuery; editAlbums: JQuery } = { createAlbum: null, editAlbums: null },
					editAlbums: Models.Dock,
					multiEdit = new MultiEdit<Models.Album>(),
					dragDrop = new DragDrop<Models.Album>();

				// Edit albums
				editAlbums = new Models.Dock('#template-dock-albums').render();

				helpers.initDock(editAlbums);

				$(editAlbums)
					.on('activate', (e) => {
						multiEdit.toggle(true);
					})
					.on('deactivate', (e) => {
						multiEdit.toggle(false);
					});

				editAlbums.el
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

						editAlbums.toggle(false);
					})
					.on('click', '.edit', (e) => {
						var
							data,
							modal: Models.Modal,
							selection = multiEdit.getSelection();

						if ( selection.length === 1 ) {
							data = selection[0].data;
						}

						modal = new Models.Modal('#template-modals-albums-edit-selection', data).render();

						modal.el
							.on('submit', 'form', (e) => {
								var
									ids: Array<number> = [],
									selection = multiEdit.getSelection(),
									title = helpers.htmlEncode(modal.el.find(':input[name="title"]').val());

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

								$.post(SHOT.rootPath + 'ajax/saveAlbums', { ids: ids, title: helpers.htmlDecode(title) })
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

								modal.close();
							});

						helpers.showModal(modal);

						e.preventDefault();

						$(e.target).blur();
					})
					.on('click', '.delete', (e) => {
						var
							modal = new Models.Modal('#template-modals-albums-delete-selection').render(),
							selection = multiEdit.getSelection();

						e.preventDefault();

						$(e.target).blur();

						modal.el
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

								modal.close();
							});

						helpers.showModal(modal);
					})
					.appendTo('body');

				// Multi edit events
				$(multiEdit)
					.on('change', () => {
						var selectedCount = multiEdit.getSelection().length;

						editAlbums.el
							.find('.select-none, .edit, .delete')
							.prop('disabled', !selectedCount);

						editAlbums.el
							.find('.select-all')
							.prop('disabled', selectedCount === albums.length);
					})
					.on('activate', () => {
						thumbnailGrid.addClass('multi-edit');

						albums.forEach((album) => {
							album.data.draggable = true;

							album.render();
						});
					})
					.on('deactivate', () => {
						thumbnailGrid.removeClass('multi-edit');

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

				navItems.createAlbum = $(Handlebars.compile($('#template-nav-item').html())({
					text: 'Add album',
					icon: 'plus-circle',
					right: true
				}));

				navItems.createAlbum
					.on('click', (e) => {
						var modal = new Models.Modal('#template-modals-albums-create').render();

						multiEdit.toggle(false);

						e.preventDefault();

						$(e.target).blur();

						modal.el
							.on('submit', 'form', (e) => {
								var
									title = modal.el.find(':input[name="title"]').val(),
									album: Models.Album;

								if ( title ) {
									album = new Models.Album({ title: title });

									album
										.save()
										.done(() => {
											album.data.link = SHOT.rootPath + 'album/' + album.data.id;
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

								modal.close();
							});

						helpers.showModal(modal);
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

						editAlbums.toggle();
					})
					.appendTo('.top-bar .right');

				if ( SHOT.albums ) {
					SHOT.albums.forEach((albumData) => {
						var album = new Models.Album(albumData);

						album.data.link = SHOT.rootPath + 'album/' + album.data.id;

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
