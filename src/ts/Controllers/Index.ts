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
					albums = [];

				if ( SHOT.albums ) {
					$.each(SHOT.albums, (i, albumData) => {
						var album = new Models.Album(albumData);

						album.data.link = SHOT.rootPath + 'album/grid/' + album.data.id;

						thumbnailGrid.prepend(album.render().el);

						albums.push(album);
					});
				}
			}
		}
	}
}
