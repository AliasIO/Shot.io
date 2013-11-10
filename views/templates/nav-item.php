<script id="template-nav-item" type="text/template">
	{{#right}}
	<li class="divider"></li>
	{{/right}}
	<li>
		<a href="{{url}}{{^url}}javascript: void(0);{{/url}}">
			{{#icon}}
			<i class="fa fa-{{icon}}"></i>
			{{/icon}}
			{{{text}}}
		</a>
	</li>
	{{#left}}
	<li class="divider"></li>
	{{/left}}
</script>
