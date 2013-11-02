<?php

namespace Shot\Libraries;

class Helpers extends \Swiftlet\Library
{
	/**
	 * TODO
	 */
	public function error404()
	{
		$this->view->pageTitle = 'Error 404';

		if ( !headers_sent() ) {
			header('HTTP/1.1 404 Not Found');
			header('Status: 404 Not Found');
		}

		$this->view->name = 'error404';
	}
}
