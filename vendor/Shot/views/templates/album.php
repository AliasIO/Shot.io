<script id="template-album" type="text/template">
	<li{{#if id}} data-id="{{id}}"{{/if}}>
		<div class="container">
			{{#if id}}
			<a href="{{link}}">
				{{#if path}}
				<img src="{{path}}" width="100%" height="100%">
				{{else}}
				<div class="placeholder-thumbnail">
					<div class="valign"></div>
					<i class="fa fa-picture-o fa-5x"></i>
				</div>
				{{/if}}
				<div class="selection"></div>
			{{else}}
			<div class="placeholder-thumbnail">
				<div class="valign"></div>
				<i class="fa fa-picture-o fa-5x"></i>
			{{/if}}
				<div class="bar-wrap">
					<ul class="bar">
						<li class="title">
							{{#if system}}
							<i class="fa fa-lock"></i>
							<strong>Admin:</strong>
							{{else}}
							<i class="fa fa-folder"></i>
							{{/if}}
							{{{title}}} ({{image_count}})
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
			{{#if id}}
			</a>
			{{else}}
			</div>
			{{/if}}
		</div>
	</li>
</script>
