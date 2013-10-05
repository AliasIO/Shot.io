<!DOCTYPE html>

<html>
	<head>
		<meta charset="utf-8">

		<title><?= $this->htmlEncode($this->app->getConfig('siteName')) . ' - ' . $this->pageTitle ?></title>

		<meta http-equiv="X-UA-Compatible" content="IE=Edge">

		<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">

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
					<h1><a href="<?= $this->app->getRootPath() ?>"><i class="icon-camera"></i>&nbsp;<?= $this->htmlEncode($this->app->getConfig('siteName')) ?></a></h1>
				</li>
				<li class="toggle-topbar menu-icon"><a href="#"><span></span></a></li>
			</ul>

			<section class="top-bar-section">
				<ul class="left breadcrumbs">
					<li class="divider"></li>
					<?php if ( $this->breadcrumbs ): ?>
					<?php foreach ( $this->breadcrumbs as $breadcrumb ): ?>
					<li>
						<a href="<?= $this->app->getRootPath() . $breadcrumb->path ?>">
							<?php if ( $breadcrumb->icon ): ?><i class="icon-<?= $breadcrumb->icon ?>"></i><?php endif ?>&nbsp;<?= $breadcrumb->title ?>
						</a>
					</li>
					<li class="divider"></li>
					<?php endforeach ?>
					<?php endif ?>
				</ul>
			</section>

			<section class="top-bar-section">
				<ul class="right">
					<li class="divider"></li>
					<li><a href="<?= $this->app->getRootPath() ?>admin"><i class="icon-cog"></i>&nbsp;Admin</a></li>
				</ul>
			</section>
		</nav>
