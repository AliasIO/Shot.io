<?php include 'header.php' ?>

<script>
	SHOT.albums = <?= json_encode($this->albums) ?>;
</script>

<div class="row">
	<div class="large-12 columns">
		<ul class="thumbnail-grid"></ul>
	</div>
</div>

<?php include 'views/templates/album.php' ?>
<?php include 'views/templates/docks/albums.php' ?>
<?php include 'views/templates/modals/albums/create.php' ?>

<?php include 'footer.php' ?>
