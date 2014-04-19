module Shot {
	export module Models {
		/**
		 * Notice model
		 */
		export class Notice {
			el: JQuery;
			template: string;

			constructor(public text: string, public type?: string, public callback?: any) {
				this.template = $('#template-notice').html();

				this.type = type || 'notice';

				this.callback = typeof callback === 'function' ? callback : null;
			}

			/**
			 * Render
			 */
			render(): Notice {
				this.el = $(Handlebars.compile(this.template)({ text: this.text, type: this.type }));

				return this;
			}

			/**
			 * Close
			 */
			close(): void {
				this.el.remove();

				this.callback();
			}
		}
	}
}
