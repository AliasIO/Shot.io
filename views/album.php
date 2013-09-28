<?php require 'header.php' ?>

<script>
	SHOT.images = <?= json_encode($this->images) ?>;
</script>

<div class="carousel"></div>

<?php require 'footer.php' ?>
