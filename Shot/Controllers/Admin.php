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
		$dbh = $this->app->getSingleton('pdo')->getHandle();
	}
}
