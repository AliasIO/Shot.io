<?php

namespace Shot\Libraries;

class Pdo extends \Swiftlet\Abstracts\Library
{
	protected $handle;

	/**
	 * Establish database connection and eturn database handle
	 */
	public function getHandle()
	{
		if ( !$this->handle ) {
			try {
				$this->handle = new \PDO('sqlite:db/db.sdb');
			} catch ( \PDOException $e ) {
				throw new \Swiftlet\Exception('Error establishing database connection: ' . $e->getMessage());
			}

			$this->handle->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);

			$sth = $this->handle->prepare('PRAGMA journal_mode=WAL');

			$sth->execute();
		}

		return $this->handle;
	}
}
