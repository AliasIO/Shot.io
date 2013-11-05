<?php include 'views/header.php' ?>

<script>
	SHOT.images = <?= json_encode($this->images) ?>;
	SHOT.album = <?= json_encode($this->album) ?>;
</script>

<div id="carousel-wrap"></div>

<?php include 'views/templates/carousel.php' ?>
<?php include 'views/templates/image.php' ?>

<?php include 'views/footer.php' ?>
