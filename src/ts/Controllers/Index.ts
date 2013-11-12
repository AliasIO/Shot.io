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

				// Nav item
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
		}
	}
}
