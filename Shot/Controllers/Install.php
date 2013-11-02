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
			'db'                    => true,
			'log'                   => true,
			'public/photos'         => true,
			'public/photos/1024'    => true,
			'public/photos/1600'    => true,
			'public/photos/2048'    => true,
			'public/photos/preview' => true,
			'public/photos/thumb'   => true
			);

		foreach ( $folders as $folder => $writable ) {
			if ( !is_writable($folder) ) {
				$folders[$folder] = false;

				$complete = false;
			}
		}

		if ( $complete && !file_exists('db/db.sdb') ) {
			if ( is_writable('db') ) {
				touch('db/db.sdb');

				chmod('db/db.sdb', 0666);

				$dbh = $this->app->getLibrary('pdo')->getHandle();

				$sql = file_get_contents('db/schema.sql');

				$dbh->exec($sql);
			} else {
				$folders[] = 'db';
			}
		}

		$this->view->complete = $complete;
		$this->view->folders  = $folders;
	}
}
