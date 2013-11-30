module Shot {
	/**
	 * Drag and drop
	 */
	export class DragDrop<T extends Models.Editable> {
		private editables: Array<T> = [];

		private positions: Array<any> = [];

		constructor() {
			var
				offset: { x: number; y: number } = { x: 0, y: 0 },
				draggable: T = null,
				lastHover: T = null,
				placeholder = $('<li class="drop-target"><div class="container"></li>');

			$(document).swipe()
				.on('swipeStart', (e) => {
					e.originalEvent.originalEvent.preventDefault();

					this.editables.forEach((editable) => {
						if ( editable.el.has(e.originalEvent.target).length > 0 ) {
							draggable = editable;

							draggable.el.addClass('draggable');

							offset.x = draggable.el.position().left;
							offset.y = draggable.el.position().top;

							draggable.el.before(placeholder);

							draggable.el
								.appendTo(draggable.el.parent())
								.css({
									left: offset.x + e.swipe.x,
									top: offset.y + e.swipe.y,
									position: 'absolute',
									zIndex: 999
								});

							this.getPositions(draggable);
						}
					});
				})
				.on('swipeMove', (e) => {
					setTimeout(() => {
						var mouse: { x: number; y: number } = { x: null, y: null };

						if ( e.originalEvent.originalEvent.changedTouches !== undefined ) {
							mouse.x = e.originalEvent.originalEvent.changedTouches[0].clientX,
							mouse.y = e.originalEvent.originalEvent.changedTouches[0].clientY + $(window).scrollTop()
						} else {
							mouse.x = e.originalEvent.clientX,
							mouse.y = e.originalEvent.clientY + $(window).scrollTop()
						}

						draggable.el.css({
							left: offset.x - e.swipe.x,
							top: offset.y + e.swipe.y
						});

						this.positions.forEach((obj) => {
							if ( mouse.x > obj.x && mouse.x < obj.x + obj.width && mouse.y > obj.y && mouse.y < obj.y + obj.height ) {
								if ( obj.editable === lastHover ) {
									return;
								}

								if ( placeholder.index() > obj.editable.el.index() ) {
									obj.editable.el.before(placeholder);
								} else {
									obj.editable.el.after(placeholder);
								}

								this.getPositions(draggable);

								lastHover = obj.editable;

								return;
							}

							lastHover = null;
						});
					}, 0);
				})
				.on('swipeEnd', (e) => {
					draggable.el.animate({
						left: placeholder.position().left,
						top: placeholder.position().top
					}, 'fast', 'easeOutBack', () => {
						draggable.el
							.removeClass('draggable')
							.css({ position: 'inherit', zIndex: 'inherit' });

						placeholder.replaceWith(draggable.el);
					});
				});
		}

		/**
		 * Add editable
		 */
		push(editable: T): DragDrop<T> {
			this.editables.push(editable);

			return this;
		}

		private getPositions(draggable) {
			this.positions = [];

			this.editables.forEach((editable) => {
				if ( editable === draggable ) {
					return;
				}

				this.positions.push({
					editable: editable,
					x: editable.el.offset().left,
					y: editable.el.offset().top,
					width: editable.el.width(),
					height: editable.el.height()
				});
			});
		}
	}
}
