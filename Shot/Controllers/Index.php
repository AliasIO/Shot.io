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
				id
			FROM albums
			ORDER BY id DESC
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
