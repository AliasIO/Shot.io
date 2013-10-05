<?php

namespace Shot\Controllers;

/**
 * Image controller
 */
class Image extends \Swiftlet\Controller
{
	/**
	 * Page title
	 * @var string
	 */
	protected $title = 'Image';

	/**
	 * Default action
	 */
	public function index()
	{
		$imageId = $this->app->getArgs(0);

		$dbh = $this->app->getLibrary('pdo')->getHandle();

		$sth = $dbh->prepare('
			SELECT
				*
			FROM photos
			WHERE
				id = :id
			ORDER BY id DESC
			LIMIT 1
			');

		$sth->bindParam('id', $imageId, \PDO::PARAM_INT);

		$sth->execute();

		$result = $sth->fetchObject();

		$image = new \stdClass;

		try {
			$imageModel = $this->app->getModel('image')->load($result->id);

			$image = (object) array(
				'id'       => (int) $imageModel->getId(),
				'filename' => $imageModel->getFilename(),
				'title'    => $imageModel->getTitle(),
				'width'    => (int) $imageModel->getWidth(),
				'height'   => (int) $imageModel->getHeight(),
				'path'     => $imageModel->getFilePath()
				);
		} catch ( \Swiftlet\Exception $e ) {
		}

		$this->view->image = $image;
	}

	/**
	 * Fullscreen action
	 */
	public function fullscreen()
	{
		$this->index();
	}
}
