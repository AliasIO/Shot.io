<?php

namespace Shot\Models;

/**
 * Album model
 */
class Album extends \Swiftlet\Model
{
	const EXCEPTION_NOT_FOUND = 1;

	/**
	 * ID
	 * @var string
	 */
	protected $id = null;

	/**
	 * Title
	 * @var string
	 */
	public $title = '';

	/**
	 * Save album
	 */
	public function save()
	{
		$dbh = $this->app->getLibrary('pdo')->getHandle();

		if ( $this->id ) {
			$sth = $dbh->prepare('
				UPDATE albums SET
					title = :title
				WHERE
					id = :id
				LIMIT 1
				');

			$sth->bindParam('title', $this->title);
			$sth->bindParam('id',    $this->id, \PDO::PARAM_INT);

			$sth->execute();
		} else {
			$sth = $dbh->prepare('
				INSERT INTO albums (
					title
				) VALUES (
					:title
				)
				');

			$sth->bindParam('title', $this->title);

			$sth->execute();

			$this->id = $dbh->lastInsertId();
		}
	}

	/**
	 * Load an album
	 * @param integer $id
	 */
	public function load($id)
	{
		$dbh = $this->app->getLibrary('pdo')->getHandle();

		$sth = $dbh->prepare('
			SELECT
				*
			FROM albums
			WHERE
				id = :id
			LIMIT 1
			');

		$sth->bindParam('id', $id, \PDO::PARAM_INT);

		$sth->execute();

		$result = $sth->fetchObject();

		if ( !$result ) {
			throw new \Swiftlet\Exception('Album does not exist', self::EXCEPTION_NOT_FOUND);
		}

		$this->id    = $result->id;
		$this->title = $result->title;

		return $this;
	}

	/**
	 * Add image
	 * @param Image
	 */
	public function addImage(Image $image)
	{
		$imageId = $image->getId();

		$dbh = $this->app->getLibrary('pdo')->getHandle();

		$sth = $dbh->prepare('
			INSERT OR IGNORE INTO albums_images (
				album_id,
				image_id
			) VALUES (
				:album_id,
				:image_id
			)
			');

		$sth->bindParam('album_id', $this->id, \PDO::PARAM_INT);
		$sth->bindParam('image_id', $imageId,  \PDO::PARAM_INT);

		$sth->execute();
	}

	/**
	 * Get ID
	 */
	public function getId()
	{
		return $this->id;
	}
}

