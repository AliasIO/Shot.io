<?php require 'header.php' ?>

<div class="row">
	<div class="large-12 columns">
		<h3>Upload</h3>

		<form id="upload" class="well" method="post" enctype="multipart/form-data">
			<fieldset>
				<div class="row">
					<div class="large-12 columns">
						<label>Files</label>

						<input id="files" name="files" type="file" multiple>
					</div>
				</div>
			</fieldset>
		</form>
	</div>
</div>

<div class="row">
	<div class="large-12 columns">
		<ul class="thumbnail-grid small-block-grid-5">
		</ul>
	</div>
</div>

<?php require 'footer.php' ?>
