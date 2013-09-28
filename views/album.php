<?php require 'header.php' ?>

<script>
	SHOT.images = <?= json_encode($this->images) ?>;
</script>

<div class="carousel">
	<div class="wrap">
		<div class="previous">
			<a>
				<div class="image"></div>
			</a>
		</div>

		<div class="current">
			<div class="image"></div>
		</div>

		<div class="next">
			<a>
				<div class="image"></div>
			</a>
		</div>
	</div>
</div>

<?php require 'footer.php' ?>
