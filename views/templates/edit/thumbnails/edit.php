<script id="template-edit-albums-edit" type="text/template">
	<div class="modal">
		<div class="modal-background"></div>

		<div class="modal-content">
			<div class="row">
				<div class="large-12 columns">
					<form method="post">
						<fieldset>
							<legend>Title</legend>

							<div class="row">
								<div class="large-12 columns">
									<input type="text" name="title" placeholder="No change">
								</div>
							</div>
						</fieldset>

						<fieldset>
							<legend>Thumbnail</legend>

							<div class="row">
								<div class="large-3 columns">
									<label><input type="radio" name="thumb-crop" value="smart"> Smart</label>
								</div>

								<div class="large-3 columns">
									<label><input type="radio" name="thumb-crop" value="centered"> Centred</label>
								</div>

								<div class="large-3 columns">
									<label><input type="radio" name="thumb-crop" value="top-left"> Top/left</label>
								</div>

								<div class="large-3 columns">
									<label><input type="radio" name="thumb-crop" value="bottom-right"> Bottom/right</label>
								</div>
							</div>
						</fieldset>

						<fieldset>
							<div class="row">
								<div class="small-6 columns">
									<button type="submit" class="delete expand"><i class="fa fa-save"></i> Save</button>
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
