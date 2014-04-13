<?php include $this->vendorPath . $this->vendor . '/views/header.php' ?>

<script>
	xSHOT.images = <?= json_encode($this->get('images', false)) ?>;
	SHOT.albums = <?= json_encode($this->albums) ?>;
	SHOT.album = <?= json_encode($this->album) ?>;
</script>

<div id="carousel-wrap"></div>

<?php include $this->vendorPath . $this->vendor . '/views/templates/carousel.php' ?>
<?php include $this->vendorPath . $this->vendor . '/views/templates/image.php' ?>
<?php include $this->vendorPath . $this->vendor . '/views/templates/modals/images/exif.php' ?>

<?php include $this->vendorPath . $this->vendor . '/views/footer.php' ?>
