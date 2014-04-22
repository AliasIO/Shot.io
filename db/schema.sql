DROP TABLE IF EXISTS images;

CREATE TABLE images (
	id          INTEGER PRIMARY KEY AUTOINCREMENT,
	filename    TEXT    NOT NULL,
	title       TEXT        NULL,
	width       INTEGER NOT NULL,
	height      INTEGER NOT NULL,
	thumb_crop  TEXT    NOT NULL,
	properties  TEXT        NULL,
	description TEXT        NULL,
	location    TEXT        NULL,
	taken_at    INTEGER     NULL,
	created_at  INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
	updated_at  INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE UNIQUE INDEX filename ON images ( filename );

CREATE TRIGGER images_update AFTER UPDATE ON images
FOR EACH ROW
BEGIN
	UPDATE images SET 
		updated_at = (strftime('%s', 'now')) 
	WHERE 
		id = OLD.id;
END;

DROP TABLE IF EXISTS albums;

CREATE TABLE albums (
	id             INTEGER PRIMARY KEY AUTOINCREMENT,
	title          TEXT    NOT NULL,
	cover_image_id INTEGER     NULL,
	sort_order     INTEGER NOT NULL DEFAULT 0,
	system         TEXT        NULL,
	created_at     INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
	updated_at     INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY(cover_image_id) REFERENCES images(id) ON DELETE SET NULL
);

CREATE TRIGGER albums_insert AFTER INSERT ON albums
FOR EACH ROW
BEGIN
	UPDATE albums SET 
		sort_order = (
			SELECT MAX(sort_order) + 1
			FROM albums
		)
	WHERE 
		id = NEW.id;
END;

CREATE TRIGGER albums_update AFTER UPDATE ON albums
FOR EACH ROW
BEGIN
	UPDATE albums SET 
		updated_at = (strftime('%s', 'now')) 
	WHERE 
		id = OLD.id;
END;

INSERT INTO albums (
	title,
	system
) VALUES (
	'All images',
	'all'
), (
	'Unsorted',
	'orphans'
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

CREATE TRIGGER albums_images_insert AFTER INSERT ON albums_images
FOR EACH ROW
BEGIN
	UPDATE albums_images SET 
		sort_order = (
			SELECT MAX(sort_order) + 1
			FROM albums_images
			WHERE
				album_id = NEW.album_id
		)
	WHERE 
		album_id = NEW.album_id AND
		image_id = NEW.image_id;
END;

DROP TABLE IF EXISTS options;

CREATE TABLE options (
	key        TEXT    NOT NULL,
	value      TEXT    NOT NULL,
	created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
	updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE UNIQUE INDEX key ON options ( key );

CREATE TRIGGER options_update AFTER UPDATE ON options
FOR EACH ROW
BEGIN
	UPDATE options SET 
		updated_at = (strftime('%s', 'now')) 
	WHERE 
		key = OLD.key;
END;

INSERT INTO options (
	key,
	value
) VALUES (
	'sitename',
	'Shot.io'
);
