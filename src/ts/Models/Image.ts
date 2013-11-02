module Shot {
	export module Models {
		/**
		 * Image model
		 */
		export class Image {
			el;

			private template;

			constructor(public data) {
				this.template = $('#template-image').html();

				return this;
			}

			/**
			 * Render
			 */
			render(): Image {
				var
					data = $.extend({}, this.data),
					id = new Date().getTime() + Math.round(Math.random() * 999),
					el,
					preview;

				if ( this.el ) {
					this.el.replaceWith($(Mustache.render(this.template, data)));
				} else {
					// Render pre-load image in place of the actual image
					data.url = this.data.paths.preview;

					this.el = $(Mustache.render(this.template, data));

					preview = this.el.find('img');

					$(window).on('resize.' + id, () => this.resize(preview));

					// Load actual image
					el = $('<img/>');

					el
						.prop('src', this.data.url)
						.on('load', (e) => {
							$(window).off('resize.' + id);

							preview.replaceWith(el)
						});
				}

				return this;
			}

			/**
			 * Scale preview image to fit parent element
			 */
			resize(el) {
				var
					size = { x: this.data.width, y: this.data.height },
					parentSize;

				if ( !$.contains(document.documentElement, this.el.get(0)) ) {
					return;
				}

				parentSize = {
					x: this.el.parent().width(),
					y: this.el.parent().height()
				};

				if ( size.x > parentSize.x ) {
					size.y *= parentSize.x / size.x;
					size.x  = parentSize.x;
				}

				if ( size.y > parentSize.y ) {
					size.x *= parentSize.y / size.y;
					size.y  = parentSize.y;
				}

				el.css({
					position: 'absolute',
					top: ( parentSize.y / 2 ) - ( size.y / 2 ),
					height: size.y,
					width: size.x
				});

				switch ( this.el.css('textAlign') ) {
					case 'start':
						el.css({ left: 0 });

						break;
					case 'center':
						el.css({ left: ( parentSize.x / 2 ) - ( size.x / 2 ) });

						break;
					case 'right':
						el.css({ right: 0 });

						break;
				}
			}
		}
	}
}
