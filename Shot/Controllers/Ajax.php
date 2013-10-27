<?php

namespace Shot\Controllers;

/**
 * Ajax controller
 */
class Ajax extends \Swiftlet\Controller
{
	/**
	 * File types
	 * @var array
	 */
	static $fileTypes = array(
		'image/jpg'  => '.jpg',
		'image/jpeg' => '.jpg',
		'image/png'  => '.png',
		'image/gif'  => '.gif',
		'image/bmp'  => '.bmp'
		);

	/**
	 * Save album action
	 */
	public function saveAlbum()
	{
		header('Content-Type: application/json');

		if ( !empty($_POST) ) {
			$title = !empty($_POST['title']) ? $_POST['title'] : '';

			$album = $this->app->getModel('album');

			$album
				->setTitle($title)
				->save();

			exit(json_encode(array('id' => $album->getId())));
		}
	}

	/**
	 * Save image action
	 */
	public function saveImage()
	{
		header('Content-Type: application/json');

		try {
			if ( !empty($_FILES) ) {
				foreach ( $_FILES as $file ) {
					switch ( $file['error'] ) {
						case UPLOAD_ERR_INI_SIZE:
							throw new \Swiftlet\Exception('The file is too big');

							break;
						case UPLOAD_ERR_PARTIAL:
							throw new \Swiftlet\Exception('The uploaded file was only partially uploaded');

							break;
						case UPLOAD_ERR_NO_FILE:
							throw new \Swiftlet\Exception('No file was uploaded');

							break;
						case UPLOAD_ERR_NO_TMP_DIR:
							throw new \Swiftlet\Exception('Missing temporary folder');

							break;
						case UPLOAD_ERR_CANT_WRITE:
							throw new \Swiftlet\Exception('Failed to write file to disk');

							break;
						case UPLOAD_ERR_EXTENSION:
							throw new \Swiftlet\Exception('File type not allowed');

							break;
					}

					if ( !in_array($file['type'], array_keys(self::$fileTypes)) ) {
						throw new \Swiftlet\Exception('File type not allowed');
					}

					$filename = sha1(uniqid(mt_rand(), true)) . self::$fileTypes[$file['type']];

					move_uploaded_file($file['tmp_name'], \Shot\Models\Image::$imagePath . $filename);

					$image = $this->app->getModel('image');

					$image
						->create($filename)
						->setTitle(basename($file['name']))
						->save();

					echo json_encode(array('id' => $image->getId(), 'filename' => $filename));

					exit;
				}
			}
		} catch ( \Swiftlet\Exception $e ) {
			header('HTTP/1.1 503 Service unavailable');
			header('Status: 503 Service unavailable');

			echo json_encode(array('error' => $e->getMessage()));

			exit;
		}
	}
}
