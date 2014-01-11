module Shot {
	export module Models {
		/**
		 * Editable model
		 */
		export class Editable {
			el: JQuery;
			data: { id?: number; title?: string; path?: string; pending?: boolean; error?: boolean; draggable?: boolean };

			private selected = false;

			constructor() {
			}

			/**
			 * Render
			 */
			render(): Editable {
				this.el.on('click', (e) => {
					if ( $(e.target).closest('.drag-handle').length ) {
						e.preventDefault();
					} else {
						var event = $.Event('click');

						event.originalEvent = e;

						$(this).trigger(event);
					}
				});

				return this;
			}

			/**
			 * Select
			 */
			select(selected: boolean): Editable {
				this.selected = selected;

				this.el.toggleClass('selected', selected);

				return this;
			}

			/**
			 * Is selected
			 */
			isSelected(): boolean {
				return this.selected;
			}
		}
	}
}
