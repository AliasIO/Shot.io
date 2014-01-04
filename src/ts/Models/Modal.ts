module Shot {
	export module Models {
		/**
		 * Modal model
		 */
		export class Modal {
			id = new Date().getTime() + Math.round(Math.random() * 999);
			el: JQuery;
			template: string;

			constructor(selector: string, public data?: any) {
				this.template = $(selector).html();

				this.data = data || {};
			}

			/**
			 * Render
			 */
			render(): Modal {
				this.el = $(Handlebars.compile(this.template)(this.data));

				// Keyboard shortcuts
				$(document).on('keydown.' + this.id, (e) => {
					switch ( e.keyCode ) {
						case 27: // Escape
							e.preventDefault();

							this.close();

							break;
					}
				});

				return this;
			}

			/**
			 * Close
			 */
			close(): void {
				this.el.remove();

				// Remove keyboard shortcut
				$(document).off('keydown.' + this.id);
			}
		}
	}
}
