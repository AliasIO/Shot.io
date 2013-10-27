module Shot {
	export module Models {
		/**
		 * Album model
		 */
		export class Album {
			el;

			private id: number;
			private template;

			constructor(public title: string, id?: number) {
				this.id = id;

				this.template = $('#template-album').html();
			}

			/**
			 * Render
			 */
			render(): Album {
				this.el = $(Mustache.render(this.template, this));

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
						title: this.title
					})
					.done((data) => {
						this.id       = data.id;

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
