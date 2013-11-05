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
					thumbnails = [],
					editMode = new EditMode<Models.Thumbnail>();

				if ( SHOT.thumbnails ) {
					SHOT.thumbnails.forEach((thumbnailData) => {
						var thumbnail = new Models.Thumbnail(thumbnailData);

						thumbnail.data.link = SHOT.rootPath + 'album/carousel/' + SHOT.album.id + '/' + thumbnail.data.id;

						thumbnailGrid.append(thumbnail.render().el);

						thumbnails.push(thumbnail);

						editMode.push(thumbnail);
					});
				}
			}

			/**
			 * Carousel action
			 */
			carousel() {
				var
					carousel = new Models.Carousel(SHOT.images),
					id: number,
					navItem = null;

				carousel.render();

				// Obtain image ID from URL
				id = parseInt(location.pathname.replace(/^\/album\/carousel\/\d\/(\d)/, (match, a) => { return a; }));

				carousel.el.on('change', (e, image: Models.Image) => {
					// Nav item
					if ( navItem ) {
						navItem.remove();
					}

					navItem = $(Mustache.render($('#template-nav-item').html(), {
						text: image.data.title.replace(/&amp;/g, '&'),
						icon: 'picture-o',
						url: SHOT.rootPath + 'album/' + SHOT.album.id + '/' + image.data.id,
						left: true
					}));

					$('.top-bar .left').append(navItem);

					// Update the URL
					if ( image.data.id !== id ) {
						id = image.data.id;

						history.pushState({ id: id }, '', '/album/carousel/' + SHOT.album.id + '/' + id);
					}
				});

				if ( id ) {
					carousel.show(id);
				}

				$('#carousel-wrap').append(carousel.el);

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
		}
	}
}
