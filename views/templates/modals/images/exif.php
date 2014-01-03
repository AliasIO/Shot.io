<script id="template-modals-images-exif" type="text/template">
	<div class="modal">
		<div class="modal-background"></div>

		<div class="modal-wrap">
			<div class="row">
				<div class="large-12 columns">
					<div class="modal-content">
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
											</tbody>
										</table>
										{{else}}
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
										<button type="button" class="cancel secondary expand">Close</button>
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
