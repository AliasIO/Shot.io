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

		$dbh = $this->app->getLibrary('pdo')->getHandle();

		$sth = $dbh->prepare('
			SELECT
				*
			FROM albums
			WHERE
				id = :id
			LIMIT 1
			');

		$sth->bindParam('id', $albumId, \PDO::PARAM_INT);

		$sth->execute();

		$album = $sth->fetchObject();

		if ( !$album ) {
			$this->app->getLibrary('helpers')->error404();

			return;
		}

		$sth = $dbh->prepare('
			SELECT
				*
			FROM photos
			ORDER BY id DESC
			');

		$sth->execute();

		$results = $sth->fetchAll(\PDO::FETCH_OBJ);

		$thumbnails = array();

		foreach ( $results as $result ) {
			try {
				$image = $this->app->getModel('image')->load($result->id);

				$paths = array(
					'original' => $image->getFilePath(),
					'preview'  => $image->getFilePath('preview'),
					'thumb'    => $image->getFilePath('thumb')
					);

				foreach ( $image::$imageSizes as $imageSize ) {
					$paths[$imageSize] = $image->getFilePath($imageSize);
				}

				$thumbnails[] = (object) array(
					'id'       => (int) $image->getId(),
					'filename' => $image->getFilename(),
					'title'    => $image->getTitle(),
					'width'    => (int) $image->getWidth(),
					'height'   => (int) $image->getHeight(),
					'paths'    => $paths
					);
			} catch ( \Swiftlet\Exception $e ) {
			}
		}

		$this->view->thumbnails = $thumbnails;

		$this->view->album = (object) array(
			'title' => $album->title,
			'id'    => (int) $album->id
			);

		$this->view->breadcrumbs = array((object) array(
			'path'  => 'album/grid/' . $album->id,
			'title' => $album->title,
			'icon'  => 'folder'
			));
	}

	/**
	 * Carousel action
	 */
	public function carousel()
	{
		$this->grid();

		$this->view->images = $this->view->thumbnails;

		$this->view->name = 'album/carousel';
	}
}
