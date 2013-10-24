module Shot {
	export module Models {
		/**
		 * Album model
		 */
		export class Album {
			title: string;
			thumbnail;

			constructor(public thumbnailGrid) {
				this.thumbnail = $(
					'<li>' +
						'<div class="container">' +
							'<div class="title-wrap">' +
								'<div class="title"/>' +
							'</div>' +
						'</div>' +
					'</li>'
				);

				thumbnailGrid.prepend(this.thumbnail);
			}

			/**
			 * Set title
			 */
			setTitle = function(title: string): Album {
				this.title = title;

				this.thumbnail.find('.title').html('<i class="fa fa-folder"/>&nbsp;' + title);

				return this;
			}

			/**
			 * Save
			 */
			save = function(): Album {
				return this;
			}
		}
	}
}
