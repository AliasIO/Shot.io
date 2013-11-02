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
			try {
				$thumbnail = $this->app->getModel('image')->load($result->id);

				$thumbnails[] = (object) array(
					'id'       => (int) $thumbnail->getId(),
					'filename' => $thumbnail->getFilename(),
					'title'    => $thumbnail->getTitle(),
					'path'     => $thumbnail->getFilePath('thumb')
					);
			} catch ( \Swiftlet\Exception $e ) {
			}
		}

		$this->view->thumbnails = $thumbnails;

		$this->view->album = (object) array(
			'title' => $album->title,
			'id'    => (int) $album->id
			);

		$this->view->breadcrumbs = array((object) array(
			'path'  => 'admin/album/' . $album->id,
			'title' => $album->title,
			'icon'  => 'folder'
			));
	}
}
