<script id="template-thumbnail" type="text/template">
	<li{{#id}} data-id="{{id}}"{{/id}}>
		<div class="container">
			{{#id}}
			<a href="{{link}}">
				<img src="{{path}}" width="100%" height="100%">
				<div class="selection"></div>
			</a>
			{{/id}}
			<div class="bar-wrap">
				<ul class="bar">
					<li class="title">
						<i class="fa fa-picture-o"></i> {{{title}}} ({{id}})
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
