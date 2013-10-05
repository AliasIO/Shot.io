<?php require 'views/header.php' ?>

<script>
	SHOT.images = <?= json_encode($this->images) ?>;
	SHOT.album = <?= json_encode($this->album) ?>;
</script>

<div class="carousel"></div>

<?php require 'views/footer.php' ?>
