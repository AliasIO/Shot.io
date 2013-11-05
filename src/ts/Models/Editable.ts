module Shot {
	export module Models {
		/**
		 * Editable model
		 */
		export class Editable {
			el;

			private selected = false;

			constructor() {
			}

			/**
			 * Render
			 */
			render(): Editable {
				this.el.on('click', (e) => {
					var event = $.Event('click');

					event.originalEvent = e;

					$(this).trigger(event);
				});

				return this;
			}

			/**
			 * Select
			 */
			select(on:boolean): Editable {
				this.selected = on;

				this.el.toggleClass('selected', this.selected);

				return this;
			}

			/**
			 * Is selected
			 */
			isSelected() {
				return this.selected;
			}
		}
	}
}
