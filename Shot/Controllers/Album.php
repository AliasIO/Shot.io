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
	 * Default action
	 */
	public function index()
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

		$images = array();

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

				$images[] = (object) array(
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

		$this->view->images = $images;

		$this->view->album = (object) array(
			'title' => 'Album title',
			'id'    => (int) $albumId
			);

		$this->view->breadcrumbs = array((object) array(
			'path'  => 'album/grid/' . $albumId,
			'title' => 'Album title',
			'icon'  => 'th'
			));
	}

	/**
	 * Grid action
	 */
	public function grid()
	{
		$this->index();
	}

	/**
	 * Carousel action
	 */
	public function carousel()
	{
		$this->index();

		$this->view->name = 'album/carousel';
	}
}
