module Shot {
	export module Controllers {
		/**
		 * Album controller
		 */
		export class Album {
			/**
			 * Index action
			 */
			grid() {
				var
					thumbnailGrid = $('.thumbnail-grid'),
					thumbnails = [];

				if ( SHOT.thumbnails ) {
					$.each(SHOT.thumbnails, (i, thumbnailData) => {
						var thumbnail = new Models.Thumbnail(thumbnailData).render();

						thumbnailGrid.prepend(thumbnail.el);

						thumbnails.push(thumbnail);
					});
				}
			}

			/**
			 * Carousel action
			 */
			carousel() {
				new Models.Carousel($('.carousel'), SHOT.images);
			}
		}
	}
}
