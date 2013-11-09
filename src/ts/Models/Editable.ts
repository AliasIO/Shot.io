module Shot {
	export module Models {
		/**
		 * Editable model
		 */
		export class Editable {
			el: JQuery;
			data: { id?: number };

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
			select(selected:boolean): Editable {
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
