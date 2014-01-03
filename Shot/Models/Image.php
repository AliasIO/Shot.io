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
	 * Thumbnail crop position
	 * @var string
	 */
	protected $thumbCrop;

	/**
	 * Title
	 * @var string
	 */
	public $title;

	/**
	 * Taken at date
	 * @var integer
	 */
	public $takenAt;

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
	public function create($filename, $thumbCrop = 'smart')
	{
		$this->filename = $filename;

		$this->loadImage();

		$this->properties = $this->image->getImageProperties();

		if ( !empty($this->properties['exif:DateTimeOriginal']) ) {
			$this->takenAt = strtotime($this->properties['exif:DateTimeOriginal']);
		}

		$this
			->autoRotate()
			->exportSizes()
			->exportPreviewThumbnail()
			->exportThumbnail($thumbCrop);

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
					thumb_crop = :thumb_crop,
					properties = :properties,
					taken_at   = :taken_at
				WHERE
					id = :id
				LIMIT 1
				');

			$sth->bindParam('id',         $this->id,     \PDO::PARAM_INT);
			$sth->bindParam('filename',   $this->filename);
			$sth->bindParam('title',      $this->title);
			$sth->bindParam('width',      $this->width,  \PDO::PARAM_INT);
			$sth->bindParam('height',     $this->height, \PDO::PARAM_INT);
			$sth->bindParam('thumb_crop', $this->thumbCrop);
			$sth->bindParam('properties', $properties);
			$sth->bindParam('taken_at',   $this->takenAt, \PDO::PARAM_INT);

			$sth->execute();
		} else {
			$sth = $dbh->prepare('
				INSERT INTO images (
					filename,
					title,
					width,
					height,
					thumb_crop,
					properties,
					taken_at
				) VALUES (
					:filename,
					:title,
					:width,
					:height,
					:thumb_crop,
					:properties,
					:taken_at
				)
				');

			$sth->bindParam('filename',   $this->filename);
			$sth->bindParam('title',      $this->title);
			$sth->bindParam('width',      $this->width,  \PDO::PARAM_INT);
			$sth->bindParam('height',     $this->height, \PDO::PARAM_INT);
			$sth->bindParam('thumb_crop', $this->thumbCrop);
			$sth->bindParam('properties', $properties);
			$sth->bindParam('taken_at',   $this->takenAt, \PDO::PARAM_INT);

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
			try {
				unlink(self::$imagePath . $size . '/' . $this->filename);
			} catch ( \Exception $e ) { }
		}

		try {
			unlink(self::$imagePath . $this->filename);
		} catch ( \Exception $e ) { }

		try {
			unlink(self::$imagePath . 'preview/' . $this->filename);
		} catch ( \Exception $e ) { }

		try {
			unlink(self::$imagePath . 'thumb/' . $this->filename);
		} catch ( \Exception $e ) { }

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
		$this->thumbCrop  = $result->thumb_crop;
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
	 * Get properties
	 * @return array
	 */
	public function getProperties()
	{
		return $this->properties;
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
				return $this->app->getRootPath() . 'photos/' . $size . '/' . $this->filename . '?' . $this->thumbCrop;
			}
		}

		return $this->app->getRootPath() . 'photos/' . $this->filename;
	}

	/**
	 * Export thumbnail
	 * @param string $thumbCrop
	 * @return Image
	 */
	public function exportThumbnail($thumbCrop)
	{
		$this->thumbCrop = $thumbCrop;

		switch ( $thumbCrop ) {
			case 'smart';
				$this->exportSmartThumbnail();

				break;
			case 'centered';
				$this->exportCenteredThumbnail();

				break;
		}

		return $this;
	}

	/**
	 * Load image
	 * &return Image
	 */
	protected function loadImage()
	{
		if ( !( $this->image instanceof \Imagick ) ) {
			$this->image = new \Imagick(self::$imagePath . $this->filename);
		}

		return $this;
	}

	/**
	 * Auto rotate image based on EXIF data
	 * @return Image
	 */
	protected function autoRotate()
	{
		$this->loadImage();

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

		$this->image->writeImage(self::$imagePath . $this->filename);

		return $this;
	}

	/**
	 * Generate various file sizes
	 * @return Image
	 */
	protected function exportSizes()
	{
		$this->loadImage();

		$geometry = $this->image->getImageGeometry();

		foreach ( self::$imageSizes as $imageSize ) {
			$image = clone($this->image);

			if ( $geometry['width'] < $imageSize && $geometry['height'] < $imageSize ) {
				break;
			}

			$image->resizeImage($imageSize, $imageSize, \Imagick::FILTER_LANCZOS, 0.9, true);

			$image->setImageOrientation(\Imagick::ORIENTATION_TOPLEFT);

			$image->writeImage(self::$imagePath . $imageSize . '/' . $this->filename);
		}

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
		$this->loadImage();

		$thumbnail = clone($this->image);

		$thumbnail->setImageCompressionQuality(80);

		$this->scaleThumbnail($thumbnail, 100);

		$thumbnail->setImageOrientation(\Imagick::ORIENTATION_TOPLEFT);

		$thumbnail->writeImage(self::$imagePath . 'preview/' . $this->filename);

		return $this;
	}

	/**
	 * Generate smart thumbnail
	 * @return Image
	 */
	protected function exportSmartThumbnail()
	{
		$this->loadImage();

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

		$thumbnail->setImageOrientation(\Imagick::ORIENTATION_TOPLEFT);

		$thumbnail->writeImage(self::$imagePath . 'thumb/' . $this->filename);

		return $this;
	}

	/**
	 * Generate centered thumbnail
	 * @return Image
	 */
	protected function exportCenteredThumbnail()
	{
		$this->loadImage();

		$thumbnail = clone($this->image);

		$this->scaleThumbnail($thumbnail);

		$geometry = $thumbnail->getImageGeometry();

		if ( $geometry['width'] != $geometry['height'] ) {
			$thumbnail->cropImage(self::$thumbnailSize, self::$thumbnailSize, ( $geometry['width'] - self::$thumbnailSize ) / 2, ( $geometry['height'] - self::$thumbnailSize ) / 2);

			$thumbnail->setImagePage(self::$thumbnailSize, self::$thumbnailSize, 0, 0);
		}

		$thumbnail->setImageOrientation(\Imagick::ORIENTATION_TOPLEFT);

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
