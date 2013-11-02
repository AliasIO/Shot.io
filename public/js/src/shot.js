$(function () {
    SHOT.app = new Shot.App();
});

var Shot;
(function (Shot) {
    var App = (function () {
        function App() {
            $(document).foundation();

            FastClick.attach(document);

            $(document).on('dragstart', 'img, a', function (e) {
                e.preventDefault();
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
        var Admin = (function () {
            function Admin() {
            }
            Admin.prototype.index = function () {
                var thumbnailGrid = $('.thumbnail-grid'), albums = [];

                if (SHOT.albums) {
                    $.each(SHOT.albums, function (i, albumData) {
                        var album = new Shot.Models.Album(albumData);

                        album.data.link = SHOT.rootPath + 'admin/album/' + album.data.id;

                        thumbnailGrid.prepend(album.render().el);

                        albums.push(album);
                    });
                }

                $('#album').on('submit', function (e) {
                    var album = null, title = $('#title').val();

                    e.preventDefault();

                    if (title) {
                        album = new Shot.Models.Album({ title: title }).render();

                        album.save().done(function (data) {
                            album.data.link = SHOT.rootPath + 'admin/album/' + data.id;

                            album.render();
                        }).fail(function (e) {
                            console.log('fail');
                        });

                        albums.push(album);

                        thumbnailGrid.prepend(album.el);
                    }
                });
            };

            Admin.prototype.album = function () {
                var thumbnailSize = 480, thumbnailGrid = $('.thumbnail-grid'), thumbnails = [], thumbnailQueue = [], fileTypes = [
                    'image/jpg',
                    'image/jpeg',
                    'image/png',
                    'image/gif',
                    'image/bmp'
                ], preRender;

                if (SHOT.thumbnails) {
                    $.each(SHOT.thubmnails, function (i, thumbnailData) {
                        var thumbnail = new Shot.Models.Thumbnail(thumbnailData.title).render();

                        thumbnailGrid.prepend(thumbnail);

                        thumbnails.push(thumbnail);
                    });
                }

                $('#files').on('change', function (e) {
                    $.each(e.target.files, function (i, file) {
                        var thumbnail, progressBar;

                        if (file.name && $.inArray(file.type, fileTypes) !== -1) {
                            thumbnail = new Shot.Models.Thumbnail({ title: file.name, file: file, formData: new FormData() }).render();
                            progressBar = new Shot.Models.ProgressBar().render();

                            thumbnail.data.formData.append('image', file);

                            thumbnail.el.find('.container').append(progressBar.el);

                            thumbnailGrid.prepend(thumbnail.el);

                            thumbnail.save().done(function (data) {
                                progressBar.set(100, function () {
                                    var image = $('<img/>');

                                    image.hide().on('load', function (e) {
                                        thumbnail.el.find('.temporary').fadeOut('fast', function () {
                                            $(this).remove();
                                        });

                                        thumbnail.el.find('.processing').fadeOut('fast');

                                        $(e.target).fadeIn('fast');
                                    }).prependTo(thumbnail.el.find('.container')).prop('src', SHOT.rootPath + 'photos/thumb/' + data.filename);
                                });
                            }).progress(function (data) {
                                progressBar.set(data);
                            }).fail(function (e) {
                                progressBar.set(0);

                                thumbnail.el.find('.container').addClass('error');

                                console.log('fail');
                            });

                            thumbnails.push(thumbnail);
                            thumbnailQueue.push(thumbnail);
                        }
                    });

                    preRender = function (thumbnail, callback) {
                        var reader = new FileReader();

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

                    (function nextThumbnail() {
                        if (thumbnailQueue.length) {
                            preRender(thumbnailQueue.shift(), function () {
                                return nextThumbnail();
                            });
                        }
                    })();
                });
            };
            return Admin;
        })();
        Controllers.Admin = Admin;
    })(Shot.Controllers || (Shot.Controllers = {}));
    var Controllers = Shot.Controllers;
})(Shot || (Shot = {}));
var Shot;
(function (Shot) {
    (function (Controllers) {
        var Album = (function () {
            function Album() {
            }
            Album.prototype.grid = function () {
                var thumbnailGrid = $('.thumbnail-grid'), thumbnails = [];

                if (SHOT.thumbnails) {
                    $.each(SHOT.thumbnails, function (i, thumbnailData) {
                        var thumbnail = new Shot.Models.Thumbnail(thumbnailData);

                        thumbnail.data.link = SHOT.rootPath + 'album/carousel/' + SHOT.album.id + '/' + thumbnail.data.id;

                        thumbnailGrid.append(thumbnail.render().el);

                        thumbnails.push(thumbnail);
                    });
                }
            };

            Album.prototype.carousel = function () {
                var carousel = new Shot.Models.Carousel(SHOT.images), id, breadcrumb = null;

                carousel.render();

                id = parseInt(location.pathname.replace(/^\/album\/carousel\/\d\/(\d)/, function (match, a) {
                    return a;
                }));

                carousel.el.on('change', function (e, image) {
                    var data = {
                        text: image.data.title,
                        url: SHOT.rootPath + 'album/' + SHOT.album.id + '/' + image.data.id
                    };

                    if (breadcrumb) {
                        breadcrumb.remove();
                    }

                    breadcrumb = $(Mustache.render($('#template-breadcrumb').html(), data));

                    $('.top-bar .breadcrumbs').append(breadcrumb);

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
                var thumbnailGrid = $('.thumbnail-grid'), albums = [];

                if (SHOT.albums) {
                    $.each(SHOT.albums, function (i, albumData) {
                        var album = new Shot.Models.Album(albumData);

                        album.data.link = SHOT.rootPath + 'album/grid/' + album.data.id;

                        thumbnailGrid.prepend(album.render().el);

                        albums.push(album);
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
    (function (Models) {
        var Album = (function () {
            function Album(data) {
                this.data = data;
                this.save = function () {
                    var _this = this;
                    var deferred = $.Deferred();

                    if (this.id) {
                    } else {
                        $.post(SHOT.rootPath + 'ajax/saveAlbum', {
                            title: this.data.title
                        }).done(function (data) {
                            _this.data.id = data.id;

                            deferred.resolve(data);
                        }).fail(function (e) {
                            deferred.reject(e);
                        });
                    }

                    return deferred;
                };
                this.template = $('#template-album').html();
            }
            Album.prototype.render = function () {
                var el = $(Mustache.render(this.template, this.data));

                if (this.el) {
                    this.el.replaceWith(el);
                }

                this.el = el;

                return this;
            };
            return Album;
        })();
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

                $.each(imagesData, function (i, data) {
                    data.url = data.paths[2048];
                    data.link = SHOT.rootPath + 'album/' + SHOT.album.id + '/' + data.id;

                    _this.images.push(new Shot.Models.Image(data));
                });

                return this;
            }
            Carousel.prototype.render = function () {
                var _this = this;
                var el = $(Mustache.render(this.template));

                if (this.el) {
                    this.el.replaceWith(el);
                }

                this.el = el;

                $(window).on('resize', function () {
                    _this.cutOff = $(window).width() / 2;
                }).trigger('resize');

                $(document).on('click', '.full-screen', function (e) {
                    $.each(['c', 'mozC', 'webkitC', 'msC', 'oC'], function (i, prefix) {
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

                $.each(this.images, function (i, image) {
                    if (image.data.id === id) {
                        _this.index = i;
                    }
                });

                this.previous = this.index > 0 ? this.images[this.index - 1] : null;
                this.current = this.images[this.index];
                this.next = this.images.length > this.index + 1 ? this.images[this.index + 1] : null;

                $.each(['previous', 'current', 'next'], function (i, container) {
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

                $.each(['r', 'mozR', 'webkitR', 'msR', 'oR'], function (i, prefix) {
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

                            _this.show(swipe.direction === 'right' ? _this.previous.data.id : _this.next.data.id);
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
                this.el = $(Mustache.render(this.template));

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
        var Thumbnail = (function () {
            function Thumbnail(data) {
                this.data = data;
                this.template = $('#template-thumbnail').html();
            }
            Thumbnail.prototype.render = function () {
                var el = $(Mustache.render(this.template, this.data));

                if (this.el) {
                    this.el.replaceWith(el);
                }

                this.el = el;

                return this;
            };

            Thumbnail.prototype.save = function () {
                var _this = this;
                var deferred = $.Deferred();

                if (this.data.id) {
                } else {
                    $.ajax({
                        url: SHOT.rootPath + 'ajax/saveImage',
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
                    }, 'json').done(function (data) {
                        _this.data.id = data.id;
                        _this.data.filename = data.filename;

                        deferred.resolve(data);
                    }).fail(function (e) {
                        deferred.reject(e);
                    });
                }

                return deferred;
            };
            return Thumbnail;
        })();
        Models.Thumbnail = Thumbnail;
    })(Shot.Models || (Shot.Models = {}));
    var Models = Shot.Models;
})(Shot || (Shot = {}));
