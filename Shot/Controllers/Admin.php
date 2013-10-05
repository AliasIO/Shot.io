<?php

namespace Shot\Controllers;

/**
 * Admin controller
 */
class Admin extends \Swiftlet\Controller
{
	/**
	 * Page title
	 * @var string
	 */
	protected $title = 'Admin';

	/**
	 * Default action
	 */
	public function index()
	{
		$dbh = $this->app->getLibrary('pdo')->getHandle();
	}

	/**
	 * Album action
	 */
	public function album()
	{
		$this->view->name = 'admin/album';

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

				$images[] = (object) array(
					'id'       => $image->getId(),
					'filename' => $image->getFilename(),
					'title'    => $image->getTitle(),
					'path'     => $image->getFilePath('thumb/smart')
					);
			} catch ( \Swiftlet\Exception $e ) {
			}
		}

		$this->view->images = $images;
	}
}
