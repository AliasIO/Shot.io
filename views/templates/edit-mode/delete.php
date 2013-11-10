<script id="template-edit-mode-delete" type="text/template">
	<div class="modal">
		<div class="modal-background"></div>

		<div class="modal-content">
			<div class="row">
				<div class="large-12 columns">
					<form method="post">
						<fieldset>
							<legend>Are you sure?</legend>

							{{#image}}
							<p>
								The selected images will be permanently deleted from all albums.
							</p>
							{{/image}}

							{{#album}}
							<p>
								The selected albums will be deleted. Images will not be deleted.
							</p>
							{{/album}}

							<div class="row">
								<div class="small-6 columns">
									<button type="submit" class="delete expand"><i class="fa fa-trash-o"></i> Delete</button>
								</div>

								<div class="small-6 columns">
									<button type="button" class="cancel secondary expand"><i class="fa fa-times"></i> Cancel</button>
								</div>
							</div>
						</fieldset>
					</form>
				</div>
			</div>
		</div>
	</div>
</script>
