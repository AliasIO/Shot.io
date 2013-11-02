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
		$this->view->name = 'admin/index';

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

	/**
	 * Album action
	 */
	public function album()
	{
		$this->view->name = 'admin/album';

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

		$images = array();

		foreach ( $results as $result ) {
			try {
				$image = $this->app->getModel('image')->load($result->id);

				$images[] = (object) array(
					'id'       => $image->getId(),
					'filename' => $image->getFilename(),
					'title'    => $image->getTitle(),
					'path'     => $image->getFilePath('thumb')
					);
			} catch ( \Swiftlet\Exception $e ) {
			}
		}

		$this->view->images = $images;

		$this->view->breadcrumbs = array((object) array(
			'path'  => 'admin/album/' . $album->id,
			'title' => $album->title,
			'icon'  => 'folder'
			));
	}
}
