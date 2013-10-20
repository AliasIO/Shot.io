<?php

namespace Shot\Models;

/**
 * Album model
 */
class Album extends \Swiftlet\Model
{
	/**
	 * Create a new image object
	 * @param string $title
	 */
	public function create($title)
	{
		$this->title = $title;

		$dbh = $this->app->getLibrary('pdo')->getHandle();

		$sth = $dbh->prepare('
			INSERT INTO albums (
				title
			) VALUES (
				:title
			)
			');

		$properties = serialize($this->properties);

		$sth->bindParam('title', $this->title);

		$sth->execute();
	}
}
