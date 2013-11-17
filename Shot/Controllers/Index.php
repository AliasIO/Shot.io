<?php

namespace Shot\Controllers;

/**
 * Index controller
 */
class Index extends \Swiftlet\Controller
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
		$dbh = $this->app->getLibrary('pdo')->getHandle();

		$sth = $dbh->prepare('
			SELECT
				albums.id
			FROM albums
			LEFT JOIN albums_images ON albums.id = albums_images.album_id
			GROUP BY albums.id
			-- HAVING
				-- COUNT(albums_images.image_id) > 0
			ORDER BY albums.id DESC
			');

		$sth->execute();

		$results = $sth->fetchAll(\PDO::FETCH_OBJ);

		$albums = array();

		foreach ( $results as $result ) {
			$album = $this->app->getModel('album')->load($result->id);

			$albums[] = (object) array(
				'id'    => (int) $album->getId(),
				'title' => $album->getTitle(),
				'path'  => $album->getFilePath()
				);
		}

		$this->view->albums = $albums;
	}
}
