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
		$albumId = $this->app->getArgs(1);

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

				$paths = array();

				foreach ( $image::$imageSizes as $imageSize ) {
					$paths[$imageSize] = $image->getFilePath($imageSize);
				}

				$images[] = (object) array(
					'filename' => $image->getFilename(),
					'title'    => $image->getTitle(),
					'width'    => $image->getWidth(),
					'height'   => $image->getHeight(),
					'paths'    => $paths
					);
			} catch ( \Swiftlet\Exception $e ) {
			}
		}

		$this->view->images = $images;
	}
}
