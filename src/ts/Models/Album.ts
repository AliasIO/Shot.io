module Shot {
	export module Models {
		/**
		 * Album model
		 */
		export class Album extends Editable {
			private template: string;

			constructor(public data: { id?: number; link?: string }) {
				super();

				this.template = $('#template-album').html();
			}

			/**
			 * Render
			 */
			render(): Album {
				var el = $(Mustache.render(this.template, this.data));

				if ( this.el ) {
					this.el.replaceWith(el);
				}

				this.el = el;

				super.render();

				return this;
			}

			/**
			 * Save
			 */
			save = function(): JQueryDeferred<any> {
				var deferred = $.Deferred();

				if ( this.id ) {
					// TODO
				} else {
					$.post(SHOT.rootPath + 'ajax/saveAlbum', {
						title: this.data.title
					})
					.done((data) => {
						this.data.id = data.id;

						deferred.resolve(data);
					})
					.fail((e) => {
						deferred.reject(e);
					});
				}

				return deferred;
			}
		}
	}
}
