<?php require 'views/header.php' ?>

<div class="row">
	<div class="large-12 columns">
		<ul class="thumbnail-grid">
			<?php if ( $this->images ): ?>
			<?php foreach ( $this->images as $image ): ?>
			<li>
				<div class="container">
					<a href="<?= $this->app->getRootPath() ?>album/carousel/<?= $this->album->id ?>/<?= $image->id ?>"><img src="<?= $image->paths['thumb'] ?>"></a>
					<div class="title-wrap">
						<div class="title">
							<i class="icon-picture"></i>&nbsp;<?= $image->title ?>
						</div>
					</div>
				</div>
			</li>
			<?php endforeach ?>
			<?php endif ?>
		</ul>
	</div>
</div>

<?php require 'views/footer.php' ?>
