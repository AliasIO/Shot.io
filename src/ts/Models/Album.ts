module Shot {
	export module Models {
		/**
		 * Album model
		 */
		export class Album {
			el;

			private template;

			constructor(public data) {
				this.template = $('#template-album').html();
			}

			/**
			 * Render
			 */
			render(): Album {
				var el = $(Mustache.render(this.template, this.data));

				this.el ? this.el.replaceWith(el) : this.el = el;

				return this;
			}

			/**
			 * Save
			 */
			save = function() {
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
