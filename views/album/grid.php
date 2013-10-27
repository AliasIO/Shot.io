<?php require 'views/header.php' ?>

<script>
	SHOT.thumbnails = <?= json_encode($this->thumbnails) ?>;
</script>

<div class="row">
	<div class="large-12 columns">
		<ul class="thumbnail-grid"></ul>
	</div>
</div>

<?php include 'views/templates/thumbnail.php' ?>

<?php require 'views/footer.php' ?>
