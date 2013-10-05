<?php require 'header.php' ?>

<div class="row">
	<div class="large-12 columns">
		<form id="upload" class="well" method="post" enctype="multipart/form-data">
				<div class="row">
					<div class="large-12 columns">
						<div class="button small upload">
							<i class="icon-picture"></i>&nbsp;Upload photos
							<input id="files" name="files" type="file" multiple>
						</div>
					</div>
				</div>
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
