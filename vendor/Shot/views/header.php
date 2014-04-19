<!DOCTYPE html>

<html>
	<head>
		<meta charset="utf-8">

		<title><?= ( $this->controller == 'Index' ? '' : $this->pageTitle . ' - ' ) . $this->siteName ?></title>

		<meta http-equiv="X-UA-Compatible" content="IE=Edge">

		<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">

		<link type="text/css" rel="stylesheet" href="<?= $this->getRootPath() ?>css/shot.css">

		<script>
			var SHOT = {
				siteName: '<?= $this->siteName ?>',
				rootPath: '<?= $this->getRootPath() ?>',
				controller: '<?= $this->controller ?>',
				action: '<?= $this->action ?>'
			};
		</script>
	</head>
	<body>
		<nav class="top-bar" data-topbar>
			<ul class="title-area">
				<li class="name">
					<h1><a href="<?= $this->getRootPath() ?>"><i class="fa fa-camera"></i> <?= $this->siteName ?></a></h1>
				</li>
				<li class="toggle-topbar menu-icon"><a href="#"><span></span></a></li>
			</ul>

			<section class="top-bar-section">
				<ul class="left breadcrumbs">
					<li class="divider"></li>
					<?php if ( $this->breadcrumbs ): ?>
					<?php foreach ( $this->breadcrumbs as $breadcrumb ): ?>
					<li>
						<a href="<?= $this->getRootPath() . $breadcrumb->path ?>">
							<?php if ( $breadcrumb->icon ): ?><i class="fa fa-<?= $breadcrumb->icon ?>"></i><?php endif ?> <?= $breadcrumb->title ?>
						</a>
					</li>
					<li class="divider"></li>
					<?php endforeach ?>
					<?php endif ?>
				</ul>
			</section>

			<section class="top-bar-section">
				<ul class="right"></ul>
			</section>
		</nav>
