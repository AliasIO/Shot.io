<?php

namespace Shot\Models;

/**
 * Album model
 */
class Album extends \Swiftlet\Model
{
	/**
	 * ID
	 * @var string
	 */
	protected $id = null;

	/**
	 * Title
	 * @var string
	 */
	public $title = '';

	/**
	 * Save album
	 */
	public function save()
	{
		$dbh = $this->app->getLibrary('pdo')->getHandle();

		if ( $this->id ) {
			$sth = $dbh->prepare('
				UPDATE albums SET
					title = :title
				WHERE
					id = :id
				LIMIT 1
				');

			$sth->bindParam('title', $this->title);
			$sth->bindParam('id',    $this->id, \PDO::PARAM_INT);

			$sth->execute();
		} else {
			$sth = $dbh->prepare('
				INSERT INTO albums (
					title
				) VALUES (
					:title
				)
				');

			$sth->bindParam('title', $this->title);

			$sth->execute();

			$this->id = $dbh->lastInsertId();
		}
	}

	/**
	 * Get ID
	 */
	public function getId()
	{
		return $this->id;
	}
}

