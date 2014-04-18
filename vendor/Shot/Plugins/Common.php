<?php

namespace Shot\Plugins;

/**
 * Common plugin
 */
class Common extends \Swiftlet\Abstracts\Plugin
{
	public function actionBefore()
	{
		if ( !file_exists('db/db.sdb') && get_class($this->controller) != 'Shot\Controllers\Install' ) {
			header('Location: ' . $this->view->getRootPath() . 'install');

			exit;
		}
	}

	public function actionAfter()
	{
		$this->view->siteName = $this->app->getConfig('siteName');

		$reflection = new \ReflectionClass($this->controller);

		$this->view->controller = $reflection->getShortName();
	}
}
