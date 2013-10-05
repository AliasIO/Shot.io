/// <reference path="AjaxUpload.ts"/>
/// <reference path="Album.ts"/>

$(function() {
	SHOT.app = new Shot.App();
});

declare var SHOT, $;

module Shot {
	/**
	 * Application
	 */
	export class App {
		constructor() {
			$(document).foundation();

			// Prevent dragging of ghost image in Firefox
			$(document).on('dragstart', 'img, a', (e) => {
				e.preventDefault();
			});

			switch (SHOT.controller) {
				case 'Admin':
					new AjaxUpload.Form($('#files'), $('.thumbnail-grid'));

					break;
				case 'Album':
					if ( SHOT.action === 'carousel' ) {
						new Album.Carousel($('.carousel'), SHOT.images);
					}

					break;
			}

			return this;
		}
	}
}
