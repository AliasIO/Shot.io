<?php

namespace Shot\Models;

/**
 * Image model
 */
class Image extends \Swiftlet\Model
{
	const EXCEPTION_NOT_FOUND = 1;

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
	 * Width
	 * @var integer
	 */
	protected $width;

	/**
	 * Height
	 * @var integer
	 */
	protected $height;

	/**
	 * Title
	 * @var string
	 */
	public $title;

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

		$this->title = $filename;

		$this->image = new \Imagick(self::$imagePath . $filename);

		$this->properties = $this->image->getImageProperties();

		$geometry = $this->image->getImageGeometry();

		$this->width  = $geometry['width'];
		$this->height = $geometry['height'];

		$this
			->autoRotate()
			->exportSizes()
			->exportThumbnails()
			;

		$dbh = $this->app->getLibrary('pdo')->getHandle();

		$sth = $dbh->prepare('
			INSERT INTO photos (
				filename,
				title,
				width,
				height,
				properties
			) VALUES (
				:filename,
				:title,
				:width,
				:height,
				:properties
			)
			');

		$properties = serialize($this->properties);

		$sth->bindParam('filename', $this->filename);
		$sth->bindParam('title', $this->title);
		$sth->bindParam('width', $this->width, \PDO::PARAM_INT);
		$sth->bindParam('height', $this->height, \PDO::PARAM_INT);
		$sth->bindParam('properties', $properties);

		$sth->execute();
	}

	/**
	 * Load an image
	 * @param string $id
	 */
	public function load($id)
	{
		$dbh = $this->app->getLibrary('pdo')->getHandle();

		$sth = $dbh->prepare('
			SELECT
				*
			FROM photos
			WHERE
				id = :id
			LIMIT 1
			');

		$sth->bindParam('id', $id, \PDO::PARAM_INT);

		$sth->execute();

		$result = $sth->fetchObject();

		if ( !$result ) {
			throw new \Swiftlet\Exception('Image does not exist', self::EXCEPTION_NOT_FOUND);
		}

		$this->title    = $result->title;
		$this->filename = $result->filename;

		return $this;
	}

	/**
	 * Get file name
	 */
	public function getFilename()
	{
		return $this->filename;
	}

	/**
	 * Get width
	 */
	public function getWidth()
	{
		return $this->width;
	}

	/**
	 * Get height
	 */
	public function getHeight()
	{
		return $this->height;
	}

	/**
	 * Get file path
	 * @param mixed $size
	 * @return string
	 */
	public function getFilePath($size = null)
	{
		if ( $size && in_array($size, self::$imageSizes) && ( $size > $this->width || $size > $this->height ) ) {
			return $this->app->getRootPath() . 'photos/' . $size . '/' . $this->filename;
		}

		return $this->app->getRootPath() . 'photos/' . $this->filename;
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

			$image->writeImage(self::$imagePath . $imageSize . '/' . $this->filename);
		}

		return $this;
	}

	/**
	 * Generate thumbnails
	 */
	protected function exportThumbnails()
	{
		$this->exportSmartThumbnail();
		$this->exportCenteredThumbnail();
	}

	/**
	 * Scale thumbnail
	 * @param \Imagick $thumbnail
	 */
	protected function scaleThumbnail(\Imagick $thumbnail)
	{
		$geometry = $thumbnail->getImageGeometry();

		if ( $geometry['width'] >= $geometry['height'] ) {
			$orientation = 'x';

			$thumbnail->scaleImage(0, self::$thumbnailSize);
		} else {
			$orientation = 'y';

			$thumbnail->scaleImage(self::$thumbnailSize, 0);
		}
	}

	/**
	 * Generate smart thumbnail
	 */
	protected function exportSmartThumbnail()
	{
		$thumbnail = clone($this->image);

		$this->scaleThumbnail($thumbnail);

		$geometry = $thumbnail->getImageGeometry();

		$size = array(
			'x' => $geometry['width'],
			'y' => $geometry['height']
			);

		if ( $size['x'] != $size['y'] ) {
			$orientation = $size['x'] > $size['y'] ? 'x' : 'y';

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
			$offset = $entropySums ? 0 : array_search(max($entropySums), $entropySums);

			if ( $orientation == 'x' ) {
				$thumbnail->cropImage(self::$thumbnailSize, self::$thumbnailSize, $offset * $sliceSize, 0);
			} else {
				$thumbnail->cropImage(self::$thumbnailSize, self::$thumbnailSize, 0, $offset * $sliceSize);
			}

			$thumbnail->setImagePage(self::$thumbnailSize, self::$thumbnailSize, 0, 0);
		}

		$thumbnail->writeImage(self::$imagePath . 'thumb/smart/' . $this->filename);

		return $this;
	}

	/**
	 * Generate centered thumbnail
	 */
	protected function exportCenteredThumbnail()
	{
		$thumbnail = clone($this->image);

		$this->scaleThumbnail($thumbnail);

		$geometry = $thumbnail->getImageGeometry();

		if ( $geometry['width'] != $geometry['height'] ) {
			$thumbnail->cropImage(self::$thumbnailSize, self::$thumbnailSize, ( self::$thumbnailSize - $geometry['width'] ) / 2, ( self::$thumbnailSize - $geometry['height'] ) / 2);

			$thumbnail->setImagePage(self::$thumbnailSize, self::$thumbnailSize, 0, 0);
		}

		$thumbnail->writeImage(self::$imagePath . 'thumb/centered/' . $this->filename);
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
