module Shot {
	export module Models {
		/**
		 * Thumbnail model
		 */
		export class Thumbnail {
			el;
			file;
			formData;

			private id: number;
			private filename: string;
			private template;

			constructor(public title, id?: number) {
				this.id = id;

				this.template = $('#template-thumbnail').html();
			}

			/**
			 * Render
			 */
			render(): Thumbnail {
				this.el = $(Mustache.render(this.template, this));

				return this;
			}

			/**
			 * Save
			 */
			save() {
				var deferred = $.Deferred();

				if ( this.id ) {
					// TODO
				} else {
					$.ajax({
						url: SHOT.rootPath + 'ajax/saveImage',
						type: 'POST',
						data: this.formData,
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
						this.id       = data.id;
						this.filename = data.filename;

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
