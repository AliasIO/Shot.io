<?php include 'views/header.php' ?>

<div class="row">
	<div class="large-12 columns">
		<form id="upload" class="well" method="post" enctype="multipart/form-data">
			<div class="row">
				<div class="large-12 columns">
					<div class="button small expand upload">
						<i class="icon-picture"></i>&nbsp;Upload images
						<input id="files" name="files" type="file" multiple>
					</div>

					<div class="progress"></div>
				</div>
			</div>
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
