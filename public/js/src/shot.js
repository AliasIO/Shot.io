var Shot;
(function (Shot) {
    (function (Models) {
        var Editable = (function () {
            function Editable() {
                this.selected = false;
            }
            Editable.prototype.render = function () {
                var _this = this;
                var offset = { x: null, y: null };

                this.el.on('click', function (e) {
                    if (!$(e.target).closest('.drag-handle').length) {
                        var event = $.Event('click');

                        event.originalEvent = e;

                        $(_this).trigger(event);
                    }
                });

                return this;
            };

            Editable.prototype.select = function (selected) {
                this.selected = selected;

                this.el.toggleClass('selected', selected);

                return this;
            };

            Editable.prototype.isSelected = function () {
                return this.selected;
            };
            return Editable;
        })();
        Models.Editable = Editable;
    })(Shot.Models || (Shot.Models = {}));
    var Models = Shot.Models;
})(Shot || (Shot = {}));
$(function () {
    SHOT.app = new Shot.App();
});

var Shot;
(function (Shot) {
    var App = (function () {
        function App() {
            $(document).foundation();

            $(document).on('dragstart', 'img, a', function (e) {
                e.preventDefault();
            });

            $(document).on('touchstart', '.top-bar .toggle-topbar a', function (e) {
                e.preventDefault();

                $(e.target).trigger('click');
            });

            $(document).on('click', '.top-bar section a', function () {
                $('.top-bar').removeClass('expanded');
            });

            new Shot.Controllers[SHOT.controller]()[SHOT.action]();

            return this;
        }
        return App;
    })();
    Shot.App = App;
})(Shot || (Shot = {}));
var Shot;
(function (Shot) {
    (function (Controllers) {
        var Album = (function () {
            function Album() {
                this.preRender = function (thumbnail, callback) {
                    var reader = new FileReader(), thumbnailSize = 480;

                    callback = typeof callback === 'function' ? callback : function () {
                    };

                    reader.onload = function (e) {
                        var image = $('<img/>');

                        image.on('load', function (e) {
                            var canvas = $('<canvas/>').get(0), size = {
                                x: e.target.width < e.target.height ? thumbnailSize : e.target.width * thumbnailSize / e.target.height,
                                y: e.target.height < e.target.width ? thumbnailSize : e.target.height * thumbnailSize / e.target.width
                            };

                            canvas.width = thumbnailSize;
                            canvas.height = thumbnailSize;

                            canvas.getContext('2d').drawImage(e.target, (canvas.width - size.x) / 2, (canvas.height - size.y) / 2, size.x, size.y);

                            $(canvas).hide().fadeIn('fast').addClass('temporary').prependTo(thumbnail.el.find('.container'));

                            callback();
                        });

                        image.on('error', function () {
                            return callback();
                        });

                        image.prop('src', e.target.result);
                    };

                    reader.onerror = function () {
                        return callback();
                    };

                    reader.readAsDataURL(thumbnail.data.file);
                };
            }
            Album.prototype.grid = function () {
                var helpers = new Shot.Helpers(), thumbnailGrid = $('.thumbnail-grid'), thumbnails = [], album = new Shot.Models.Album(SHOT.album), navItems = {
                    album: null,
                    editAlbum: null,
                    editThumbnails: null,
                    upload: null
                }, editThumbnails, multiEdit = new Shot.MultiEdit(), dragDrop = new Shot.DragDrop(), preRender = this.preRender;

                editThumbnails = new Shot.Models.Dock('#template-dock-thumbnails').render();

                helpers.initDock(editThumbnails);

                $(editThumbnails).on('activate', function (e) {
                    multiEdit.toggle(true);
                }).on('deactivate', function (e) {
                    multiEdit.toggle(false);
                });

                editThumbnails.el.on('click', '.select-all', function (e) {
                    e.preventDefault();

                    $(e.target).blur();

                    multiEdit.selectAll(true);
                }).on('click', '.select-none', function (e) {
                    e.preventDefault();

                    $(e.target).blur();

                    multiEdit.selectAll(false);
                }).on('click', '.close', function (e) {
                    e.preventDefault();

                    $(e.target).blur();

                    editThumbnails.toggle(false);
                }).on('click', '.edit', function (e) {
                    var modal = new Shot.Models.Modal('#template-modals-thumbnails-edit-selection').render(), selection = multiEdit.getSelection();

                    modal.el.on('submit', 'form', function (e) {
                        var ids = [], selection = multiEdit.getSelection(), title = modal.el.find(':input[name="title"]').val(), thumbCrop = modal.el.find(':input[name="thumb-crop"]:checked').val();

                        e.preventDefault();

                        selection.forEach(function (thumbnail) {
                            ids.push(thumbnail.data.id);

                            thumbnail.data.pending = true;
                            thumbnail.data.error = false;

                            if (title) {
                                thumbnail.data.title = title;
                            }

                            thumbnail.render();
                        });

                        $.post(SHOT.rootPath + 'ajax/saveImages', { ids: ids, title: title, thumbCrop: thumbCrop }).done(function () {
                            selection.forEach(function (thumbnail) {
                                thumbnail.data.pending = false;

                                if (thumbCrop) {
                                    thumbnail.data.path = thumbnail.data.path.replace(/\?.+$/, '?' + thumbCrop);
                                }

                                thumbnail.render();
                            });
                        }).fail(function () {
                            selection.forEach(function (thumbnail) {
                                thumbnail.data.pending = false;
                                thumbnail.data.error = true;

                                thumbnail.render();
                            });
                        });

                        modal.close();
                    });

                    helpers.showModal(modal);

                    e.preventDefault();

                    $(e.target).blur();
                }).on('click', '.albums', function (e) {
                    var modal, albums = [], selection = multiEdit.getSelection();

                    SHOT.albums.forEach(function (album) {
                        if (album.id !== SHOT.album.id) {
                            albums.push(album);
                        }
                    });

                    modal = new Shot.Models.Modal('#template-modals-thumbnails-albums', { albums: albums, album: SHOT.album }).render();

                    modal.el.on('submit', 'form', function (e) {
                        var ids = [], selection = multiEdit.getSelection(), add = [], remove = modal.el.find(':input[name="remove"]').is(':checked') ? album.data.id : null, removeOther = modal.el.find(':input[name="remove_other"]').is(':checked') ? album.data.id : null;

                        e.preventDefault();

                        selection.forEach(function (thumbnail) {
                            ids.push(thumbnail.data.id);

                            if (remove) {
                                thumbnail.el.remove();

                                helpers.arrayPull(thumbnails, thumbnail);

                                multiEdit.pull(thumbnail);
                                dragDrop.pull(thumbnail);
                            } else {
                                thumbnail.data.pending = true;
                                thumbnail.data.error = false;

                                thumbnail.render();
                            }
                        });

                        SHOT.albums.forEach(function (album) {
                            if (modal.el.find(':input[name="album\\[' + album.id + '\\]"]').is(':checked')) {
                                add.push(album.id);
                            }
                        });

                        $.post(SHOT.rootPath + 'ajax/saveImages', {
                            ids: ids,
                            albums: {
                                add: add,
                                remove: remove,
                                removeOther: removeOther
                            }
                        }).done(function () {
                            selection.forEach(function (thumbnail) {
                                thumbnail.data.pending = false;

                                thumbnail.render();
                            });
                        }).fail(function () {
                            selection.forEach(function (thumbnail) {
                                thumbnail.data.pending = false;
                                thumbnail.data.error = true;

                                thumbnail.render();
                            });
                        });

                        modal.close();
                    });

                    helpers.showModal(modal);

                    e.preventDefault();

                    $(e.target).blur();
                }).on('click', '.delete', function (e) {
                    var modal = new Shot.Models.Modal('#template-modals-thumbnails-delete-selection').render(), selection = multiEdit.getSelection();

                    e.preventDefault();

                    $(e.target).blur();

                    modal.el.on('submit', 'form', function (e) {
                        var ids = [], selection = multiEdit.getSelection();

                        e.preventDefault();

                        selection.forEach(function (thumbnail) {
                            ids.push(thumbnail.data.id);

                            thumbnail.el.remove();
                        });

                        $.post(SHOT.rootPath + 'ajax/deleteImages', { ids: ids });

                        modal.close();
                    }).on('click', '.cancel', function (e) {
                        modal.close();
                    });

                    helpers.showModal(modal);
                }).appendTo('body');

                $(multiEdit).on('change', function () {
                    var selectedCount = multiEdit.getSelection().length;

                    editThumbnails.el.find('.select-none, .edit, .albums, .delete').attr('disabled', !selectedCount);

                    editThumbnails.el.find('.select-all').attr('disabled', selectedCount === thumbnails.length);
                }).on('activate', function () {
                    thumbnails.forEach(function (thumbnail) {
                        thumbnail.data.draggable = true;

                        thumbnail.render();
                    });
                }).on('deactivate', function () {
                    thumbnails.forEach(function (thumbnail) {
                        thumbnail.data.draggable = false;

                        thumbnail.render();
                    });

                    multiEdit.selectAll(false);
                });

                $(dragDrop).on('change', function () {
                    var items = {};

                    thumbnailGrid.find('> li').each(function (i, el) {
                        items[$(el).data('id')] = i;
                    });

                    $.post(SHOT.rootPath + 'ajax/saveImagesOrder', { albumId: album.data.id, items: items });
                });

                navItems.album = $(Handlebars.compile($('#template-nav-item').html())({
                    text: album.data.title,
                    icon: 'folder',
                    left: true,
                    path: SHOT.rootPath + 'album/grid/' + album.data.id
                }));

                navItems.album.appendTo('.top-bar .left');

                navItems.upload = $(Handlebars.compile($('#template-nav-item').html())({
                    text: 'Add images',
                    icon: 'plus-circle',
                    right: true
                }));

                navItems.upload.on('click', function (e) {
                    var modal = new Shot.Models.Modal('#template-modals-thumbnails-upload').render();

                    multiEdit.toggle(false);

                    modal.el.on('change', ':input[type="file"]', function (e) {
                        var thumbnailSize = 480, thumbnailQueue = [], fileTypes = [
                            'image/jpg',
                            'image/jpeg',
                            'image/png',
                            'image/gif',
                            'image/bmp'
                        ];

                        e.preventDefault();

                        $.each(e.target.files, function (i, file) {
                            var thumbnail, progressBar;

                            if (file.name && $.inArray(file.type, fileTypes) !== -1) {
                                thumbnail = new Shot.Models.Thumbnail({ title: file.name.replace(/\..{1,4}$/, ''), file: file, formData: new FormData() }).render();
                                progressBar = new Shot.Models.ProgressBar().render();

                                thumbnail.data.formData.append('image', file);
                                thumbnail.data.formData.append('albumId', album.data.id);

                                thumbnailGrid.append(thumbnail.el);

                                $(thumbnail).on('delete', function () {
                                    thumbnail.el.remove();

                                    thumbnail = null;
                                });

                                thumbnail.save().done(function (data) {
                                    progressBar.set(100, function () {
                                        var image = $('<img/>');

                                        image.hide().on('load', function (e) {
                                            thumbnail.el.find('.temporary').fadeOut('fast', function () {
                                                $(this).remove();
                                            });

                                            thumbnail.el.find('.processing').fadeOut('fast');

                                            $(e.target).fadeIn('fast', function () {
                                                thumbnail.data.link = SHOT.rootPath + 'album/carousel/' + album.data.id + '/' + data.id;
                                                thumbnail.data.pending = false;

                                                thumbnail.render();
                                            });
                                        }).prependTo(thumbnail.el.find('.container')).prop('src', data.path);
                                    });
                                }).progress(function (data) {
                                    progressBar.set(data);
                                }).fail(function (e) {
                                    thumbnail.data.pending = false;
                                    thumbnail.data.error = true;

                                    thumbnail.render();

                                    progressBar.set(0);
                                });

                                thumbnail.el.find('.container').append(progressBar.el);

                                thumbnailQueue.push(thumbnail);

                                thumbnails.push(thumbnail);
                                multiEdit.push(thumbnail);
                                dragDrop.push(thumbnail);
                            }
                        });

                        $('html, body').animate({
                            scrollTop: thumbnails[thumbnails.length - 1].el.offset().top
                        }, 1000);

                        (function nextThumbnail() {
                            if (thumbnailQueue.length) {
                                preRender(thumbnailQueue.shift(), function () {
                                    return nextThumbnail();
                                });
                            }
                        })();

                        modal.close();
                    });

                    helpers.showModal(modal);

                    e.preventDefault();
                }).appendTo('.top-bar .right');

                navItems.editThumbnails = $(Handlebars.compile($('#template-nav-item').html())({
                    text: 'Edit images',
                    icon: 'pencil',
                    right: true
                }));

                navItems.editThumbnails.on('click', function (e) {
                    e.preventDefault();

                    editThumbnails.toggle();
                }).appendTo('.top-bar .right');

                navItems.editAlbum = $(Handlebars.compile($('#template-nav-item').html())({
                    text: 'Edit album',
                    icon: 'pencil',
                    right: true
                }));

                navItems.editAlbum.on('click', function (e) {
                    var modal = new Shot.Models.Modal('#template-modals-albums-edit').render();

                    e.preventDefault();

                    modal.el.on('submit', 'form', function (e) {
                        var title = modal.el.find(':input[name="title"]').val();

                        e.preventDefault();

                        if (title) {
                            album.data.title = title;

                            navItems.album.find('.text').text(title);

                            document.title = title;

                            album.save();
                        }

                        modal.close();
                    });

                    helpers.showModal(modal);
                }).appendTo('.top-bar .right');

                if (SHOT.thumbnails) {
                    SHOT.thumbnails.forEach(function (thumbnailData) {
                        var thumbnail = new Shot.Models.Thumbnail(thumbnailData);

                        thumbnail.data.link = SHOT.rootPath + 'album/carousel/' + album.data.id + '/' + thumbnail.data.id;

                        thumbnailGrid.append(thumbnail.render().el);

                        thumbnails.push(thumbnail);
                        multiEdit.push(thumbnail);
                        dragDrop.push(thumbnail);
                    });
                }
            };

            Album.prototype.carousel = function () {
                var helpers = new Shot.Helpers(), carousel = new Shot.Models.Carousel(SHOT.images), album = new Shot.Models.Album(SHOT.album), id, navItems = {
                    album: null,
                    thumbnail: null,
                    exif: null
                };

                $(document).foundation('interchange', {
                    named_queries: {
                        '1600': 'only screen and (min-width: 1024px)',
                        '2048': 'only screen and (min-width: 1600px)',
                        'original': 'only screen and (min-width: 2048px)'
                    }
                });

                carousel.render();

                id = parseInt(location.pathname.replace(/^\/album\/carousel\/\d\/(\d)/, function (match, a) {
                    return a;
                }));

                navItems.album = $(Handlebars.compile($('#template-nav-item').html())({
                    text: album.data.title.replace(/&amp;/g, '&'),
                    icon: 'folder',
                    url: SHOT.rootPath + 'album/grid/' + album.data.id,
                    left: true
                }));

                navItems.album.appendTo('.top-bar .left');

                navItems.exif = $(Handlebars.compile($('#template-nav-item').html())({
                    text: 'Exif',
                    icon: 'info-circle',
                    right: true
                }));

                navItems.exif.appendTo('.top-bar .right');

                navItems.exif.on('click', function (e) {
                    var modal = new Shot.Models.Modal('#template-modals-images-exif', { exif: carousel.getCurrent().data.exif }).render();

                    helpers.showModal(modal);

                    e.preventDefault();
                }).appendTo('.top-bar .right');

                carousel.el.on('change', function (e, image) {
                    if (navItems.thumbnail) {
                        navItems.thumbnail.remove();
                    }

                    navItems.thumbnail = $(Handlebars.compile($('#template-nav-item').html())({
                        text: image.data.title.replace(/&amp;/g, '&'),
                        icon: 'picture-o',
                        url: SHOT.rootPath + 'album/carousel/' + album.data.id + '/' + image.data.id,
                        left: true
                    }));

                    navItems.thumbnail.appendTo('.top-bar .left');

                    if (image.data.id !== id) {
                        id = image.data.id;

                        history.pushState({ id: id }, '', '/album/carousel/' + album.data.id + '/' + id);
                    }

                    $(document).foundation('interchange', 'reflow');
                });

                $('#carousel-wrap').append(carousel.el);

                if (id) {
                    carousel.show(id);
                }

                $(window).on('popstate', function (e) {
                    if (e.originalEvent.state) {
                        carousel.show(e.originalEvent.state.id);
                    }
                });

                $(document).on('keydown', function (e) {
                    switch (e.keyCode) {
                        case 35:
                            e.preventDefault();

                            if (carousel.index < carousel.images.length - 1) {
                                carousel.show(carousel.images[carousel.images.length - 1].data.id);
                            }

                            break;
                        case 36:
                            e.preventDefault();

                            if (carousel.index > 0) {
                                carousel.show(carousel.images[0].data.id);
                            }

                            break;
                        case 33:
                        case 37:
                        case 38:
                            e.preventDefault();

                            if (carousel.index > 0) {
                                carousel.show(carousel.images[carousel.index - 1].data.id);
                            }

                            break;
                        case 32:
                        case 34:
                        case 39:
                        case 40:
                            e.preventDefault();

                            if (carousel.index < carousel.images.length - 1) {
                                carousel.show(carousel.images[carousel.index + 1].data.id);
                            }

                            break;
                    }
                });

                $(window).trigger('resize');
            };
            return Album;
        })();
        Controllers.Album = Album;
    })(Shot.Controllers || (Shot.Controllers = {}));
    var Controllers = Shot.Controllers;
})(Shot || (Shot = {}));
var Shot;
(function (Shot) {
    (function (Controllers) {
        var Index = (function () {
            function Index() {
            }
            Index.prototype.index = function () {
                var helpers = new Shot.Helpers(), thumbnailGrid = $('.thumbnail-grid'), albums = [], navItems = { createAlbum: null, editAlbums: null }, editAlbums, multiEdit = new Shot.MultiEdit(), dragDrop = new Shot.DragDrop();

                editAlbums = new Shot.Models.Dock('#template-dock-albums').render();

                helpers.initDock(editAlbums);

                $(editAlbums).on('activate', function (e) {
                    multiEdit.toggle(true);
                }).on('deactivate', function (e) {
                    multiEdit.toggle(false);
                });

                editAlbums.el.on('click', '.select-all', function (e) {
                    e.preventDefault();

                    $(e.target).blur();

                    multiEdit.selectAll(true);
                }).on('click', '.select-none', function (e) {
                    e.preventDefault();

                    $(e.target).blur();

                    multiEdit.selectAll(false);
                }).on('click', '.close', function (e) {
                    e.preventDefault();

                    $(e.target).blur();

                    editAlbums.toggle(false);
                }).on('click', '.edit', function (e) {
                    var modal = new Shot.Models.Modal('#template-modals-albums-edit-selection').render(), selection = multiEdit.getSelection();

                    modal.el.on('submit', 'form', function (e) {
                        var ids = [], selection = multiEdit.getSelection(), title = modal.el.find(':input[name="title"]').val();

                        e.preventDefault();

                        selection.forEach(function (album) {
                            ids.push(album.data.id);

                            album.data.pending = true;
                            album.data.error = false;

                            if (title) {
                                album.data.title = title;
                            }

                            album.render();
                        });

                        $.post(SHOT.rootPath + 'ajax/saveAlbums', { ids: ids, title: title }).done(function () {
                            selection.forEach(function (album) {
                                album.data.pending = false;

                                album.render();
                            });
                        }).fail(function () {
                            selection.forEach(function (album) {
                                album.data.pending = false;
                                album.data.error = true;

                                album.render();
                            });
                        });

                        modal.close();
                    });

                    helpers.showModal(modal);

                    e.preventDefault();

                    $(e.target).blur();
                }).on('click', '.delete', function (e) {
                    var modal = new Shot.Models.Modal('#template-modals-albums-delete-selection').render(), selection = multiEdit.getSelection();

                    e.preventDefault();

                    $(e.target).blur();

                    modal.el.on('submit', 'form', function (e) {
                        var ids = [], selection = multiEdit.getSelection();

                        e.preventDefault();

                        selection.forEach(function (album) {
                            ids.push(album.data.id);

                            album.el.remove();
                        });

                        $.post(SHOT.rootPath + 'ajax/deleteAlbums', { ids: ids });

                        modal.close();
                    });

                    helpers.showModal(modal);
                }).appendTo('body');

                $(multiEdit).on('change', function () {
                    var selectedCount = multiEdit.getSelection().length;

                    editAlbums.el.find('.select-none, .edit, .delete').attr('disabled', !selectedCount);

                    editAlbums.el.find('.select-all').attr('disabled', selectedCount === albums.length);
                }).on('activate', function () {
                    albums.forEach(function (album) {
                        album.data.draggable = true;

                        album.render();
                    });
                }).on('deactivate', function () {
                    albums.forEach(function (album) {
                        album.data.draggable = false;

                        album.render();
                    });

                    multiEdit.selectAll(false);
                });

                $(dragDrop).on('change', function () {
                    var items = {};

                    thumbnailGrid.find('> li').each(function (i, el) {
                        items[$(el).data('id')] = i;
                    });

                    $.post(SHOT.rootPath + 'ajax/saveAlbumsOrder', { items: items });
                });

                navItems.createAlbum = $(Handlebars.compile($('#template-nav-item').html())({
                    text: 'Add album',
                    icon: 'plus-circle',
                    right: true
                }));

                navItems.createAlbum.on('click', function (e) {
                    var modal = new Shot.Models.Modal('#template-modals-albums-create').render();

                    multiEdit.toggle(false);

                    e.preventDefault();

                    $(e.target).blur();

                    modal.el.on('submit', 'form', function (e) {
                        var title = modal.el.find(':input[name="title"]').val(), album;

                        if (title) {
                            album = new Shot.Models.Album({ title: title });

                            album.save().done(function () {
                                album.data.link = SHOT.rootPath + 'album/grid/' + album.data.id;
                                album.data.pending = false;

                                album.render();
                            }).fail(function () {
                                album.data.pending = false;
                                album.data.error = true;

                                album.render();
                            });

                            thumbnailGrid.append(album.render().el);

                            albums.push(album);
                            multiEdit.push(album);
                            dragDrop.push(album);

                            $('html, body').animate({
                                scrollTop: album.el.offset().top
                            }, 1000);
                        }

                        modal.close();
                    });

                    helpers.showModal(modal);
                }).appendTo('.top-bar .right');

                navItems.editAlbums = $(Handlebars.compile($('#template-nav-item').html())({
                    text: 'Edit albums',
                    icon: 'pencil',
                    right: true
                }));

                navItems.editAlbums.on('click', function (e) {
                    e.preventDefault();

                    editAlbums.toggle();
                }).appendTo('.top-bar .right');

                if (SHOT.albums) {
                    SHOT.albums.forEach(function (albumData) {
                        var album = new Shot.Models.Album(albumData);

                        album.data.link = SHOT.rootPath + 'album/grid/' + album.data.id;

                        thumbnailGrid.append(album.render().el);

                        albums.push(album);
                        multiEdit.push(album);
                        dragDrop.push(album);
                    });
                }
            };
            return Index;
        })();
        Controllers.Index = Index;
    })(Shot.Controllers || (Shot.Controllers = {}));
    var Controllers = Shot.Controllers;
})(Shot || (Shot = {}));
var Shot;
(function (Shot) {
    var DragDrop = (function () {
        function DragDrop() {
            var _this = this;
            this.editables = [];
            this.positions = [];
            var offset = { x: 0, y: 0 }, draggable = null, lastHover = null, placeholder = $('<li class="drop-target"><div class="container"><div/></li>');

            $(document).swipe().on('swipeStart', function (e) {
                if ($(e.originalEvent.target).closest('.thumbnail-grid').length) {
                    e.originalEvent.originalEvent.preventDefault();

                    _this.editables.forEach(function (editable) {
                        if (editable.el.find('.icon.drag-handle').has(e.originalEvent.target).length > 0) {
                            draggable = editable;

                            draggable.el.addClass('draggable');

                            offset.x = draggable.el.position().left;
                            offset.y = draggable.el.position().top;

                            draggable.el.before(placeholder);

                            draggable.el.appendTo(draggable.el.parent()).css({
                                height: placeholder.outerHeight(),
                                left: offset.x + e.swipe.x,
                                top: offset.y + e.swipe.y,
                                position: 'absolute',
                                width: placeholder.outerWidth(),
                                zIndex: 999
                            });

                            _this.getPositions(draggable);
                        }
                    });
                }
            }).on('swipeMove', function (e) {
                if (draggable) {
                    setTimeout(function () {
                        var mouse = { x: null, y: null };

                        if (e.originalEvent.originalEvent.changedTouches !== undefined) {
                            mouse.x = e.originalEvent.originalEvent.changedTouches[0].clientX, mouse.y = e.originalEvent.originalEvent.changedTouches[0].clientY + $(window).scrollTop();
                        } else {
                            mouse.x = e.originalEvent.clientX, mouse.y = e.originalEvent.clientY + $(window).scrollTop();
                        }

                        draggable.el.css({
                            left: offset.x - e.swipe.x,
                            top: offset.y + e.swipe.y
                        });

                        _this.positions.forEach(function (obj) {
                            if (mouse.x > obj.x && mouse.x < obj.x + obj.width && mouse.y > obj.y && mouse.y < obj.y + obj.height) {
                                if (obj.editable === lastHover) {
                                    return;
                                }

                                if (placeholder.index() > obj.editable.el.index()) {
                                    obj.editable.el.before(placeholder);
                                } else {
                                    obj.editable.el.after(placeholder);
                                }

                                _this.getPositions(draggable);

                                lastHover = obj.editable;

                                return;
                            }

                            lastHover = null;
                        });
                    }, 0);
                }
            }).on('swipeEnd', function (e) {
                if (draggable) {
                    draggable.el.animate({
                        left: placeholder.position().left,
                        top: placeholder.position().top
                    }, 'fast', 'easeOutBack', function () {
                        draggable.el.removeClass('draggable').removeAttr('style');

                        placeholder.replaceWith(draggable.el);

                        placeholder.remove();

                        draggable = null;

                        $(_this).trigger('change');
                    });
                }
            });
        }
        DragDrop.prototype.push = function (editable) {
            this.editables.push(editable);

            return this;
        };

        DragDrop.prototype.pull = function (editable) {
            new Shot.Helpers().arrayPull(this.editables, editable);

            return this;
        };

        DragDrop.prototype.getPositions = function (draggable) {
            var _this = this;
            this.positions = [];

            this.editables.forEach(function (editable) {
                if (editable === draggable) {
                    return;
                }

                _this.positions.push({
                    editable: editable,
                    x: editable.el.offset().left,
                    y: editable.el.offset().top,
                    width: editable.el.width(),
                    height: editable.el.height()
                });
            });
        };
        return DragDrop;
    })();
    Shot.DragDrop = DragDrop;
})(Shot || (Shot = {}));
var Shot;
(function (Shot) {
    var Helpers = (function () {
        function Helpers() {
            this.arrayPull = function (arr, item) {
                var i = 0;

                for (; i < arr.length; i++) {
                    while (arr[i] === item) {
                        arr.splice(i, 1)[0];
                    }
                }
            };
        }
        Helpers.prototype.showModal = function (modal) {
            modal.el.on('click', function (e) {
                if (!$(e.target).closest('.modal-content').length) {
                    modal.close();
                }
            }).on('click', '.cancel', function (e) {
                modal.el.remove();
            }).appendTo('body').show().find('.modal-content').css({ marginTop: $(document).scrollTop() + 'px' });
        };

        Helpers.prototype.initDock = function (dock) {
            $(dock).on('activate', function (e) {
                dock.el.stop().css({ bottom: -20, opacity: 0 }).show().animate({ bottom: 0, opacity: 1 });

                $(document).on('keydown.' + dock.id, function (e) {
                    switch (e.keyCode) {
                        case 27:
                            e.preventDefault();

                            dock.toggle(false);

                            break;
                    }
                });
            }).on('deactivate', function (e) {
                dock.el.stop().animate({ bottom: -20, opacity: 0 }, 'fast');

                $(document).off('keydown.' + dock.id);
            });
        };
        return Helpers;
    })();
    Shot.Helpers = Helpers;
})(Shot || (Shot = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Shot;
(function (Shot) {
    (function (Models) {
        var Album = (function (_super) {
            __extends(Album, _super);
            function Album(data) {
                _super.call(this);
                this.data = data;
                this.save = function () {
                    var _this = this;
                    var deferred = $.Deferred();

                    this.data.pending = true;
                    this.data.error = false;

                    this.render();

                    $.post(SHOT.rootPath + 'ajax/saveAlbum', {
                        id: this.data.id,
                        title: this.data.title
                    }).done(function (data) {
                        _this.data.id = data.id;
                        _this.data.pending = false;
                        _this.data.error = false;

                        deferred.resolve(data);
                    }).fail(function (e) {
                        _this.data.pending = false;
                        _this.data.error = true;

                        deferred.reject(e);
                    });

                    return deferred;
                };

                if (!this.data.id) {
                    this.data.pending = true;
                }

                this.template = $('#template-album').html();
            }
            Album.prototype.render = function () {
                var el = $(Handlebars.compile(this.template)(this.data));

                if (this.el) {
                    this.el.replaceWith(el);
                }

                this.el = el;

                _super.prototype.render.call(this);

                this.select(this.isSelected());

                return this;
            };
            return Album;
        })(Models.Editable);
        Models.Album = Album;
    })(Shot.Models || (Shot.Models = {}));
    var Models = Shot.Models;
})(Shot || (Shot = {}));
var Shot;
(function (Shot) {
    (function (Models) {
        var Carousel = (function () {
            function Carousel(imagesData) {
                var _this = this;
                this.index = 0;
                this.images = [];
                this.animating = false;
                this.offset = 0;
                this.template = $('#template-carousel').html();

                imagesData.forEach(function (data) {
                    data.urls = data.paths;
                    data.link = SHOT.rootPath + 'album/' + SHOT.album.id + '/' + data.id;

                    _this.images.push(new Shot.Models.Image(data));
                });

                return this;
            }
            Carousel.prototype.render = function () {
                var _this = this;
                var el = $(Handlebars.compile(this.template)({})), destination, distance, duration, wrap;

                if (this.el) {
                    this.el.replaceWith(el);
                }

                this.el = el;

                wrap = this.el.find('.wrap');

                $(window).on('resize', function () {
                    _this.cutOff = $(window).width() / 2;
                }).trigger('resize');

                $(document).on('click', '.full-screen', function (e) {
                    ['c', 'mozC', 'webkitC', 'msC', 'oC'].forEach(function (prefix) {
                        var method = prefix + 'ancelFullScreen';

                        if (typeof document[method] === 'function') {
                            document[method]();
                        }
                    });
                });

                this.el.swipe().on('swipeStart', function (e) {
                    wrap.stop();

                    _this.offset = wrap.position().left;
                }).on('swipeMove', function (e) {
                    if (!_this.animating) {
                        _this.el.addClass('animating');

                        _this.animating = true;
                    }

                    wrap.css({ opacity: (_this.cutOff - Math.min(_this.cutOff, Math.abs(e.swipe.x))) / _this.cutOff, left: _this.offset - Math.min(_this.cutOff, Math.max(-_this.cutOff, e.swipe.x)) });
                }).on('swipeEnd', function (e) {
                    if (e.swipe.distance < 50 || e.swipe.speed < _this.cutOff || (e.swipe.direction === 'right' && _this.index === 0) || (e.swipe.direction === 'left' && _this.index === _this.images.length - 1)) {
                        wrap.stop().animate({ opacity: 1, left: '-100%' }, 'normal', 'easeOutQuad', function () {
                            _this.el.removeClass('animating');

                            _this.animating = false;
                        });
                    } else {
                        destination = _this.offset + (e.swipe.direction === 'right' ? _this.cutOff : -_this.cutOff);
                        distance = Math.abs(destination - wrap.position().left);
                        duration = distance / e.swipe.speed * 1000;

                        wrap.stop().animate({ opacity: 0, left: destination }, duration, 'easeOutQuad', function () {
                            wrap.stop().css({ left: '-100%' }).animate({ opacity: 1 }, duration / 2, 'easeInQuad');

                            _this.el.removeClass('animating');

                            _this.animating = false;

                            _this.show(e.swipe.direction === 'right' ? (_this.previous ? _this.previous.data.id : null) : (_this.next ? _this.next.data.id : null));
                        });
                    }
                });

                return this;
            };

            Carousel.prototype.show = function (id) {
                var _this = this;
                if (this.current && this.current.data.id === id) {
                    return;
                }

                this.images.forEach(function (image, i) {
                    if (image.data.id === id) {
                        _this.index = i;
                    }
                });

                this.previous = this.index > 0 ? this.images[this.index - 1] : null;
                this.current = this.images[this.index];
                this.next = this.images.length > this.index + 1 ? this.images[this.index + 1] : null;

                ['previous', 'current', 'next'].forEach(function (container) {
                    var el = _this.el.find('.' + container);

                    el.empty();

                    if (_this[container]) {
                        el.append(_this[container].render().el);

                        _this[container].el.on('click', function (e) {
                            e.preventDefault();

                            if (container === 'current') {
                                if (!_this.animating) {
                                    _this.fullScreen(_this[container]);
                                }
                            } else {
                                _this.show(_this[container].data.id);
                            }
                        });
                    }
                });

                this.el.trigger('change', this.current);

                return this;
            };

            Carousel.prototype.fullScreen = function (image) {
                var fullScreen = $('.full-screen').get(0), el = $(fullScreen).find('img'), img = $('<img>');

                el.prop('src', image.el.find('img').attr('src'));

                img.on('load', function () {
                    el.replaceWith(el);
                }).prop('src', SHOT.rootPath + image.data.paths.original);

                ['r', 'mozR', 'webkitR', 'msR', 'oR'].forEach(function (prefix) {
                    var method = prefix + 'equestFullScreen';

                    if (typeof fullScreen[method] === 'function') {
                        fullScreen[method]();

                        return false;
                    }
                });

                return this;
            };

            Carousel.prototype.getCurrent = function () {
                return this.current;
            };
            return Carousel;
        })();
        Models.Carousel = Carousel;
    })(Shot.Models || (Shot.Models = {}));
    var Models = Shot.Models;
})(Shot || (Shot = {}));
var Shot;
(function (Shot) {
    (function (Models) {
        var Dock = (function () {
            function Dock(selector, data) {
                this.data = data;
                this.id = new Date().getTime() + Math.round(Math.random() * 999);
                this.active = false;
                this.template = $(selector).html();

                this.data = data || {};
            }
            Dock.prototype.render = function () {
                this.el = $(Handlebars.compile(this.template)(this.data));

                return this;
            };

            Dock.prototype.toggle = function (active) {
                this.active = active === undefined ? !this.active : active;

                if (this.active) {
                    $(this).trigger('activate');
                } else {
                    $(this).trigger('deactivate');
                }

                $(this).trigger('change');

                return this;
            };
            return Dock;
        })();
        Models.Dock = Dock;
    })(Shot.Models || (Shot.Models = {}));
    var Models = Shot.Models;
})(Shot || (Shot = {}));
var Shot;
(function (Shot) {
    (function (Models) {
        var Image = (function () {
            function Image(data) {
                this.data = data;
                this.loaded = false;
                this.template = $('#template-image').html();

                return this;
            }
            Image.prototype.render = function () {
                var _this = this;
                var data = $.extend({}, this.data), id = new Date().getTime() + Math.round(Math.random() * 999), el, preview;

                if (this.loaded) {
                    el = $(Handlebars.compile(this.template)(data));

                    this.el.replaceWith(el);

                    this.el = el;
                } else {
                    data.url = this.data.paths.preview;

                    this.el = $(Handlebars.compile(this.template)(data));

                    preview = this.el.find('img');

                    $(window).on('resize.' + id, function () {
                        return _this.resize(preview);
                    });

                    preview.hide().on('load', function () {
                        $(window).trigger('resize.' + id);

                        preview.show();
                    });

                    el = $('<img/>');

                    el.prop('src', this.data.url).on('load', function (e) {
                        _this.loaded = true;

                        $(window).off('resize.' + id);

                        preview.replaceWith(el);
                    });
                }

                return this;
            };

            Image.prototype.resize = function (el) {
                var size = { x: this.data.width, y: this.data.height }, parentSize;

                if (!$.contains(document.documentElement, this.el.get(0))) {
                    return;
                }

                parentSize = {
                    x: this.el.parent().width(),
                    y: this.el.parent().height()
                };

                if (size.x > parentSize.x) {
                    size.y *= parentSize.x / size.x;
                    size.x = parentSize.x;
                }

                if (size.y > parentSize.y) {
                    size.x *= parentSize.y / size.y;
                    size.y = parentSize.y;
                }

                el.css({
                    position: 'absolute',
                    top: (parentSize.y / 2) - (size.y / 2),
                    height: size.y,
                    width: size.x
                });

                switch (this.el.css('textAlign')) {
                    case 'start':
                        el.css({ left: 0 });

                        break;
                    case 'center':
                        el.css({ left: (parentSize.x / 2) - (size.x / 2) });

                        break;
                    case 'right':
                        el.css({ right: 0 });

                        break;
                }

                return this;
            };
            return Image;
        })();
        Models.Image = Image;
    })(Shot.Models || (Shot.Models = {}));
    var Models = Shot.Models;
})(Shot || (Shot = {}));
var Shot;
(function (Shot) {
    (function (Models) {
        var Modal = (function () {
            function Modal(selector, data) {
                this.data = data;
                this.id = new Date().getTime() + Math.round(Math.random() * 999);
                this.template = $(selector).html();

                this.data = data || {};
            }
            Modal.prototype.render = function () {
                var _this = this;
                this.el = $(Handlebars.compile(this.template)(this.data));

                $(document).on('keydown.' + this.id, function (e) {
                    switch (e.keyCode) {
                        case 27:
                            e.preventDefault();

                            _this.close();

                            break;
                    }
                });

                return this;
            };

            Modal.prototype.close = function () {
                this.el.remove();

                $(document).off('keydown.' + this.id);
            };
            return Modal;
        })();
        Models.Modal = Modal;
    })(Shot.Models || (Shot.Models = {}));
    var Models = Shot.Models;
})(Shot || (Shot = {}));
var Shot;
(function (Shot) {
    (function (Models) {
        var ProgressBar = (function () {
            function ProgressBar() {
                this.template = $('#template-progressbar').html();
            }
            ProgressBar.prototype.render = function () {
                this.el = $(Handlebars.compile(this.template)({}));

                return this;
            };

            ProgressBar.prototype.set = function (percentage, callback) {
                var _this = this;
                this.el.find('.progressbar').stop(true, true).animate({ width: percentage + '%' }, 200, function () {
                    if (percentage === 100) {
                        _this.el.fadeOut('fast');
                    }

                    if (typeof callback === 'function') {
                        callback();
                    }
                });

                return this;
            };
            return ProgressBar;
        })();
        Models.ProgressBar = ProgressBar;
    })(Shot.Models || (Shot.Models = {}));
    var Models = Shot.Models;
})(Shot || (Shot = {}));
var Shot;
(function (Shot) {
    (function (Models) {
        var Thumbnail = (function (_super) {
            __extends(Thumbnail, _super);
            function Thumbnail(data) {
                _super.call(this);
                this.data = data;

                this.template = $('#template-thumbnail').html();
            }
            Thumbnail.prototype.render = function () {
                var el = $(Handlebars.compile(this.template)(this.data));

                if (this.el) {
                    this.el.replaceWith(el);
                }

                this.el = el;

                _super.prototype.render.call(this);

                this.select(this.isSelected());

                return this;
            };

            Thumbnail.prototype.save = function () {
                var _this = this;
                var deferred = $.Deferred();

                this.data.pending = true;
                this.data.error = false;

                this.render();

                if (this.data.id) {
                } else {
                    this.data.formData.append('title', this.data.title);

                    $.ajax(SHOT.rootPath + 'ajax/saveImage', {
                        type: 'POST',
                        data: this.data.formData,
                        processData: false,
                        contentType: false,
                        cache: false,
                        xhr: function () {
                            var xhr = $.ajaxSettings.xhr();

                            if (xhr.upload) {
                                xhr.upload.addEventListener('progress', function (e) {
                                    if (e.lengthComputable) {
                                        deferred.notify((e.loaded / e.total) * 100);
                                    }
                                }, false);
                            }

                            return xhr;
                        }
                    }).done(function (data) {
                        _this.data.id = data.id;
                        _this.data.path = data.path;
                        _this.data.pending = false;
                        _this.data.error = false;

                        deferred.resolve(data);
                    }).fail(function (e) {
                        _this.data.pending = false;
                        _this.data.error = true;

                        deferred.reject(e);
                    });
                }

                return deferred;
            };
            return Thumbnail;
        })(Models.Editable);
        Models.Thumbnail = Thumbnail;
    })(Shot.Models || (Shot.Models = {}));
    var Models = Shot.Models;
})(Shot || (Shot = {}));
var Shot;
(function (Shot) {
    var MultiEdit = (function () {
        function MultiEdit() {
            this.active = false;
            this.editables = [];
        }
        MultiEdit.prototype.push = function (editable) {
            var _this = this;
            this.editables.push(editable);

            $(editable).on('click', function (e) {
                if (_this.active) {
                    e.originalEvent.preventDefault();

                    editable.select(!editable.isSelected());

                    $(_this).trigger('change');
                }
            });

            return this;
        };

        MultiEdit.prototype.pull = function (editable) {
            new Shot.Helpers().arrayPull(this.editables, editable);

            return this;
        };

        MultiEdit.prototype.selectAll = function (select) {
            this.editables.forEach(function (editable) {
                editable.select(select);
            });

            $(this).trigger('change');

            return this;
        };

        MultiEdit.prototype.getSelection = function () {
            var selected = [];

            this.editables.forEach(function (editable) {
                if (editable.isSelected()) {
                    selected.push(editable);
                }
            });

            return selected;
        };

        MultiEdit.prototype.toggle = function (active) {
            this.active = active === undefined ? !this.active : active;

            if (this.active) {
                $(this).trigger('activate');
            } else {
                $(this).trigger('deactivate');
            }

            $(this).trigger('change');

            return this;
        };
        return MultiEdit;
    })();
    Shot.MultiEdit = MultiEdit;
})(Shot || (Shot = {}));
