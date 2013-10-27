<?php include 'views/header.php' ?>

<script>
	SHOT.albums = <?= json_encode($this->albums) ?>;
</script>

<div class="row">
	<div class="large-12 columns">
		<form id="album">
			<fieldset>
				<legend>Create album</legend>

				<div class="row collapse">
					<div class="small-9 columns">
						<input type="text" id="title" placeholder="Album name">
					</div>

					<div class="small-3 columns">
						<button type="submit" class="prefix">Create</button>
					</div>
				</div>
			</fieldset>
		</form>
	</div>
</div>

<div class="row">
	<div class="large-12 columns">
		<ul class="thumbnail-grid"></ul>
	</div>
</div>

<?php include 'views/templates/album.php' ?>

<?php include 'views/footer.php' ?>
