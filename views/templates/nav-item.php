<script id="template-nav-item" type="text/template">
	{{#if right}}
	<li class="divider"></li>
	{{/if}}
	<li>
		<a href="{{url}}{{^url}}javascript: void(0);{{/url}}">
			{{#if icon}}
			<i class="fa fa-{{icon}}"></i>
			{{/if}}
			<span class="text">{{{text}}}</span>
		</a>
	</li>
	{{#if left}}
	<li class="divider"></li>
	{{/if}}
</script>
