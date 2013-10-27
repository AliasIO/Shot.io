<script id="template-thumbnail" type="text/template">
	<li>
		<div class="container">
			{{#id}}
			<a href="<?= $this->app->getRootPath() ?>album/carousel/1/{{id}}">
				<img src="{{paths.thumb}}">
			</a>
			{{/id}}
			<div class="title-wrap">
				<div class="title"><i class="fa fa-picture"></i> {{title}}</div>
			</div>
		</div>
	</li>
</script>
