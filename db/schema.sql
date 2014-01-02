DROP TABLE IF EXISTS images;

CREATE TABLE images (
	id         INTEGER PRIMARY KEY AUTOINCREMENT,
	filename   TEXT    NOT NULL,
	title      TEXT        NULL,
	width      INTEGER NOT NULL,
	height     INTEGER NOT NULL,
	thumb_crop TEXT    NOT NULL,
	properties TEXT        NULL
);

CREATE UNIQUE INDEX filename ON images ( filename );

DROP TABLE IF EXISTS albums;

CREATE TABLE albums (
	id             INTEGER PRIMARY KEY AUTOINCREMENT,
	title          TEXT    NOT NULL,
	cover_image_id INTEGER     NULL,
	sort_order     INTEGER NOT NULL DEFAULT 0,
	FOREIGN KEY(cover_image_id) REFERENCES images(id) ON DELETE SET NULL
);

DROP TABLE IF EXISTS albums_images;

CREATE TABLE albums_images (
	album_id   INTEGER NOT NULL,
	image_id   INTEGER NOT NULL,
	sort_order INTEGER NOT NULL DEFAULT 0,
	FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE,
	FOREIGN KEY(image_id) REFERENCES images(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX album_image ON albums_images ( album_id, image_id );

DROP TABLE IF EXISTS options;

CREATE TABLE options (
	key   TEXT NOT NULL,
	value TEXT NOT NULL
);

CREATE UNIQUE INDEX key ON options ( key );

INSERT INTO options (
	key,
	value
) VALUES (
	'sitename',
	'Shot.io'
);
