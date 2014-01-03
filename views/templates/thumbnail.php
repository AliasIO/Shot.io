<script id="template-thumbnail" type="text/template">
	<li{{#if id}} data-id="{{id}}"{{/if}}>
		<div class="container">
			{{#if id}}
			<a href="{{link}}">
				<img src="{{path}}" width="100%" height="100%">
				<div class="selection"></div>
			</a>
			{{/if}}
			<div class="bar-wrap">
				<ul class="bar">
					<li class="title">
						<i class="fa fa-picture-o"></i> {{{title}}}
					</li>
					{{#if pending}}
					<li class="icon" title="Processing changes...">
						<i class="fa fa-refresh"></i>
					</li>
					{{/if}}
					{{#if error}}
					<li class="icon" title="Change may not have been saved">
						<i class="fa fa-exclamation-triangle"></i>
					</li>
					{{/if}}
					{{#if draggable}}
					<li class="icon drag-handle" title="Drag to re-order">
						<i class="fa fa-move"></i>
					</li>
					{{/if}}
				</ul>
			</div>
		</div>
	</li>
</script>
