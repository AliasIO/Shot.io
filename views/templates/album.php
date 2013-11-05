<script id="template-album" type="text/template">
	<li{{#id}} data-id="{{id}}"{{/id}}>
		<div class="container">
			{{#id}}
			<a href="{{link}}">
				{{#path}}
				<img src="{{path}}">
				{{/path}}
				{{^path}}
				<div class="placeholder-thumbnail">
					<div class="valign"></div>
					<i class="fa fa-picture-o fa-5x"></i>
				</div>
				{{/path}}
				<div class="selection"></div>
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
						<i class="fa fa-folder"></i> {{{title}}}
					</li>
				</ul>
			</div>
		</div>
	</li>
</script>
