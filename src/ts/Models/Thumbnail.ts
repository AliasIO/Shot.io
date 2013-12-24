module Shot {
	export module Models {
		/**
		 * Thumbnail model
		 */
		export class Thumbnail extends Editable {
			private template: string;

			constructor(public data: { id?: number; title?: string; path?: string; link?: string; file?: any; formData?: any; pending?: boolean; error?: boolean; draggable?: boolean }) {
				super();

				this.template = $('#template-thumbnail').html();
			}

			/**
			 * Render
			 */
			render(): Thumbnail {
				var el = $(Mustache.render(this.template, this.data));

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
			save(): JQueryDeferred<any> {
				var deferred = $.Deferred();

				this.data.pending = true;
				this.data.error = false;

				this.render();

				if ( this.data.id ) {
					// TODO
				} else {
					this.data.formData.append('title', this.data.title);

					$.ajax(SHOT.rootPath + 'ajax/saveImage', {
						type: 'POST',
						data: this.data.formData,
						processData: false,
						contentType: false,
						cache: false,
						xhr: () => {
							var xhr = $.ajaxSettings.xhr();

							// Track upload progress
							if ( xhr.upload ) {
								xhr.upload.addEventListener('progress', (e) => {
									if ( e.lengthComputable ) {
										deferred.notify(( e.loaded / e.total ) * 100);
									}
								}, false);
							}

							return xhr;
						}
					})
					.done((data) => {
						this.data.id = data.id;
						this.data.path = data.path;
						this.data.pending = false;
						this.data.error = false;

						deferred.resolve(data);
					})
					.fail((e) => {
						this.data.pending = false;
						this.data.error = true;

						deferred.reject(e);
					});
				}

				return deferred;
			}
		}
	}
}
