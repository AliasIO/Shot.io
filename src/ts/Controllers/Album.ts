module Shot {
	export module Controllers {
		/**
		 * Album controller
		 */
		export class Album {
			/**
			 * Grid action
			 */
			grid() {
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
