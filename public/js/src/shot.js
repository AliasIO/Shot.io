var Shot;
(function (Shot) {
    (function (Models) {
        var Editable = (function () {
            function Editable() {
                this.selected = false;
            }
            Editable.prototype.render = function () {
                var _this = this;
                this.el.on('click', function (e) {
                    var event = $.Event('click');

                    event.originalEvent = e;

                    $(_this).trigger(event);
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
            }
            Album.prototype.grid = function () {
                var thumbnailGrid = $('.thumbnail-grid');

                if (SHOT.thumbnails) {
                    SHOT.thumbnails.forEach(function (thumbnailData) {
                        var thumbnail = new Shot.Models.Thumbnail(thumbnailData);

                        thumbnail.data.link = SHOT.rootPath + 'album/carousel/' + SHOT.album.id + '/' + thumbnail.data.id;

                        thumbnailGrid.append(thumbnail.render().el);

                        $(thumbnail).on('delete', function () {
                            thumbnail.el.remove();

                            thumbnail = null;
                        });
                    });
                }
            };

            Album.prototype.carousel = function () {
                var carousel = new Shot.Models.Carousel(SHOT.images), id, navItem;

                carousel.render();

                id = parseInt(location.pathname.replace(/^\/album\/carousel\/\d\/(\d)/, function (match, a) {
                    return a;
                }));

                carousel.el.on('change', function (e, image) {
                    if (navItem) {
                        navItem.remove();
                    }

                    navItem = $(Mustache.render($('#template-nav-item').html(), {
                        text: image.data.title.replace(/&amp;/g, '&'),
                        icon: 'picture-o',
                        url: SHOT.rootPath + 'album/' + SHOT.album.id + '/' + image.data.id,
                        left: true
                    }));

                    $('.top-bar .left').append(navItem);

                    if (image.data.id !== id) {
                        id = image.data.id;

                        history.pushState({ id: id }, '', '/album/carousel/' + SHOT.album.id + '/' + id);
                    }
                });

                if (id) {
                    carousel.show(id);
                }

                $('#carousel-wrap').append(carousel.el);

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
                var thumbnailGrid = $('.thumbnail-grid'), albums = [], navItem, editAlbums, multiEdit = new Shot.MultiEdit();

                navItem = $(Mustache.render($('#template-nav-item').html(), {
                    text: 'Edit albums',
                    icon: 'pencil',
                    right: true
                }));

                navItem.on('click', function (e) {
                    e.preventDefault();

                    multiEdit.toggle();
                }).appendTo('.top-bar .right');

                editAlbums = $(Mustache.render($('#template-edit-albums').html(), {}));

                editAlbums.on('click', '.select-all', function (e) {
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

                    multiEdit.toggle(false);
                }).on('click', '.edit', function (e) {
                    var modal = $(Mustache.render($('#template-edit-albums-edit').html(), {})), selection = multiEdit.getSelection();

                    modal.on('submit', 'form', function (e) {
                        var ids = [], selection = multiEdit.getSelection(), title = modal.find(':input[name="title"]').val();

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

                        modal.remove();
                    }).on('click', '.cancel', function (e) {
                        modal.remove();
                    }).appendTo('body').show().find('.modal-content').css({ marginTop: $(document).scrollTop() + 'px' });

                    e.preventDefault();

                    $(e.target).blur();
                }).on('click', '.delete', function (e) {
                    var modal = $(Mustache.render($('#template-edit-albums-delete').html(), {})), selection = multiEdit.getSelection();

                    e.preventDefault();

                    $(e.target).blur();

                    modal.on('submit', 'form', function (e) {
                        var ids = [], selection = multiEdit.getSelection();

                        e.preventDefault();

                        selection.forEach(function (album) {
                            ids.push(album.data.id);

                            album.el.remove();
                        });

                        $.post(SHOT.rootPath + 'ajax/deleteAlbums', { ids: ids });

                        modal.remove();
                    }).on('click', '.cancel', function (e) {
                        modal.remove();
                    }).appendTo('body').show().find('.modal-content').css({ marginTop: $(document).scrollTop() + 'px' });
                }).appendTo('body');

                $(multiEdit).on('change', function () {
                    var selectedCount = multiEdit.getSelection().length;

                    editAlbums.find('.select-none, .edit, .delete').attr('disabled', !selectedCount);

                    editAlbums.find('.select-all').attr('disabled', selectedCount === albums.length);
                }).on('activate', function () {
                    editAlbums.stop().css({ bottom: -20, opacity: 0 }).show().animate({ bottom: 0, opacity: 1 });
                }).on('deactivate', function () {
                    editAlbums.stop().animate({ bottom: -20, opacity: 0 }, 'fast');

                    multiEdit.selectAll(false);
                }).trigger('change');

                multiEdit.toggle(true);

                if (SHOT.albums) {
                    SHOT.albums.forEach(function (albumData) {
                        var album = new Shot.Models.Album(albumData);

                        album.data.link = SHOT.rootPath + 'album/grid/' + album.data.id;

                        thumbnailGrid.prepend(album.render().el);

                        albums.push(album);

                        multiEdit.push(album);
                    });
                }
            };
            return Index;
        })();
        Controllers.Index = Index;
    })(Shot.Controllers || (Shot.Controllers = {}));
    var Controllers = Shot.Controllers;
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

                    if (this.id) {
                    } else {
                        $.post(SHOT.rootPath + 'ajax/saveAlbum', {
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
                    }

                    return deferred;
                };

                this.template = $('#template-album').html();
            }
            Album.prototype.render = function () {
                var el = $(Mustache.render(this.template, this.data, {}));

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
                    data.url = data.paths[2048];
                    data.link = SHOT.rootPath + 'album/' + SHOT.album.id + '/' + data.id;

                    _this.images.push(new Shot.Models.Image(data));
                });

                return this;
            }
            Carousel.prototype.render = function () {
                var _this = this;
                var el = $(Mustache.render(this.template, {}));

                if (this.el) {
                    this.el.replaceWith(el);
                }

                this.el = el;

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

                this.el.swipe(function (e, swipe) {
                    return _this.swipe(e, swipe);
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

                el.prop('src', image.data.url);

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

            Carousel.prototype.swipe = function (e, swipe) {
                var _this = this;
                var destination, distance, duration, wrap = this.el.find('.wrap');

                if (e === 'start') {
                    wrap.stop();

                    this.offset = wrap.position().left;
                }

                if (e === 'move') {
                    if (!this.animating) {
                        this.el.addClass('animating');

                        this.animating = true;
                    }

                    wrap.css({ opacity: (this.cutOff - Math.min(this.cutOff, Math.abs(swipe.x))) / this.cutOff, left: this.offset - Math.min(this.cutOff, Math.max(-this.cutOff, swipe.x)) });
                }

                if (e === 'end') {
                    if (swipe.distance < 50 || swipe.speed < this.cutOff || (swipe.direction === 'right' && this.index === 0) || (swipe.direction === 'left' && this.index === this.images.length - 1)) {
                        wrap.stop().animate({ opacity: 1, left: '-100%' }, 'normal', 'easeOutQuad', function () {
                            _this.el.removeClass('animating');

                            _this.animating = false;
                        });
                    } else {
                        destination = this.offset + (swipe.direction === 'right' ? this.cutOff : -this.cutOff);
                        distance = Math.abs(destination - wrap.position().left);
                        duration = distance / swipe.speed * 1000;

                        wrap.stop().animate({ opacity: 0, left: destination }, duration, 'easeOutQuad', function () {
                            wrap.stop().css({ left: '-100%' }).animate({ opacity: 1 }, duration / 2, 'easeInQuad');

                            _this.el.removeClass('animating');

                            _this.animating = false;

                            _this.show(swipe.direction === 'right' ? (_this.previous ? _this.previous.data.id : null) : (_this.next ? _this.next.data.id : null));
                        });
                    }
                }
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
                    el = $(Mustache.render(this.template, data));

                    this.el.replaceWith(el);

                    this.el = el;
                } else {
                    data.url = this.data.paths.preview;

                    this.el = $(Mustache.render(this.template, data));

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
        var ProgressBar = (function () {
            function ProgressBar() {
                this.template = $('#template-progressbar').html();
            }
            ProgressBar.prototype.render = function () {
                this.el = $(Mustache.render(this.template, {}));

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
                var el = $(Mustache.render(this.template, this.data));

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

            return this;
        };
        return MultiEdit;
    })();
    Shot.MultiEdit = MultiEdit;
})(Shot || (Shot = {}));
