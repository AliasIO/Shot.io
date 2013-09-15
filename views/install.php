<?php require 'header.php' ?>

<h1><?= $this->pageTitle ?></h1>

<?php if ( $this->complete ): ?>
<p>
	Good to go.
</p>
<?php else: ?>
<p>
	Make the following directories world writable (chmod 777):
</p>

<ul>
	<?php foreach ( $this->folders as $folder => $writable ): ?>
	<li><code><?= $folder . ( $writable ? ' (OK)' : '' ) ?></code></li>
	<?php endforeach ?>
</ul>
<?php endif ?>

<?php require 'footer.php' ?>
