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
	 * Thumbnail size
	 * @var integer
	 */
	static $thumbnailSize = 480;

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

	/**
	 * Generate various file sizes
	 * @param string $filename
	 */
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

		$this->exportThumbnail($filename);
	}

	/**
	 * Generate thumbnail
	 * @param string $filename
	 */
	protected function exportThumbnail($filename)
	{
		$thumbnail = new \Imagick(self::$uploadPath . $filename);

		$geometry = $thumbnail->getImageGeometry();

		if ( $geometry['width'] >= $geometry['height'] ) {
			$orientation = 'x';

			$thumbnail->scaleImage(0, self::$thumbnailSize);
		} else {
			$orientation = 'y';

			$thumbnail->scaleImage(self::$thumbnailSize, 0);
		}

		$geometry = $thumbnail->getImageGeometry();

		$size = array(
			'x' => $geometry['width'],
			'y' => $geometry['height']
			);

		// Prepare image to improve entropy calculation
		$image = clone($thumbnail);

		// Greyscale
		$image->modulateImage(100, 0, 100);

		// Find edges
		//$image->edgeimage(5);

		// Blur
		$image->blurImage(3, 2);

		// Slice image
		$sliceCount = 25;

		$sliceSize = floor($size[$orientation] / $sliceCount);

		$entropy = array();

		// Obtain entropy value for each slice
		for ( $i = 0; $i < $sliceCount; $i ++ ) {
			$slice = clone($image);

			if ( $orientation == 'x' ) {
				$slice->cropImage($sliceSize, $size['x'], $sliceSize * $i, 0);
			} else {
				$slice->cropImage($size['y'], $sliceSize, 0, $sliceSize * $i);
			}

			$slice->writeimage(self::$uploadPath . 'slice/' . $orientation . $i . '.jpg');

			$entropy[$i] = $this->getEntropy($slice, $size[$orientation] * $sliceSize) . "\n";
		}

		$thumbnailSliceCount = floor(self::$thumbnailSize / $sliceSize);

		$entropySums = array();

		// For each possible offset, calculate the total entropy value
		for ( $i = 0; $i < $sliceCount - $thumbnailSliceCount; $i ++ ) {
			$entropySums[$i] = 0;

			for ( $j = 0; $j < $thumbnailSliceCount; $j ++ ) {
				$entropySums[$i] += $entropy[$i + $j];
			}
		}

		// Choose the offset with the most available entropy
		$offset = array_search(max($entropySums), $entropySums);

		if ( $orientation == 'x' ) {
			$thumbnail->cropImage(self::$thumbnailSize, self::$thumbnailSize, $offset * $sliceSize, 0);
		} else {
			$thumbnail->cropImage(self::$thumbnailSize, self::$thumbnailSize, 0, $offset * $sliceSize);
		}

		$thumbnail->writeimage(self::$uploadPath . self::$thumbnailSize . '/' . $filename);
	}

	/**
	 * Calculate entropy
	 * @param \ImageMagick $image
	 * @param integer $area
	 */
	protected function getEntropy(\Imagick $image, $area)
	{
		$histogram = $image->getImageHistogram();

		$value = .0;

		for ( $i = 0; $i < count($histogram); $i ++ ) {
			// Percentage of pixels having this color value
			$pixels = $histogram[$i]->getColorCount() / $area;

			$value -= $pixels * log($pixels, 2);
		}

		return $value;
	}
}
