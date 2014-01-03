<script id="template-modals-images-exif" type="text/template">
	<div class="modal">
		<div class="modal-background"></div>

		<div class="modal-content">
			<div class="row">
				<div class="large-12 columns">
					<form method="post">
						<fieldset>
							<div class="row">
								<div class="large-12 small-12 columns">
									{{#if exif}}
									<table>
										<tbody>
											{{#each exif}}
											<tr>
												<th>
													{{@key}}
												</th>
												<td>
													{{this}}
												</td>
											</tr>
											{{/each}}
											{{else}}
										</tbody>
									</table>
									<p>
										No Exif data available.
									</p>
									{{/if}}
								</div>
							</div>
						</fieldset>
						<fieldset>
							<div class="row">
								<div class="large-12 small-12 columns">
									<button type="button" class="cancel secondary expand"><i class="fa fa-times"></i> Close</button>
								</div>
							</div>
						</fieldset>
					</form>
				</div>
			</div>
		</div>
	</div>
</script>
