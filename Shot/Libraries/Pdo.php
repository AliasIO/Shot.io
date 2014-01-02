<?php

namespace Shot\Libraries;

class Pdo extends \Swiftlet\Library
{
	protected $handle;

	/**
	 * Establish database connection
	 * @param object $app
	 */
	public function __construct(\Swiftlet\Interfaces\App $app, \Swiftlet\Interfaces\View $view, \Swiftlet\Interfaces\Controller $controller)
	{
		parent::__construct($app, $view, $controller);

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

		$sth = $this->handle->prepare('PRAGMA journal_mode=WAL');

		$sth->execute();
	}

	/**
	 * Return database handle
	 */
	public function getHandle()
	{
		return $this->handle;
	}
}
