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
					'preview'  => $image->getFilePath('thumb/preview'),
					'thumb'    => $image->getFilePath('thumb/smart')
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
			'title' => 'Album title',
			'id'    => (int) $albumId
			);

		$this->view->breadcrumbs = array((object) array(
			'path'  => 'album/grid/' . $albumId,
			'title' => 'Album title',
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
