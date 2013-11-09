/// <reference path="definitions/jquery.d.ts"/>
/// <reference path="definitions/mustache.d.ts"/>
/// <reference path="definitions/shot.d.ts"/>
/// <reference path="Models/Editable.ts"/>

$(function() {
	SHOT.app = new Shot.App();
});

module Shot {
	/**
	 * Application
	 */
	export class App {
		constructor() {
			$(document).foundation();

			//FastClick.attach(document);

			// Prevent dragging of ghost image in Firefox
			$(document).on('dragstart', 'img, a', (e) => {
				e.preventDefault();
			});

			new Controllers[SHOT.controller]()[SHOT.action]();

			return this;
		}
	}
}
