<script id="template-dock-thumbnails" type="text/template">
	<div id="edit-mode">
		<div class="row">
			<div class="large-2 small-6 columns">
				<ul class="button-group even-2">
					<li><button class="select-all secondary"><i class="fa fa-check-square-o"></i></button></li>
					<li><button class="select-none secondary"><i class="fa fa-square-o"></i></button></li>
				</ul>
			</div>

			<div class="large-3 small-6 columns">
				<button class="edit rename secondary expand"><i class="fa fa-pencil"></i> Edit</button>
			</div>

			<div class="large-3 small-6 columns">
				<button class="albums rename secondary expand"><i class="fa fa-folder"></i> Albums</button>
			</div>

			<div class="large-3 small-6 columns">
				<button class="delete warn expand"><i class="fa fa-trash-o"></i> Delete</button>
			</div>

			<div class="large-1 small-6 columns">
				<button class="close secondary expand"><i class="fa fa-times"></i></button>
			</div>
		</div>
	</div>
</script>

<?php include 'vendor/Shot/views/templates/modals/thumbnails/edit-selection.php' ?>
<?php include 'vendor/Shot/views/templates/modals/thumbnails/delete-selection.php' ?>
