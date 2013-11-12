<?php require 'views/header.php' ?>

<script>
	SHOT.thumbnails = <?= json_encode($this->thumbnails) ?>;
	SHOT.album = <?= json_encode($this->album) ?>;
</script>

<div class="row">
	<div class="large-12 columns">
		<ul class="thumbnail-grid"></ul>
	</div>
</div>

<?php include 'views/templates/thumbnail.php' ?>
<?php include 'views/templates/album.php' ?>
<?php include 'views/templates/edit/thumbnails.php' ?>

<?php require 'views/footer.php' ?>
