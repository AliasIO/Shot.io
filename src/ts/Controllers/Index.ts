module Shot {
	export module Controllers {
		/**
		 * Index controller
		 */
		export class Index {
			/**
			 * Index action
			 */
			index() {
				var
					thumbnailGrid = $('.thumbnail-grid'),
					albums = [],
					editMode = new EditMode<Models.Album>();

				if ( SHOT.albums ) {
					SHOT.albums.forEach((albumData) => {
						var album = new Models.Album(albumData);

						album.data.link = SHOT.rootPath + 'album/grid/' + album.data.id;

						thumbnailGrid.prepend(album.render().el);

						albums.push(album);

						editMode.push(album);
					});
				}
			}
		}
	}
}
