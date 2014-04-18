<?php

namespace Shot\Plugins;

/**
 * Common plugin
 */
class Common extends \Swiftlet\Abstracts\Plugin
{
	public function actionAfter()
	{
		$this->view->siteName = $this->app->getConfig('siteName');

		$reflection = new \ReflectionClass($this->controller);

		$this->view->controller = $reflection->getShortName();
	}
}
