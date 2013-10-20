module Shot {
	export module Models {
		/**
		 * Progress bar model
		 */
		export class ProgressBar {
			el;

			constructor(public thumbnail) {
				var wrap = $('<div class="progressbar-wrap"/>');

				this.el = $('<div class="progressbar"/>');

				wrap.append(this.el);

				thumbnail.find('.container').append(wrap);
			}

			/**
			 * Update progress bar value
			 */
			set(percentage: number, callback: () => void): ProgressBar {
				this.el.stop(true, true).animate({ width: percentage + '%' }, 200, () => {
					if ( percentage === 100 ) {
						this.el.fadeOut('fast');
					}

					if ( typeof callback === 'function' ) {
						callback();
					}
				});

				return this;
			}
		}
	}
}
