<script id="template-album" type="text/template">
	<li>
		<div class="container">
			{{#id}}
			<a href="{{link}}" data-id="{{id}}">
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
			<div class="title-wrap">
				<div class="title"><i class="fa fa-folder"></i> {{title}}</div>
			</div>
		</div>
	</li>
</script>
