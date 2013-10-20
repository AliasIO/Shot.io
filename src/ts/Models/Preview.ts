module Shot {
	export module Models {
		/**
		 * Preview model
		 */
		export class Preview {
			private el;
			private id: number;

			constructor(size, parent, filePath) {
				this.id = new Date().getTime() + Math.round(Math.random() * 999);

				this.el = $('<img/>');

				// Render pre-load image in place of the actual image
				$(window).on('resize.' + this.id, () => {
					var parentSize = { x: parent.width(), y: parent.height() };

					if ( size.x > parentSize.x ) {
						size.y *= parentSize.x / size.x;
						size.x  = parentSize.x;
					}

					if ( size.y > parentSize.y ) {
						size.x *= parentSize.y / size.y;
						size.y  = parentSize.y;
					}

					this.el.css({
						position: 'absolute',
						top: ( parentSize.y / 2 ) - ( size.y / 2 ),
						height: size.y,
						width: size.x
					});

					switch ( parent.css('textAlign') ) {
						case 'start':
							this.el.css({ left: 0 });

							break;
						case 'center':
							this.el.css({ left: ( parentSize.x / 2 ) - ( size.x / 2 ) });

							break;
						case 'right':
							this.el.css({ right: 0 });

							break;
					}
				})
				.trigger('resize');

				this.el
					.addClass('preview')
					.prop('src', filePath)
					.appendTo(parent);

				return this;
			}

			/**
			 * Remove the image
			 */
			public destroy(): void {
				this.el.remove();

				$(window).off('resize.' + this.id);
			}
		}
	}
}
