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
						var album = new Models.Album(albumData).render();

						thumbnailGrid.prepend(album.el);

						albums.push(album);
					});
				}
			}
		}
	}
}
