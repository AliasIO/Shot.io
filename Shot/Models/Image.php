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
	 * ID
	 * @var integer
	 */
	protected $id;

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
	 * Properties
	 * @var array
	 */
	protected $properties;

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
	 * @return Image
	 */
	public function create($filename)
	{
		$this->filename = $filename;

		$this->title = basename($filename);

		$this->image = new \Imagick(self::$imagePath . $filename);

		$this->properties = $this->image->getImageProperties();

		$this
			->autoRotate()
			->exportSizes()
			->exportThumbnails();

		$geometry = $this->image->getImageGeometry();

		$this->width  = $geometry['width'];
		$this->height = $geometry['height'];

		return $this;
	}

	/**
	 * Save image
	 * @return Image
	 * @throws \Swiftlet\Exception
	 */
	public function save()
	{
		$dbh = $this->app->getLibrary('pdo')->getHandle();

		$properties = serialize($this->properties);

		if ( $this->id ) {
			$sth = $dbh->prepare('
				UPDATE images SET
					filename   = :filename,
					title      = :title,
					width      = :width,
					height     = :height,
					properties = :properties
				WHERE
					id = :id
				LIMIT 1
				');

			$sth->bindParam('id',         $this->id,     \PDO::PARAM_INT);
			$sth->bindParam('filename',   $this->filename);
			$sth->bindParam('title',      $this->title);
			$sth->bindParam('width',      $this->width,  \PDO::PARAM_INT);
			$sth->bindParam('height',     $this->height, \PDO::PARAM_INT);
			$sth->bindParam('properties', $properties);

			$sth->execute();
		} else {
			$sth = $dbh->prepare('
				INSERT INTO images (
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

			$sth->bindParam('filename',   $this->filename);
			$sth->bindParam('title',      $this->title);
			$sth->bindParam('width',      $this->width,  \PDO::PARAM_INT);
			$sth->bindParam('height',     $this->height, \PDO::PARAM_INT);
			$sth->bindParam('properties', $properties);

			$sth->execute();

			$this->id = $dbh->lastInsertId();

			return $this;
		}
	}

	/**
	 * Delete image
	 * @throws \Swiftlet\Exception
	 */
	public function delete()
	{
		if ( !$this->id ) {
			return;
		}

		$dbh = $this->app->getLibrary('pdo')->getHandle();

		if ( $this->id ) {
			$sth = $dbh->prepare('
				DELETE
				FROM images WHERE
					id = :id
				LIMIT 1
				');

			$sth->bindParam('id', $this->id, \PDO::PARAM_INT);

			$sth->execute();
		}

		foreach ( self::$imageSizes as $size ) {
			unlink(self::$imagePath . $size . '/' . $this->filename);
		}

		unlink(self::$imagePath .              $this->filename);
		unlink(self::$imagePath . 'preview/' . $this->filename);
		unlink(self::$imagePath . 'thumb/'   . $this->filename);

		$this->id = null;
	}

	/**
	 * Load an image
	 * @param integer $id
	 * @return Image
	 */
	public function load($id)
	{
		$dbh = $this->app->getLibrary('pdo')->getHandle();

		$sth = $dbh->prepare('
			SELECT
				*
			FROM images
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

		$this->id         = $result->id;
		$this->title      = $result->title;
		$this->filename   = $result->filename;
		$this->width      = $result->width;
		$this->height     = $result->height;
		$this->properties = unserialize($result->properties);

		return $this;
	}

	/**
	 * Get ID
	 * @return integer
	 */
	public function getId()
	{
		return $this->id;
	}

	/**
	 * Get file name
	 * @return string
	 */
	public function getFilename()
	{
		return $this->filename;
	}

	/**
	 * Get width
	 * @return integer
	 */
	public function getWidth()
	{
		return $this->width;
	}

	/**
	 * Get height
	 * @return integer
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
		if ( $size ) {
			if ( in_array($size, self::$imageSizes) && ( $size < $this->width && $size < $this->height ) ) {
				return $this->app->getRootPath() . 'photos/' . $size . '/' . $this->filename;
			}

			if ( in_array($size, array('thumb', 'preview')) ) {
				return $this->app->getRootPath() . 'photos/' . $size . '/' . $this->filename;
			}
		}

		return $this->app->getRootPath() . 'photos/' . $this->filename;
	}

	/**
	 * Auto rotate image based on EXIF data
	 * @return Image
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
	 * @return Image
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
	 * @return Image
	 */
	protected function exportThumbnails()
	{
		$this->exportPreviewThumbnail();
		$this->exportSmartThumbnail();
		//$this->exportCenteredThumbnail();

		return $this;
	}

	/**
	 * Scale thumbnail
	 * @param \Imagick $thumbnail
	 * @param integer $size
	 * @return Image
	 */
	protected function scaleThumbnail(\Imagick $thumbnail, $size = null)
	{
		$size = $size ?: self::$thumbnailSize;

		$geometry = $thumbnail->getImageGeometry();

		if ( $geometry['width'] >= $geometry['height'] ) {
			$thumbnail->scaleImage(0, $size);
		} else {
			$thumbnail->scaleImage($size, 0);
		}

		return $this;
	}

	/**
	 * Generate preview thumbnail
	 * @return Image
	 */
	protected function exportPreviewThumbnail()
	{
		$thumbnail = clone($this->image);

		$thumbnail->setImageCompressionQuality(80);

		$this->scaleThumbnail($thumbnail, 100);

		$thumbnail->writeImage(self::$imagePath . 'preview/' . $this->filename);

		return $this;
	}

	/**
	 * Generate smart thumbnail
	 * @return Image
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
			$offset = !$entropySums ? 0 : array_search(max($entropySums), $entropySums);

			if ( $orientation == 'x' ) {
				$thumbnail->cropImage(self::$thumbnailSize, self::$thumbnailSize, $offset * $sliceSize, 0);
			} else {
				$thumbnail->cropImage(self::$thumbnailSize, self::$thumbnailSize, 0, $offset * $sliceSize);
			}

			$thumbnail->setImagePage(self::$thumbnailSize, self::$thumbnailSize, 0, 0);
		}

		$thumbnail->writeImage(self::$imagePath . 'thumb/' . $this->filename);

		return $this;
	}

	/**
	 * Generate centered thumbnail
	 * @return Image
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

		$thumbnail->writeImage(self::$imagePath . 'thumb/' . $this->filename);

		return $this;
	}

	/**
	 * Calculate entropy
	 * @param \ImageMagick $image
	 * @param integer $area
	 * @return integer
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
