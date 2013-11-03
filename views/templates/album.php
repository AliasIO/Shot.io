<script id="template-album" type="text/template">
	<li{{#id}} data-id="{{id}}"{{/id}}>
		<div class="container">
			{{#id}}
			<a href="{{link}}">
				{{#paths.thumb}}
				<img src="<?= $this->app->getRootPath() ?>{{paths.thumb}}">
				{{/paths.thumb}}
				{{^paths.thumb}}
				<div class="placeholder-thumbnail">
					<div class="valign"></div>
					<i class="fa fa-picture-o fa-5x"></i>
				</div>
				{{/paths.thumb}}
			</a>
			{{/id}}
			{{^id}}
			<div class="placeholder-thumbnail">
				<div class="valign"></div>
				<i class="fa fa-picture-o fa-5x"></i>
			</div>
			{{/id}}
			<div class="bar-wrap">
				<ul class="bar">
					<li class="title">
						<i class="fa fa-picture-o"></i> {{{title}}}
					</li>
				</ul>
			</div>
		</div>
	</li>
</script>
