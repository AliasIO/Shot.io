module Shot {
	/**
	 * Edit mode
	 */
	export class EditMode<T extends Models.Editable> {
		private el;
		private template;
		private active = false;
		private editables: Array<T> = [];

		constructor() {
			var navItem;

			navItem = $(Mustache.render($('#template-nav-item').html(), {
				text: 'Edit mode',
				icon: 'wrench',
				right: true
			}));

			$('.top-bar .right').prepend(navItem);

			navItem.on('click', 'a', () => {
				this.active = !this.active;

				if ( this.active ) {
					this.el
						.css({ bottom: -20, opacity: 0 })
						.show()
						.animate({ bottom: 0, opacity: 1 }, 'fast');
				} else {
					this.el.animate({ bottom: -20, opacity: 0 }, 'fast');

					this.selectAll(false);
				}
			});

			this.template = $('#template-edit-mode').html();

			this.el = $(Mustache.render(this.template));

			this.el.on('click', '.close', (e) => {
				e.preventDefault();

				$(e.target).blur();

				navItem.find('a').trigger('click');
			});

			this.el.on('click', '.select-all', (e) => {
				e.preventDefault();

				$(e.target).blur();

				this.selectAll(true);
			});

			this.el.on('click', '.select-none', (e) => {
				e.preventDefault();

				$(e.target).blur();

				this.selectAll(false);
			});

			this.el.on('click', '.delete', (e) => {
				e.preventDefault();

				$(e.target).blur();
			});

			$('body').append(this.el);
		}

		/**
		 * Add editable
		 */
		push(editable: T): EditMode<T> {
			this.editables.push(editable);

			$(editable).on('click', (e) => {
				if ( this.active ) {
					e.originalEvent.preventDefault();

					editable.select(!editable.isSelected());
				}
			});

			return this;
		}

		selectAll(select: boolean): EditMode<T> {
			this.editables.forEach((editable) => {
				editable.select(select);
			});

			return this;
		}
	}
}
