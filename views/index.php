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
<?php include 'views/templates/edit/albums.php' ?>

<?php include 'footer.php' ?>
