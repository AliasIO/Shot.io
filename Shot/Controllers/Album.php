<?php

namespace Shot\Controllers;

/**
 * Album controller
 */
class Album extends \Swiftlet\Controller
{
	/**
	 * Page title
	 * @var string
	 */
	protected $title = 'Album';

	/**
	 * Grid action
	 */
	public function grid()
	{
		$this->view->name = 'album/grid';

		$albumId = $this->app->getArgs(0);

		try {
			$album = $this->app->getModel('album')->load($albumId);
		} catch ( \Swiftlet\Exception $e ) {
			if ( $e->getCode() == \Shot\Models\Album::EXCEPTION_NOT_FOUND ) {
				$this->app->getLibrary('helpers')->error404();

				return;
			} else {
				throw $e;
			}
		}

		$dbh = $this->app->getLibrary('pdo')->getHandle();

		// All albums
		$sth = $dbh->prepare('
			SELECT
				id,
				title
			FROM albums
			ORDER BY sort_order ASC, id ASC
			');

		$sth->execute();

		$results = $sth->fetchAll(\PDO::FETCH_OBJ);

		$albums = array();

		foreach ( $results as $result ) {
			$albums[] = (object) array(
				'id'    => (int) $result->id,
				'title' => $result->title
			);
		}

		// All images in album
		$sth = $dbh->prepare('
			SELECT
				images.id
			FROM       albums_images
			INNER JOIN images ON albums_images.image_id = images.id
			WHERE
				albums_images.album_id = :album_id
			ORDER BY albums_images.sort_order ASC, images.id ASC
			');

		$sth->bindParam('album_id', $albumId);

		$sth->execute();

		$results = $sth->fetchAll(\PDO::FETCH_OBJ);

		$thumbnails = array();

		foreach ( $results as $result ) {
			$image = $this->app->getModel('image')->load($result->id);

			$paths = array(
				'original' => $image->getFilePath(),
				'preview'  => $image->getFilePath('preview'),
				'thumb'    => $image->getFilePath('thumb')
				);

			foreach ( $image::$imageSizes as $imageSize ) {
				$paths[$imageSize] = $image->getFilePath($imageSize);
			}

			$exif = $this->app->getLibrary('exif')->format($image->getProperties());

			$thumbnails[] = (object) array(
				'id'       => (int) $image->getId(),
				'filename' => $image->getFilename(),
				'title'    => $image->getTitle(),
				'width'    => (int) $image->getWidth(),
				'height'   => (int) $image->getHeight(),
				'path'     => $image->getFilePath('thumb'),
				'paths'    => $paths,
				'exif'     => $exif
				);
		}

		$this->view->pageTitle = $album->getTitle();

		$this->view->albums = $albums;

		$this->view->thumbnails = $thumbnails;

		$this->view->album = (object) array(
			'title' => $album->getTitle(),
			'id'    => (int) $album->getId()
			);
	}

	/**
	 * Carousel action
	 */
	public function carousel()
	{
		$this->grid();

		$this->view->images = $this->view->get('thumbnails', false);

		$this->view->name = 'album/carousel';
	}
}
