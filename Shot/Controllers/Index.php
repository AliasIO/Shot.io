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
			FROM photos
			');

		$sth->execute();

		$photos = $sth->fetchAll(\PDO::FETCH_OBJ);

		$this->view->photos = $photos;
	}
}
