interface JQuery {
    foundation: any;
    swipe: any;
}

interface BaseJQueryEventObject {
    originalEvent: any;
    draggable: any;
}

interface SHOT {
    action: string;
    app: Shot.App;
    album: { id: number };
    albums: Array;
    controller: string;
    images: Array;
    rootPath: string;
    thumbnails: Array;
}

declare var SHOT: SHOT;
