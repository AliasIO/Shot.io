module Shot {
	/**
	 * Helpers
	 */
	export class Helpers {
		/**
		 * Add modal to DOM
		 */
		showModal(modal: Models.Modal) {
			modal.el
				.on('click', (e) => {
					if ( !$(e.target).closest('.modal-content').length ) {
						modal.close();
					}
				})
				.on('click', '.cancel', (e) => {
					modal.el.remove();
				})
				.appendTo('body')
				.show()
				.find('.modal-content')
				.css({ marginTop: $(document).scrollTop() + 'px' });
		}

		initDock(dock: Models.Dock) {
			$(dock)
				.on('activate', (e) => {
					dock.el
						.stop()
						.css({ bottom: -20, opacity: 0 })
						.show()
						.animate({ bottom: 0, opacity: 1 });

					// Keyboard shortcuts
					$(document).on('keydown.' + dock.id, (e) => {
						switch ( e.keyCode ) {
							case 27: // Escape
								e.preventDefault();

								dock.toggle(false);

								break;
						}
					});
				})
				.on('deactivate', (e) => {
					dock.el
						.stop()
						.animate({ bottom: -20, opacity: 0 }, 'fast');

					// Remove keyboard shortcut
					$(document).off('keydown.' + dock.id);
				});
		}

		/**
		 * Remove item from array
		 */
		arrayPull = function(arr, item) {
			var i = 0;

			for ( ; i < arr.length; i ++ ) {
				while ( arr[i] === item ) {
					arr.splice(i, 1)[0];
				}
			}
		}
	}
}
