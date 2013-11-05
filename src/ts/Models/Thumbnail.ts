module Shot {
	export module Models {
		/**
		 * Thumbnail model
		 */
		export class Thumbnail extends Editable {
			private template;

			constructor(public data) {
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

				return this;
			}

			/**
			 * Save
			 */
			save() {
				var deferred = $.Deferred();

				if ( this.data.id ) {
					// TODO
				} else {
					this.data.formData.append('title', this.data.title);

					$.ajax({
						url: SHOT.rootPath + 'ajax/saveImage',
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
					}, 'json')
					.done((data) => {
						this.data.id = data.id;
						this.data.path = data.path;

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
