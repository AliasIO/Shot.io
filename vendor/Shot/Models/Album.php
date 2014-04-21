<?php

namespace Shot\Models;

/**
 * Album model
 */
class Album extends \Shot\Abstracts\Model
{
	const EXCEPTION_NOT_FOUND = 1;

	/**
	 * ID
	 * @var string
	 */
	protected $id;

	/**
	 * System name
	 * @var string
	 */
	protected $system;

	/**
	 * Title
	 * @var string
	 */
	public $title;

	/**
	 * Sort order
	 * @var integer
	 */
	public $sortOrder = 0;

	/**
	 * Number of images in album
	 * @var integer
	 */
	public $imageCount = 0;

	/**
	 * Save album
	 * @return Album
	 * @throws \Swiftlet\Exception
	 */
	public function save()
	{
		if ( $this->id ) {
			$sth = $this->dbh->prepare('
				UPDATE albums SET
					title = :title,
					cover_image_id = :cover_image_id,
					sort_order = :sort_order
				WHERE
					id = :id
				LIMIT 1
				');

			$sth->bindParam('title',          $this->title);
			$sth->bindParam('cover_image_id', $this->coverImageId, \PDO::PARAM_INT);
			$sth->bindParam('sort_order',     $this->sortOrder,    \PDO::PARAM_INT);
			$sth->bindParam('id',             $this->id,           \PDO::PARAM_INT);

			$sth->execute();
		} else {
			$sth = $this->dbh->prepare('
				INSERT INTO albums (
					title,
					sort_order
				) VALUES (
					:title,
					:sort_order
				)
				');

			$sth->bindParam('title',      $this->title);
			$sth->bindParam('sort_order', $this->sortOrder, \PDO::PARAM_INT);

			$sth->execute();

			$this->id = $this->dbh->lastInsertId();
		}

		return $this;
	}

	/**
	 * Delete album
	 * @throws \Swiftlet\Exception
	 */
	public function delete()
	{
		if ( !$this->id || $this->system ) {
			return;
		}

		$sth = $this->dbh->prepare('
			DELETE
			FROM albums WHERE
				id = :id
			LIMIT 1
			');

		$sth->bindParam('id', $this->id, \PDO::PARAM_INT);

		$sth->execute();

		$this->id = null;
	}

	/**
	 * Load an album
	 * @param integer $id
	 */
	public function load($id)
	{
		$this->loadBy('id', (int) $id);

		return $this;
	}

	/**
	 * Load a system album
	 * @param string $name
	 */
	public function loadSystem($name)
	{
		$this->loadBy('system', $name);

		return $this;
	}

	/**
	 * Load an album by attribute
	 * @param mixed $value
	 */
	private function loadBy($attribute, $value)
	{
		$sth = $this->dbh->prepare('
			SELECT
				albums.id,
				albums.title,
				albums.sort_order,
				albums.system,
				images.id AS cover_image_id -- Ensure the cover image is still in the album
			FROM albums
			LEFT JOIN albums_images ON albums_images.album_id =        albums.id       AND albums.cover_image_id = albums_images.image_id
			LEFT JOIN images        ON        images.id       = albums_images.image_id
			WHERE
				albums.' . $attribute . ' = :' . $attribute . '
			LIMIT 1
			');

		$sth->bindParam($attribute, $value);

		$sth->execute();

		$result = $sth->fetchObject();

		if ( !$result ) {
			throw new \Swiftlet\Exception('Album does not exist', self::EXCEPTION_NOT_FOUND);
		}

		$this->id           = $result->id;
		$this->system       = $result->system;
		$this->title        = $result->title;
		$this->coverImageId = $result->cover_image_id;
		$this->sortOrder    = $result->sort_order;

		$sth = $this->dbh->prepare('
			SELECT
				COUNT(image_id) AS image_count
			FROM albums_images
			WHERE
				album_id = :album_id
			LIMIT 1
			');

		$sth->bindParam('album_id', $this->id, \PDO::PARAM_INT);

		$sth->execute();

		$result = $sth->fetchObject();

		if ( $result ) {
			$this->imageCount = $result->image_count;
		}

		// If no cover image is set get the first image in the album
		if ( !$this->coverImageId ) {
			$sth = $this->dbh->prepare('
				SELECT
					images.id
				FROM       albums_images
				INNER JOIN images ON albums_images.image_id = images.id
				WHERE
					albums_images.album_id = :id
				ORDER BY albums_images.sort_order ASC, images.id ASC
				LIMIT 1
				');

			$sth->bindParam('id', $this->id, \PDO::PARAM_INT);

			$sth->execute();

			$result = $sth->fetchObject();

			if ( $result ) {
				$this->coverImageId = $result->id;
			}
		}

		return $this;
	}

	/**
	 * Add image
	 * @param Image
	 */
	public function addImage(Image $image)
	{
		$imageId = $image->getId();

		$sth = $this->dbh->prepare('
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

	/**
	 * Get system name
	 */
	public function getSystem()
	{
		return $this->system;
	}

	/**
	 * Get cover image ID
	 * @return int
	 */
	public function getCoverImageId()
	{
		return $this->coverImageId;
	}

	/**
	 * Set cover image
	 * @param \Shot\Models\Image $image
	 * @return Album
	 */
	public function setCoverImage(\Shot\Models\Image $image)
	{
		$this->coverImageId = $image->getId();

		return $this;
	}

	/**
	 * Get the number of images
	 */
	public function getImageCount()
	{
		return $this->imageCount;
	}
}

