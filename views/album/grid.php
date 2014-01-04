<?php require 'views/header.php' ?>

<script>
	SHOT.thumbnails = <?= json_encode($this->thumbnails) ?>;
	SHOT.albums = <?= json_encode($this->albums) ?>;
	SHOT.album = <?= json_encode($this->album) ?>;
</script>

<div class="row">
	<div class="large-12 columns">
		<ul class="thumbnail-grid"></ul>
	</div>
</div>

<?php include 'views/templates/thumbnail.php' ?>
<?php include 'views/templates/progressbar.php' ?>
<?php include 'views/templates/docks/thumbnails.php' ?>
<?php include 'views/templates/album.php' ?>
<?php include 'views/templates/modals/thumbnails/upload.php' ?>
<?php include 'views/templates/modals/thumbnails/albums.php' ?>
<?php include 'views/templates/modals/albums/edit.php' ?>

<?php require 'views/footer.php' ?>
