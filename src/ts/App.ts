$(function() {
	SHOT.app = new Shot.App();
});

declare var SHOT, $, Mustache, FastClick;

module Shot {
	/**
	 * Application
	 */
	export class App {
		constructor() {
			$(document).foundation();

			FastClick.attach(document);

			// Prevent dragging of ghost image in Firefox
			$(document).on('dragstart', 'img, a', (e) => {
				e.preventDefault();
			});

			new Controllers[SHOT.controller]()[SHOT.action]();

			return this;
		}
	}
}
