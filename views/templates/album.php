<script id="template-album" type="text/template">
	<li{{#id}} data-id="{{id}}"{{/id}}>
		<div class="container">
			{{#id}}
			<a href="{{link}}">
				{{#path}}
				<img src="{{path}}" width="100%" height="100%">
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
					{{#pending}}
					<li class="icon" title="Processing changes...">
						<i class="fa fa-refresh"></i>
					</li>
					{{/pending}}
					{{#error}}
					<li class="icon" title="Change may not have been saved">
						<i class="fa fa-exclamation-triangle"></i>
					</li>
					{{/error}}
				</ul>
			</div>
		</div>
	</li>
</script>
