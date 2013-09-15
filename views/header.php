<!DOCTYPE html>

<html>
	<head>
		<meta charset="utf-8">

		<title><?= $this->htmlEncode($this->app->getConfig('siteName')) . ' - ' . $this->pageTitle ?></title>

		<link type="text/css" rel="stylesheet" href="<?= $this->app->getRootPath() ?>css/shot.css">

		<script>
			var SHOT = {
				rootPath: '<?= $this->app->getRootPath() ?>',
				controller: '<?= $this->app->getControllerName() ?>',
				action: '<?= $this->app->getAction() ?>'
			};
		</script>
	</head>
	<body>
		<nav class="top-bar">
			<ul class="title-area">
				<li class="name">
					<h1><a href="#"><?= $this->htmlEncode($this->app->getConfig('siteName')) ?></a></h1>
				</li>
				<li class="toggle-topbar menu-icon"><a href="#"><span></span></a></li>
			</ul>

			<!--
			<section class="top-bar-section">
				<ul class="right">
					<li class="divider"></li>
					<li class="active"><a href="#">Main Item 1</a></li>
					<li class="divider"></li>
					<li><a href="#">Main Item 2</a></li>
				</ul>
			</section>
			-->
		</nav>
