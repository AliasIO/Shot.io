module Shot {
	export module Models {
		/**
		 * Image model
		 */
		export class Image {
			el;
			preview: Models.Preview;

			constructor(public data) {
				this.el = $('<img/>');

				return this;
			}

			/**
			 * Add image to DOM, display preview image while loading
			 */
			appendTo(parent): Image {
				this.preview = new Models.Preview({ x: this.data.width, y: this.data.height }, parent, this.data.paths.preview);

				this.el.appendTo(parent);

				return this;
			}

			/**
			 * Load the image, replace preview image
			 */
			render(size: number): Image {
				var el = $('<img/>');

				el.prop('src', this.data.paths[size] ? this.data.paths[size] : this.data.paths['original']);

				el.on('load', (e) => {
					// Replace previously rendered image
					this.el.replaceWith(el);

					this.el = el;

					// Remove preview image
					if ( this.preview ) {
						this.preview.destroy();
					}
				});

				return this;
			}
		}
	}
}
