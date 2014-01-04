module Shot {
	export module Models {
		/**
		 * Dock model
		 */
		export class Dock {
			id = new Date().getTime() + Math.round(Math.random() * 999);
			el: JQuery;
			template: string;

			private active = false;

			constructor(selector: string, public data?: any) {
				this.template = $(selector).html();

				this.data = data || {};
			}

			/**
			 * Render
			 */
			render(): Dock {
				this.el = $(Handlebars.compile(this.template)(this.data));

				return this;
			}

			/**
			 * Toggle
			 */
			toggle(active?: boolean): Dock {
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
}
