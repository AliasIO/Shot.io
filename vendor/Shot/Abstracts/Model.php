<?php

namespace Shot\Abstracts;

/**
 * Model class
 * @abstract
 */
abstract class Model extends \Swiftlet\Abstracts\Model
{
	/**
	 * Database handle
	 * @var resource
	 * @return Model
	 */
	protected $dbh;

	public function setDatabaseHandle($dbh)
	{
		$this->dbh = $dbh;

		return $this;
	}
}
