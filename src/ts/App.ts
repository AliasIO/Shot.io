/// <reference path="Controllers/Admin.ts"/>
/// <reference path="Controllers/Album"/>
/// <reference path="Models/Image"/>
/// <reference path="Models/Preview"/>
/// <reference path="Models/ProgressBar"/>

$(function() {
	SHOT.app = new Shot.App();
});

declare var SHOT, $, FastClick;

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
