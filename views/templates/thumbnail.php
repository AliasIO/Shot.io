<script id="template-thumbnail" type="text/template">
	<li{{#id}} data-id="{{id}}"{{/id}}>
		<div class="container">
			{{#id}}
			<a href="{{link}}">
				<img src="{{path}}">
				<div class="selection"></div>
			</a>
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
