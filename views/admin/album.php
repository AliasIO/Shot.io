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
		</ul>
	</div>
</div>

<script id="template-thumbnail" type="text/template">
	<li>
		<div class="container">
			<div class="processing"></div>
			<div class="title-wrap">
				<div class="title"><i class="fa fa-picture"></i> {{title}}</div>
			</div>
		</div>
	</li>
</script>

<script id="template-progressbar" type="text/template">
	<div class="progressbar-wrap">
		<div class="progressbar"></div>
	</div>
</script>

<?php include 'views/footer.php' ?>
