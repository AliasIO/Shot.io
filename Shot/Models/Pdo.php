<?php

namespace Shot\Models;

class Pdo extends \Swiftlet\Model
{
	protected $handle;

	/**
	 * Establish database connection
	 * @param object $app
	 */
	public function __construct(\Swiftlet\Interfaces\App $app)
	{
		parent::__construct($app);

		if ( !file_exists('db/db.sdb') ) {
			header('Location: ' . $this->app->getRootPath() . 'install');

			exit;
		}

		try {
			$this->handle = new \PDO('sqlite:db/db.sdb');
		} catch ( \PDOException $e ) {
			throw new \Swiftlet\Exception('Error establishing database connection: ' . $e->getMessage());
		}

		$this->handle->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
	}

	/**
	 * Return database handle
	 */
	public function getHandle()
	{
		return $this->handle;
	}
}
