interface JQuery {
	foundation: any;
	swipe: any;
}

interface BaseJQueryEventObject {
	shotOriginalEvent: any;
	draggable: any;
}

interface SHOT {
	action: string;
	app: Shot.App;
	album: { id: number };
	albums: Array<any>;
	controller: string;
	images: Array<any>;
	rootPath: string;
	thumbnails: Array<any>;
	siteName: string;
}

declare var SHOT: SHOT;

declare var Foundation;
declare var FastClick;
