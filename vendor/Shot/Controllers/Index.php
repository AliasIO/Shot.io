<?php

namespace Shot\Controllers;

/**
 * Index controller
 */
class Index extends \Swiftlet\Abstracts\Controller
{
	/**
	 * Page title
	 * @var string
	 */
	protected $title = 'Home';

	/**
	 * Default action
	 */
	public function index()
	{
		$this->view->controller = 'Index';
		$this->view->action     = 'index';

		$dbh = $this->app->getLibrary('pdo')->getHandle();

		$sth = $dbh->prepare('
			SELECT
				albums.id
			FROM albums
			LEFT JOIN albums_images ON albums.id = albums_images.album_id
			GROUP BY albums.id
			-- HAVING
				-- COUNT(albums_images.image_id) > 0
			ORDER BY albums.sort_order ASC, albums.id DESC
			');

		$sth->execute();

		$results = $sth->fetchAll(\PDO::FETCH_OBJ);

		$albums = array();

		foreach ( $results as $result ) {
			$album = $this->app->getModel('album')->setDatabaseHandle($dbh)->load($result->id);

			$path = null;

			$coverImageId = $album->getCoverImageId();

			if ( $coverImageId ) {
				$coverImage = $this->app->getModel('image')->setDatabaseHandle($dbh)->load($coverImageId);

				if ( $coverImage ) {
					$path = $coverImage->getFilePath('thumb');
				}
			}

			$albums[] = (object) array(
				'id'          => (int) $album->getId(),
				'system'      => $album->getSystem(),
				'title'       => $album->getTitle(),
				'path'        => $path,
				'image_count' => $album->getImageCount()
				);
		}

		$this->view->albums = $albums;
	}
}
