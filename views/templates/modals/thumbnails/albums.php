<script id="template-modals-thumbnails-albums" type="text/template">
	<div class="modal">
		<div class="modal-background"></div>

		<div class="modal-wrap">
			<div class="row">
				<div class="large-12 columns">
					<div class="modal-content">
						<form method="post">
							<fieldset>
								<legend>Add to albums</legend>

								<div class="row">
									<div class="large-12 columns">
										{{#each albums}}
										<label><input type="checkbox" name="album[{{id}}]"> {{title}}</label>
										{{/each}}
									</div>
								</div>
							</fieldset>

							<fieldset>
								<legend>Remove from albums</legend>

								<div class="row">
									<div class="large-12 columns">
										<label><input type="checkbox" name="remove"> This album ({{album.title}})</label>
										<label><input type="checkbox" name="remove_other"> All other albums</label>
									</div>
								</div>
							</fieldset>

							<fieldset>
								<div class="row">
									<div class="large-8 small-6 columns">
										<button type="submit" class="delete expand"><i class="fa fa-save"></i> Save</button>
									</div>

									<div class="large-4 small-6 columns">
										<button type="button" class="cancel secondary expand"><i class="fa fa-times"></i> Cancel</button>
									</div>
								</div>
							</fieldset>
						</form>
					</div>
				</div>
			</div>
		</div>
	</div>
</script>
