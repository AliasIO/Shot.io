<?php include 'views/header.php' ?>

<div class="row">
	<div class="large-12 columns">
		<form id="upload" class="well" method="post" enctype="multipart/form-data">
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
			<?php /*
			<?php foreach ( $this->images as $image ): ?>
			<li>
				<div class="container">
					<img src="<?= $image->path ?>">
				</div>
			</li>
			<?php endforeach ?>
			*/ ?>
		</ul>
	</div>
</div>

<?php include 'views/footer.php' ?>
