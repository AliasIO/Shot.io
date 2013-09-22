<?php require 'header.php' ?>

<?php foreach ( $this->photos as $photo ): ?>
<div class="row">
	<div class="large-12 columns">
		<p>
			<img src="<?= $this->app->getRootPath() ?>photos/1024/<?= $photo->filename ?>">
		</p>
	</div>
</div>
<?php endforeach ?>

<?php require 'footer.php' ?>
