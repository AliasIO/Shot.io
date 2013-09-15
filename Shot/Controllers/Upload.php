<?php

namespace Shot\Controllers;

/**
 * Upload controller
 */
class Upload extends \Swiftlet\Controller
{
	/**
	 * Page title
	 * @var string
	 */
	protected $title = 'Upload';

	/**
	 * Upload path
	 * @var string
	 */
	static $uploadPath = 'public/photos/';

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
	 * Image sizes
	 * @var array
	 */
	static $imageSizes = array(
		2048,
		1600,
		1024
		);

	/**
	 * Default action
	 */
	public function index()
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

					move_uploaded_file($file['tmp_name'], self::$uploadPath . $filename);

					$this->exportSizes($filename);

					echo json_encode(array('filename' => $filename));

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

	protected function exportSizes($filename)
	{
		foreach ( self::$imageSizes as $imageSize ) {
			$image = new \Imagick(self::$uploadPath . $filename);

			$geometry = $image->getImageGeometry();

			if ( $geometry['width'] < $imageSize && $geometry['height'] < $imageSize ) {
				break;
			}

			$image->resizeImage($imageSize, $imageSize, \Imagick::FILTER_LANCZOS, 0.9, true);

			$image->writeImage(self::$uploadPath . $imageSize . '/' . $filename);
		}

		// Thumbnail
		$entropy = new \stojg\crop\CropEntropy(self::$uploadPath . $filename);

		$thumbnail = $entropy->resizeAndCrop(480, 480);

		$thumbnail->writeimage(self::$uploadPath . '480/' . $filename);
	}
}
