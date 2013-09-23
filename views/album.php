<?php require 'header.php' ?>

<script>
	SHOT.images = <?= json_encode($this->images) ?>;
</script>

<div class="carousel">
	<div class="previous">
		<div class="image"></div>
	</div>

	<div class="current">
		<div class="image"></div>
	</div>

	<div class="next">
		<div class="image"></div>
	</div>
</div>

<?php require 'footer.php' ?>
