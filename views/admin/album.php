<?php require 'views/header.php' ?>

<div class="row">
	<div class="large-12 columns">
		<ul class="thumbnail-grid">
			<?php foreach ( $this->images as $image ): ?>
			<li>
				<div class="container">
					<img src="<?= $image->path ?>">
				</div>
			</li>
			<?php endforeach ?>
		</ul>
	</div>
</div>

<?php require 'views/footer.php' ?>
