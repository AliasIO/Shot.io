<?php include 'views/header.php' ?>

<script>
	SHOT.thumbnails = <?= json_encode($this->thumbnails) ?>;
	SHOT.album = <?= json_encode($this->album) ?>;
</script>

<div class="row">
	<div class="large-12 columns">
		<form id="upload" method="post" enctype="multipart/form-data">
			<fieldset>
				<legend>Upload images</legend>

				<div class="row">
					<div class="large-12 columns">
						<div class="button expand upload">
							Choose files
							<input id="files" name="files" type="file" multiple>
						</div>

						<div class="progress"></div>
					</div>
				</div>
			</fieldet>
		</form>
	</div>
</div>

<div class="row">
	<div class="large-12 columns">
		<ul class="thumbnail-grid">
		</ul>
	</div>
</div>

<?php include 'views/templates/thumbnail.php' ?>
<?php include 'views/templates/progressbar.php' ?>

<?php include 'views/footer.php' ?>
