<?php

namespace Shot\Libraries;

/**
 * Image library
 */
class Image extends \Swiftlet\Library
{
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
	 * Auto rotate image based on EXIF data
	 * @param \Imagick $image
	 */
	public function autoRotate(\Imagick $image)
	{
		$orientation = $image->getImageOrientation();

		switch ( $orientation ) {
			case \Imagick::ORIENTATION_BOTTOMRIGHT:
				$image->rotateimage('#000', 180);

				break;
			case \Imagick::ORIENTATION_RIGHTTOP:
				$image->rotateimage('#000', 90);

				break;
			case \Imagick::ORIENTATION_LEFTBOTTOM:
				$image->rotateimage('#000', -90);

				break;
		}

		$image->setImageOrientation(\Imagick::ORIENTATION_TOPLEFT);
	}

	/**
	 * Generate various file sizes
	 * @param \Imagick $image
	 * @param string $filename
	 * @return array $sizes
	 */
	public function exportSizes(\Imagick $image)
	{
		$sizes = array();

		$geometry = $image->getImageGeometry();

		foreach ( self::$imageSizes as $imageSize ) {
			$copy = clone($image);

			if ( $geometry['width'] < $imageSize && $geometry['height'] < $imageSize ) {
				break;
			}

			$copy->resizeImage($imageSize, $imageSize, \Imagick::FILTER_LANCZOS, 0.9, true);

			$sizes[$imageSize . '/'] = $copy;
		}

		return $sizes;
	}

	/**
	 * Generate thumbnails
	 * @param \Imagick $image
	 * @param string $filename
	 */
	public function exportThumbnails(\Imagick $image)
	{
		$thumbnails = [];

		$thumbnail = clone($image);

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

		$thumbnails['thumb/smart/'] = $thumbnail;

		return $thumbnails;
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
