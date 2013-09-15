DROP TABLE IF EXISTS photos;

CREATE TABLE photos (
	id       INTEGER PRIMARY KEY,
	filename TEXT NOT NULL
);

DROP TABLE IF EXISTS albums;

CREATE TABLE albums (
	id      INTEGER PRIMARY KEY,
	name    TEXT NOT NULL,
	`order` INTEGER
);

DROP TABLE IF EXISTS albums_photos;

CREATE TABLE albums_photos (
	album_id INTEGER NOT NULL,
	photo_id INTEGER NOT NULL,
	`order`  INTEGER,
	FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE,
	FOREIGN KEY(photo_id) REFERENCES photos(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX album_photo ON albums_photos ( album_id, photo_id );

DROP TABLE IF EXISTS options;

CREATE TABLE options (
	key   TEXT NOT NULL,
	value TEXT NOT NULL
);

INSERT INTO options (
	key,
	value
) VALUES (
	'sitename',
	'Shot'
);
