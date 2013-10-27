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
				*
			FROM albums
			ORDER BY id DESC
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

		$this->view->albums = $albums;
	}
}
