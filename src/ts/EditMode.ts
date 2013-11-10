module Shot {
	/**
	 * Edit mode
	 */
	export class EditMode<T extends Models.Editable> {
		private el;
		private template;
		private active = false;
		private editables: Array<T> = [];
		private type: string;

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
					this.checkSelection();

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

			this.el = $(Mustache.render(this.template, {}));

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

			this.el.on('click', '.edit', (e) => {
				e.preventDefault();

				$(e.target).blur();

				this.edit();
			});

			this.el.on('click', '.delete', (e) => {
				e.preventDefault();

				$(e.target).blur();

				this.delete();
			});

			$('body').append(this.el);
		}

		/**
		 * Edit
		 */
		edit(): EditMode<T> {
			var
				modal: JQuery,
				selected: Array<T> = [];

			this.editables.forEach((editable) => {
				if ( editable.isSelected() ) {
					selected.push(editable);
				}
			});

			if ( !selected ) {
				return this;
			}

			modal = $(Mustache.render($('#template-edit-mode-edit').html(), {
				count: selected.length,
				image: this.type === 'image',
				album: this.type === 'album'
			}));

			modal.on('submit', 'form', (e) => {
				var
					title = modal.find(':input[name="title"]').val(),
					thumbCrop = modal.find(':input[name="thumb-crop"]:checked').val(),
					data: { ids: Array<number>; title: string; thumbCrop?: string } = {
						ids: [],
						title: title
					};

				e.preventDefault();

				selected.forEach((editable) => {
					data.ids.push(editable.data.id);

					editable.data.pending = true;
					editable.data.error   = false;

					if ( title ) {
						editable.data.title = title;
					}

					editable.render();
				});

				if ( this.type === 'image' ) {
					data.thumbCrop = thumbCrop;
				}

				$.post(SHOT.rootPath + 'ajax/save' + ( this.type === 'image' ? 'Images' : 'Albums' ), data)
					.done(() => {
						selected.forEach((editable) => {
							if ( this.type === 'image' ) {
								editable.data.path = editable.data.path.replace(/\?[a-z]+$/, '?' + thumbCrop)
							}

							editable.data.pending = false;

							editable.render();
						});
					})
					.fail(() => {
						selected.forEach((editable) => {
							editable.data.pending = false;
							editable.data.error   = true;

							editable.render();
						});
					});

				modal.remove();

				this.el.show();
			});

			modal.on('click', '.cancel', (e) => {
				e.preventDefault();

				modal.remove();

				this.el.show();
			});

			console.log($(document).scrollTop());

			modal
				.appendTo('body')
				.show()
				.find('.modal-content')
				.css({ marginTop: $(document).scrollTop() + 'px' });

			this.el.hide();

			return this;
		}

		/**
		 * Delete
		 */
		delete(): EditMode<T> {
			var
				modal: JQuery,
				selected: Array<T> = [];

			this.editables.forEach((editable) => {
				if ( editable.isSelected() ) {
					selected.push(editable);
				}
			});

			if ( !selected ) {
				return this;
			}

			modal = $(Mustache.render($('#template-edit-mode-delete').html(), {
				count: selected.length,
				image: this.type === 'image',
				album: this.type === 'album'
			}));

			modal.on('submit', 'form', (e) => {
				var ids: Array<number> = [];

				e.preventDefault();

				selected.forEach((editable) => {
					ids.push(editable.data.id);

					// Remove editable from array
					this.editables.splice(this.editables.indexOf(editable), 1);

					$(editable).trigger('delete');
				});

				$.post(SHOT.rootPath + 'ajax/delete' + ( this.type === 'image' ? 'Images' : 'Albums' ), {
					ids: ids
				});

				modal.remove();

				this.el.show();
			});

			modal.on('click', '.cancel', (e) => {
				e.preventDefault();

				modal.remove();

				this.el.show();
			});

			modal
				.appendTo('body')
				.show()
				.find('.modal-content')
				.css({ marginTop: $(document).scrollTop() + 'px' });

			this.el.hide();

			return this;
		}

		/**
		 * Add editable
		 */
		push(editable: T): EditMode<T> {
			this.editables.push(editable);

			if ( editable instanceof Models.Thumbnail ) {
				this.type = 'image';
			}

			if ( editable instanceof Models.Album ) {
				this.type = 'album';
			}

			$(editable).on('click', (e) => {
				if ( this.active ) {
					e.originalEvent.preventDefault();

					editable.select(!editable.isSelected());

					this.checkSelection();
				}
			});

			return this;
		}

		/**
		 * Select all
		 */
		selectAll(select: boolean): EditMode<T> {
			this.editables.forEach((editable) => {
				editable.select(select);
			});

			this.checkSelection();

			return this;
		}

		/**
		 * Check selection
		 */
		checkSelection(): EditMode<T> {
			var selectedCount = 0;

			this.editables.forEach((editable) => {
				if ( editable.isSelected() ) {
					selectedCount ++;
				}
			});

			this.el.find('.select-none, .edit, .albums, .delete').attr('disabled', !selectedCount);

			this.el.find('.select-all').attr('disabled', selectedCount === this.editables.length);

			return this;
		}
	}
}
