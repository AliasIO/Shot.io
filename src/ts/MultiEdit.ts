module Shot {
	/**
	 * Multi edit
	 */
	export class MultiEdit<T extends Models.Editable> {
		private active = false;
		private editables: Array<T> = [];

		/**
		 * Add editable
		 */
		push(editable: T): MultiEdit<T> {
			this.editables.push(editable);

			$(editable).on('click', (e) => {
				if ( this.active ) {
					e.originalEvent.preventDefault();

					editable.select(!editable.isSelected());

					$(this).trigger('change');
				}
			});

			return this;
		}

		/**
		 * Select all
		 */
		selectAll(select: boolean): MultiEdit<T> {
			this.editables.forEach((editable) => {
				editable.select(select);
			});

			$(this).trigger('change');

			return this;
		}

		/**
		 * Get selected editables
		 */
		getSelection(): Array<T> {
			var selected: Array<T> = [];

			this.editables.forEach((editable) => {
				if ( editable.isSelected() ) {
					selected.push(editable);
				}
			});

			return selected;
		}

		/**
		 * Toggle
		 */
		toggle(active?: boolean): MultiEdit<T> {
			this.active = active === undefined ? !this.active : active;

			if ( this.active ) {
				$(this).trigger('activate');
			} else {
				$(this).trigger('deactivate');
			}

			$(this).trigger('change');

			return this;
		}
	}
}
