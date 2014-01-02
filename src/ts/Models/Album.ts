module Shot {
	export module Models {
		/**
		 * Album model
		 */
		export class Album extends Editable {
			private template: string;

			constructor(public data: { id?: number; title?: string; link?: string; pending?: boolean; error?: boolean; draggable?: boolean }) {
				super();

				if ( !this.data.id ) {
					this.data.pending = true;
				}

				this.template = $('#template-album').html();
			}

			/**
			 * Render
			 */
			render(): Album {
				var el = $(Mustache.render(this.template, this.data, {}));

				if ( this.el ) {
					this.el.replaceWith(el);
				}

				this.el = el;

				super.render();

				this.select(this.isSelected());

				return this;
			}

			/**
			 * Save
			 */
			save = function(): JQueryDeferred<any> {
				var deferred = $.Deferred();

				this.data.pending = true;
				this.data.error = false;

				this.render();

				$.post(SHOT.rootPath + 'ajax/saveAlbum', {
					id: this.data.id,
					title: this.data.title
				})
				.done((data) => {
					this.data.id = data.id;
					this.data.pending = false;
					this.data.error = false;

					deferred.resolve(data);
				})
				.fail((e) => {
					this.data.pending = false;
					this.data.error = true;

					deferred.reject(e);
				});

				return deferred;
			}
		}
	}
}
