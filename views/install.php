<?php include 'header.php' ?>

<div class="row">
	<div class="large-12 columns">
		<h1><?= $this->pageTitle ?></h1>

		<?php if ( $this->complete ): ?>
		<p>
			Installation complete.
		</p>
		<?php else: ?>
		<p>
			Please make the following directories writable:
		</p>

		<ul>
			<?php foreach ( $this->folders as $folder => $writable ): ?>
			<li>
				<code><?= $folder ?></code>
				<i class="fa fa-<?= $writable ? 'check' : 'times' ?>"></i>
			</li>
			<?php endforeach ?>
		</ul>

		<a href="" class="button small">Refresh page</a>
		<?php endif ?>
	</div>
</div>

<?php include 'footer.php' ?>
