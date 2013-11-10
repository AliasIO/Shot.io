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
					editMode = new EditMode<Models.Album>();

				if ( SHOT.albums ) {
					SHOT.albums.forEach((albumData) => {
						var album = new Models.Album(albumData);

						album.data.link = SHOT.rootPath + 'album/grid/' + album.data.id;

						thumbnailGrid.prepend(album.render().el);

						$(album).on('delete', () => {
							album.el.remove();

							album = null;
						});

						editMode.push(album);
					});
				}
			}
		}
	}
}
