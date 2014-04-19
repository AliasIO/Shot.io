<?php

namespace Shot\Libraries;

class Exif extends \Swiftlet\Abstracts\Library
{
	protected $fields = array(
		'Make'                  => array('type' => 'text',   'group' => 'Camera',   'desc' => 'Make'),
		'Model'                 => array('type' => 'text',   'group' => 'Camera',   'desc' => 'Model'),
		'DateTimeOriginal'      => array('type' => 'date',   'group' => 'Dates',    'desc' => 'Taken'),
		'DateTimeDigitized'     => array('type' => 'date',   'group' => 'Dates',    'desc' => 'Digitized'),
		'DateTime'              => array('type' => 'date',   'group' => 'Dates',    'desc' => 'Modified'),
		'Artist'                => array('type' => 'text',   'group' => 'Image',    'desc' => 'Artist'),
		'Copyright'             => array('type' => 'text',   'group' => 'Image',    'desc' => 'Copyright'),
		'ColorSpace'            => array('type' => 'number', 'group' => 'Image',    'desc' => 'Color Space'),
		'ImageDescription'      => array('type' => 'text',   'group' => 'Image',    'desc' => 'Description'),
		//'UserComment'           => array('type' => 'text', 'group' => 'Image',      'desc' => 'User Comment'),
		'FileSize'              => array('type' => 'number', 'group' => 'Image',    'desc' => 'File Size'),
		'FileSource'            => array('type' => 'number', 'group' => 'Image',    'desc' => 'File source'),
		'ImageType'             => array('type' => 'text',   'group' => 'Image',    'desc' => 'Type'),
		'ExifImageWidth'        => array('type' => 'number', 'group' => 'Image',    'desc' => 'Width'),
		'ExifImageLength'       => array('type' => 'number', 'group' => 'Image',    'desc' => 'Height'),
		'XResolution'           => array('type' => 'number', 'group' => 'Image',    'desc' => 'X Resolution'),
		'YResolution'           => array('type' => 'number', 'group' => 'Image',    'desc' => 'Y Resolution'),
		'ResolutionUnit'        => array('type' => 'text',   'group' => 'Image',    'desc' => 'Resolution Unit'),
		'ApertureValue'         => array('type' => 'number', 'group' => 'Settings', 'desc' => 'Aperture'),
		'Orientation'           => array('type' => 'number', 'group' => 'Settings', 'desc' => 'Camera Orientation'),
		'ExposureTime'          => array('type' => 'number', 'group' => 'Settings', 'desc' => 'Exposure'),
		'ExposureBiasValue'     => array('type' => 'number', 'group' => 'Settings', 'desc' => 'Exposure Bias'),
		'ExposureMode'          => array('type' => 'number', 'group' => 'Settings', 'desc' => 'Exposure Mode'),
		'ExposureProgram'       => array('type' => 'number', 'group' => 'Settings', 'desc' => 'Exposure Program'),
		'Flash'                 => array('type' => 'number', 'group' => 'Settings', 'desc' => 'Flash Setting'),
		'FocalLength'           => array('type' => 'number', 'group' => 'Settings', 'desc' => 'Focal Length'),
		'FocalLengthIn35mmFilm' => array('type' => 'number', 'group' => 'Settings', 'desc' => 'Focal Length (35mm equiv)'),
		'FNumber'               => array('type' => 'number', 'group' => 'Settings', 'desc' => 'F-Stop'),
		'ISOSpeedRatings'       => array('type' => 'number', 'group' => 'Settings', 'desc' => 'ISO'),
		'LightSource'           => array('type' => 'number', 'group' => 'Settings', 'desc' => 'Light source'),
		'MeteringMode'          => array('type' => 'number', 'group' => 'Settings', 'desc' => 'Metering Mode'),
		'ShutterSpeedValue'     => array('type' => 'number', 'group' => 'Settings', 'desc' => 'Shutter Speed'),
		'SensingMethod'         => array('type' => 'number', 'group' => 'Settings', 'desc' => 'Sensing Method'),
		'WhiteBalance'          => array('type' => 'number', 'group' => 'Settings', 'desc' => 'White Balance'),
		'GPSLatitude'           => array('type' => 'gps',    'group' => 'Location', 'desc' => 'Latitude'),
		'GPSLongitude'          => array('type' => 'gps',    'group' => 'Location', 'desc' => 'Longitude'),
		);

	/**
	 * Format Exif data
	 * @param array $properties
	 */
	public function format(array $properties)
	{
		$exif = array();

		foreach ( $this->fields as $name => $field ) {
			if ( isset($properties['exif:' . $name]) ) {
				$value = trim($this->formatValue($name, $properties['exif:' . $name]));

				if ( !isset($exif[$field['group']]) ) {
					$exif[$field['group']] = array();
				}

				if ( $value != 'Unknown' ) {
					$exif[$field['group']][$field['desc']] = $value;
				}
			}
		}

		//ksort($exif);

		return $exif;
	}

	/**
	 * Format Exif value
	 * @param string $field
	 * @param string $value
	 * @return string
	 */
	protected function formatValue($field, $value)
	{
		switch ( $field ) {
			case 'ExposureMode':
				switch ( $value ) {
					case 0: return 'Auto exposure';
					case 1: return 'Manual exposure';
					case 2: return 'Auto bracket';
				}

				return 'Unknown';

			case 'ExposureProgram':
				switch ( $value ) {
					case 1: return 'Manual';
					case 2: return 'Normal Program';
					case 3: return 'Aperture Priority';
					case 4: return 'Shutter Priority';
					case 5: return 'Creative';
					case 6: return 'Action';
					case 7: return 'Portrait';
					case 8: return 'Landscape';
				}

				return 'Unknown';

			case 'XResolution':
			case 'YResolution':
				if ( strpos($value, '/' ) !== false ) {
					list($n, $d) = explode('/', $value, 2);

					return sprintf('%d dots per unit', $n);
				}

				return sprintf('%d per unit', $value);

			case 'ResolutionUnit':
				switch ( $value ) {
					case 1: return 'Pixels';
					case 2: return 'Inch';
					case 3: return 'Centimeter';
				}

				return 'Unknown';

			case 'ExifImageWidth':
			case 'ExifImageLength':
				return sprintf('%d px', $value);

			case 'Orientation':
				switch ( $value ) {
					case 1: return sprintf('Normal (O deg)');
					case 2: return sprintf('Mirrored');
					case 3: return sprintf('Upsidedown');
					case 4: return sprintf('Upsidedown Mirrored');
					case 5: return sprintf('90 deg CW Mirrored');
					case 6: return sprintf('90 deg CCW');
					case 7: return sprintf('90 deg CCW Mirrored');
					case 8: return sprintf('90 deg CW');
				}

				break;

			case 'ExposureTime':
				if ( strpos($value, '/') !== false ) {
					list($n, $d) = explode('/', $value, 2);

					$value = $n / $d;
				}

				return $this->formatExposure($value);

			case 'ShutterSpeedValue':
				if (strpos($value, '/') !== false) {
					list($n, $d) = explode('/', $value, 2);

					$value = $n / $d;
				}

				$value = exp($value * log(2));

				if ( $value ) {
					$value = 1 / $value;
				}

				return $this->formatExposure($value);

			case 'ApertureValue':
			case 'MaxApertureValue':
				if ( strpos($value, '/') !== false ) {
					list($n, $d) = explode('/', $value, 2);

					$value = $n / $d;
					$value = exp(($value * log(2)) / 2);

					$value = round($value, 1);
				}

				return 'ƒ/' . $value;

			case 'FocalLength':
				if ( strpos($value, '/') !== false ) {
					list($n, $d) = explode('/', $value, 2);

					return sprintf('%d mm', round($n / $d));
				}

				return sprintf('%d mm', $value);

			case 'FNumber':
				if ( strpos($value, '/') !== false ) {
					list($n, $d) = explode('/', $value, 2);

					if ( $d ) {
						return 'ƒ/' . round($n / $d, 1);
					}
				}

				return 'ƒ/' . $value;

			case 'ExposureBiasValue':
				if ( strpos($value, '/') !== false ) {
					list($n, $d) = explode('/', $value, 2);

					if ( !$n ) {
						return '0 EV';
					}
				}

				return $value . ' EV';

			case 'MeteringMode':
				switch ( $value ) {
					case   0: return 'Unknown';
					case   1: return 'Average';
					case   2: return 'Center Weighted Average';
					case   3: return 'Spot';
					case   4: return 'Multi-Spot';
					case   5: return 'Multi-Segment';
					case   6: return 'Partial';
					case 255: return 'Other';
				}

				return sprintf('Unknown: %s', $value);

			case 'LightSource':
				switch ( $value ) {;
					case   1: return 'Daylight';
					case   2: return 'Fluorescent';
					case   3: return 'Tungsten';
					case   4: return 'Flash';
					case   9: return 'Fine weather';
					case  10: return 'Cloudy weather';
					case  11: return 'Shade';
					case  12: return 'Daylight fluorescent';
					case  13: return 'Day white fluorescent';
					case  14: return 'Cool white fluorescent';
					case  15: return 'White fluorescent';
					case  17: return 'Standard light A';
					case  18: return 'Standard light B';
					case  19: return 'Standard light C';
					case  20: return 'D55';
					case  21: return 'D65';
					case  22: return 'D75';
					case  23: return 'D50';
					case  24: return 'ISO studio tungsten';
					case 255: return 'Other';
				}

				return 'Unknown';

			case 'WhiteBalance':
				switch ( $value ) {
					case 0: return 'Auto';
					case 1: return 'Manual';
				}

				return 'Unknown';

			case 'FocalLengthIn35mmFilm':
			return $value . ' mm';

			case 'Flash':
				switch ( $value ) {
					case  0: return 'No Flash';
					case  1: return 'Flash';
					case  5: return 'Flash, strobe return light not detected';
					case  7: return 'Flash, strobe return light detected';
					case  9: return 'Compulsory Flash';
					case 13: return 'Compulsory Flash, Return light not detected';
					case 15: return 'Compulsory Flash, Return light detected';
					case 16: return 'No Flash';
					case 24: return 'No Flash';
					case 25: return 'Flash, Auto-Mode';
					case 29: return 'Flash, Auto-Mode, Return light not detected';
					case 31: return 'Flash, Auto-Mode, Return light detected';
					case 32: return 'No Flash';
					case 65: return 'Red Eye';
					case 69: return 'Red Eye, Return light not detected';
					case 71: return 'Red Eye, Return light detected';
					case 73: return 'Red Eye, Compulsory Flash';
					case 77: return 'Red Eye, Compulsory Flash, Return light not detected';
					case 79: return 'Red Eye, Compulsory Flash, Return light detected';
					case 89: return 'Red Eye, Auto-Mode';
					case 93: return 'Red Eye, Auto-Mode, Return light not detected';
					case 95: return 'Red Eye, Auto-Mode, Return light detected';
				}

				break;

			case 'FileSize':
				if ( $value <= 0 ) {
					return '0 Bytes';
				}

				$s = array('B', 'kB', 'MB', 'GB');
				$e = floor(log($value, 1024));

				return round($value / pow(1024, $e), 2) . ' ' . $s[$e];

			case 'FileSource':
				switch ( $value ) {
					case 1: return 'Film Scanner';
					case 2: return 'Reflection Print Scanner';
					case 3: return 'Digital Camera';
				}

				return 'Unknown';

			case 'SensingMethod':
				switch ( $value ) {
					case 1: return 'Not defined';
					case 2: return 'One Chip Color Area Sensor';
					case 3: return 'Two Chip Color Area Sensor';
					case 4: return 'Three Chip Color Area Sensor';
					case 5: return 'Color Sequential Area Sensor';
					case 7: return 'Trilinear Sensor';
					case 8: return 'Color Sequential Linear Sensor';
				}

				return 'Unknown';

			case 'ColorSpace':
				switch ( $value ) {
					case 1: return 'sRGB';
				}

				return 'Uncalibrated';

			case 'DateTime':
			case 'DateTimeOriginal':
			case 'DateTimeDigitized':
				return date('Y-m-d H:i:s O', strtotime($value));

			default:
				return $value;
		}
	}

	protected function formatExposure($value)
	{
		if ( $value > 0 ) {
			if ( $value > 1 ) {
				return sprintf('%d sec', round($value, 2));
			} else {
				$n = $d = 0;

				$this->convertToFraction($value, $n, $d);

				if ( $n != 1 ) {
					return sprintf('%4f sec', $n / $d);
				}

				return sprintf('%s/%s sec', $n, $d);
			}
		} else {
			return 'Bulb';
		}
	}

	/**
	* Convert a floating point number into a fraction.
	* @param float $value
	* @param integer $n  Numerator
	* @param integer $d  Denominator
	*/
	protected function convertToFraction($value, &$n, &$d)
	{
		$maxTerms   = 15;         // Limit to prevent infinite loop
		$minDivisor = 0.000001;   // Limit to prevent divide by zero
		$maxError   = 0.00000001; // How close is enough

		// Initialize fraction being converted
		$fraction = $value;

		// Initialize fractions with 1/0, 0/1
		$n1 = 1;
		$d1 = 0;
		$n2 = 0;
		$d2 = 1;

		for ( $i = 0; $i < $maxTerms; $i ++ ) {
			$a        = floor($fraction); // Get next term
			$fraction = $fraction - $a;   // Get new divisor
			$n        = $n1 * $a + $n2;   // Calculate new fraction
			$d        = $d1 * $a + $d2;
			$n2       = $n1;              // Save last two fractions
			$d2       = $d1;
			$n1       = $n;
			$d1       = $d;

			// Quit if dividing by zero
			if ( $fraction < $minDivisor ) {
				break;
			}

			if ( abs($value - $n / $d) < $maxError ) {
				break;
			}

			// Reciprocal
			$fraction = 1 / $fraction;
		}
	}

	/**
	* Parse the Longitude and Latitude values into a standardized format
	* regardless of the source format.
	* @param mixed $data  An array containing degrees, minutes, seconds in index 0, 1, 2 respectifully.
	* @return double  The location data in a decimal format.
	*/
	protected function parseGpsData($value)
	{
		// According to EXIF standard, GPS data can be in the form of
		// dd/1 mm/1 ss/1 or as a decimal reprentation.
		if ( $data[0] == 0 ) {
			return 0;
		}

		$min = explode('/', $data[1]);

		if ( count($min) > 1 ) {
			$min = $min[0] / $min[1];
		} else {
			$min = $min[0];
		}

		$sec = explode('/', $data[2]);

		if ( count($sec) > 1 ) {
			$sec = $sec[0] / $sec[1];
		} else {
			$sec = $sec[0];
		}

		return $this->degToDecimal($data[0], $min, $sec);
	}

	/**
	 * Degrees to decimal
	 * @param integer $degrees
	 * @param integer $minutes
	 * @param integer $seconds
	 */
	protected function degToDecimal($degrees, $minutes, $seconds)
	{
		$degs = (double) ( $degrees + ( $minutes / 60 ) + ( $seconds / 3600 ) );

		return round($degs, 6);
	}
}
