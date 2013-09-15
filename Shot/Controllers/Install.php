<?php

namespace Shot\Controllers;

/**
 * Index controller
 */
class Install extends \Swiftlet\Controller
{
	/**
	 * Page title
	 * @var string
	 */
	protected $title = 'Install';

	/**
	 * Default action
	 */
	public function index()
	{
		$complete = true;

		$folders = array(
			'log'     => true,
			'uploads' => true
			);

		if ( !file_exists('db/db.sdb') ) {
			if ( is_writable('db') ) {
				touch('db/db.sdb');

				chmod('db/db.sdb', 0666);

				$dbh = $this->app->getSingleton('pdo')->getHandle();

				$sql = file_get_contents('db/schema.sql');

				$dbh->exec($sql);
			} else {
				$folders[] = 'db';
			}
		}

		foreach ( $folders as $folder => $writable ) {
			if ( !is_writable($folder) ) {
				$folders[$folder] = false;

				$complete = false;
			}
		}

		$this->view->complete = $complete;
		$this->view->folders  = $folders;
	}
}
