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
			$album = $this->app->getModel('album')->load($result->id);

			$albums[] = (object) array(
				'id'    => (int) $album->getId(),
				'title' => $album->getTitle(),
				'path'  => $album->getFilePath()
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
				id
			FROM albums
			WHERE
				id = :id
			LIMIT 1
			');

		$sth->bindParam('id', $albumId, \PDO::PARAM_INT);

		$sth->execute();

		$result = $sth->fetchObject();

		if ( $result ) {
			$album = $this->app->getModel('album')->load($result->id);
		} else {
			$this->app->getLibrary('helpers')->error404();

			return;
		}

		$sth = $dbh->prepare('
			SELECT
				images.*
			FROM       albums_images
			INNER JOIN images ON albums_images.image_id = images.id
			WHERE
				albums_images.album_id = :album_id
			ORDER BY images.id DESC
			');

		$sth->bindParam('album_id', $albumId);

		$sth->execute();

		$results = $sth->fetchAll(\PDO::FETCH_OBJ);

		$thumbnails = array();

		foreach ( $results as $result ) {
			$thumbnail = $this->app->getModel('image')->load($result->id);

			$thumbnails[] = (object) array(
				'id'       => (int) $thumbnail->getId(),
				'filename' => $thumbnail->getFilename(),
				'title'    => $thumbnail->getTitle(),
				'path'     => $thumbnail->getFilePath('thumb')
				);
		}

		$this->view->thumbnails = $thumbnails;

		$this->view->album = (object) array(
			'title' => $album->getTitle(),
			'id'    => (int) $album->getId(),
			'path'  => $album->getFilePath()
			);

		$this->view->breadcrumbs = array((object) array(
			'path'  => 'admin/album/' . $album->getId(),
			'title' => $album->getTitle(),
			'icon'  => 'folder'
			));
	}
}
