<?php

namespace Shot\Models;

/**
 * Image model
 */
class Image extends \Swiftlet\Model
{
	/**
	 * Image
	 * @var \Imagick
	 */
	protected $image;

	/**
	 * Filename
	 * @var string
	 */
	protected $filename;

	/**
	 * Upload path
	 * @var string
	 */
	public static $imagePath = 'public/photos/';

	/**
	 * Image sizes
	 * @var array
	 */
	public static $imageSizes = array(
		2048,
		1600,
		1024
		);

	/**
	 * Thumbnail size
	 * @var integer
	 */
	public static $thumbnailSize = 480;

	/**
	 * Create a new image object
	 * @param string $filename
	 */
	public function create($filename)
	{
		$this->filename = $filename;

		$this->image = new \Imagick(self::$imagePath . $filename);

		$this
			->autoRotate()
			->exportSizes()
			->exportThumbnails()
			;

		$properties = $this->image->getImageProperties();
	}

	/**
	 * Auto rotate image based on EXIF data
	 * @param \Imagick $image
	 */
	protected function autoRotate()
	{
		$orientation = $this->image->getImageOrientation();

		switch ( $orientation ) {
			case \Imagick::ORIENTATION_BOTTOMRIGHT:
				$this->image->rotateimage('#000', 180);

				break;
			case \Imagick::ORIENTATION_RIGHTTOP:
				$this->image->rotateimage('#000', 90);

				break;
			case \Imagick::ORIENTATION_LEFTBOTTOM:
				$this->image->rotateimage('#000', -90);

				break;
		}

		$this->image->setImageOrientation(\Imagick::ORIENTATION_TOPLEFT);

		return $this;
	}

	/**
	 * Generate various file sizes
	 * @return \Imagick
	 */
	protected function exportSizes()
	{
		$geometry = $this->image->getImageGeometry();

		foreach ( self::$imageSizes as $imageSize ) {
			$image = clone($this->image);

			if ( $geometry['width'] < $imageSize && $geometry['height'] < $imageSize ) {
				break;
			}

			$image->resizeImage($imageSize, $imageSize, \Imagick::FILTER_LANCZOS, 0.9, true);

			$image->writeimage(self::$imagePath . $imageSize . '/' . $this->filename);
		}

		return $this;
	}

	/**
	 * Generate thumbnails
	 */
	protected function exportThumbnails()
	{
		$this->exportSmartThumbnail();
		//$this->exportCenteredThumbnail();
	}

	/**
	 * Generate smart thumbnail
	 */
	protected function exportSmartThumbnail()
	{
		$thumbnails = [];

		$thumbnail = clone($this->image);

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
		$temporary = clone($thumbnail);

		// Greyscale
		$temporary->modulateImage(100, 0, 100);

		// Blur
		$temporary->blurImage(3, 2);

		// Slice image
		$sliceCount = 25;

		$sliceSize = floor($size[$orientation] / $sliceCount);

		$entropy = array();

		// Obtain entropy value for each slice
		for ( $i = 0; $i < $sliceCount; $i ++ ) {
			$slice = clone($temporary);

			if ( $orientation == 'x' ) {
				$slice->cropImage($sliceSize, $size['x'], $sliceSize * $i, 0);
			} else {
				$slice->cropImage($size['y'], $sliceSize, 0, $sliceSize * $i);
			}

			$entropy[$i] = $this->getEntropy($slice, $size[$orientation] * $sliceSize) . "\n";
		}

		$temporary->destroy();

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

		$thumbnail->writeimage(self::$imagePath . 'thumb/smart/' . $this->filename);

		return $this;
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
