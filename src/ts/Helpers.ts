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
