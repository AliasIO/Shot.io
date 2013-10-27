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
                        var album = new Shot.Models.Album(albumData).render();

                        thumbnailGrid.prepend(album.el);

                        albums.push(album);
                    });
                }

                $('#album').on('submit', function (e) {
                    var album = null, title = $('#title').val();

                    e.preventDefault();

                    if (title) {
                        album = new Shot.Models.Album({ title: title }).render();

                        album.save().done(function (data) {
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
                                    }).prependTo(thumbnail.el.find('.container')).prop('src', SHOT.rootPath + 'photos/thumb/smart/' + data.filename);
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
                        var thumbnail = new Shot.Models.Thumbnail(thumbnailData).render();

                        thumbnailGrid.prepend(thumbnail.el);

                        thumbnails.push(thumbnail);
                    });
                }
            };

            Album.prototype.carousel = function () {
                new Shot.Models.Carousel($('.carousel'), SHOT.images);
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
                        var album = new Shot.Models.Album(albumData).render();

                        thumbnailGrid.prepend(album.el);

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

                this.el ? this.el.replaceWith(el) : this.el = el;

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
            function Carousel(carousel, imagesData) {
                var _this = this;
                this.carousel = carousel;
                this.index = 0;
                this.images = [];
                this.animating = false;
                var offset = 0, wrap = $('<div class="wrap"/>'), cutOff;

                this.currentId = parseInt(location.pathname.replace(/^\/album\/carousel\/[0-9]+\/([0-9]+)/, function (match, a) {
                    return a;
                }));

                $(window).on('popstate', function (e) {
                    if (e.originalEvent.state) {
                        _this.render(e.originalEvent.state.id);
                    }
                });

                $(window).on('resize', function () {
                    cutOff = $(window).width() / 2;
                }).trigger('resize');

                $(document).on('keydown', function (e) {
                    switch (e.keyCode) {
                        case 35:
                            e.preventDefault();

                            if (_this.index < _this.images.length - 1) {
                                _this.index = _this.images.length - 1;

                                _this.render();
                            }

                            break;
                        case 36:
                            e.preventDefault();

                            if (_this.index > 0) {
                                _this.index = 0;

                                _this.render();
                            }

                            break;
                        case 33:
                        case 37:
                        case 38:
                            e.preventDefault();

                            if (_this.index > 0) {
                                _this.index--;

                                _this.render();
                            }

                            break;
                        case 32:
                        case 34:
                        case 39:
                        case 40:
                            e.preventDefault();

                            if (_this.index < _this.images.length - 1) {
                                _this.index++;

                                _this.render();
                            }

                            break;
                    }
                });

                $('.full-screen').on('click', function (e) {
                    $.each(['c', 'mozC', 'webkitC', 'msC', 'oC'], function (i, prefix) {
                        var method = prefix + 'ancelFullScreen';

                        if (typeof document[method] === 'function') {
                            document[method]();
                        }
                    });
                });

                this.breadcrumb = $('<a/>');

                $('<li/>').append(this.breadcrumb).appendTo('.top-bar .breadcrumbs');

                $('.top-bar .breadcrumbs').append('<li class="divider"/>');

                $.each(['previous', 'current', 'next'], function (i, container) {
                    _this[container] = $('<div class="' + container + '"><div class="image"><a><div class="valign"/></a></div></div>');

                    wrap.append(_this[container]);
                });

                wrap.find('.image a').on('click', function (e) {
                    e.preventDefault();

                    if (!_this.animating) {
                        if (_this.current.has(e.target).length) {
                            _this.fullScreen(_this.images[_this.index]);
                        }

                        if (_this.previous.has(e.target).length) {
                            _this.index--;

                            _this.render();
                        }

                        if (_this.next.has(e.target).length) {
                            _this.index++;

                            _this.render();
                        }
                    }
                });

                $(carousel).swipe(function (e, swipe) {
                    var opacity, destination, distance, duration;

                    if (e === 'start') {
                        wrap.stop();

                        offset = wrap.position().left;
                    }

                    if (e === 'move') {
                        if (!_this.animating) {
                            carousel.addClass('animating');

                            _this.animating = true;
                        }

                        wrap.css({ opacity: (cutOff - Math.min(cutOff, Math.abs(swipe.x))) / cutOff, left: offset - Math.min(cutOff, Math.max(-cutOff, swipe.x)) });
                    }

                    if (e === 'end') {
                        if (swipe.distance < 50 || swipe.speed < cutOff || (swipe.direction === 'right' && _this.index === 0) || (swipe.direction === 'left' && _this.index === _this.images.length - 1)) {
                            wrap.stop().animate({ opacity: 1, left: '-100%' }, 'normal', 'easeOutQuad', function () {
                                carousel.removeClass('animating');

                                _this.animating = false;
                            });
                        } else {
                            destination = offset + (swipe.direction === 'right' ? cutOff : -cutOff);
                            distance = Math.abs(destination - wrap.position().left);
                            duration = distance / swipe.speed * 1000;

                            wrap.stop().animate({ opacity: 0, left: destination }, duration, 'easeOutQuad', function () {
                                wrap.stop().css({ left: '-100%' }).animate({ opacity: 1 }, duration / 2, 'easeInQuad');

                                _this.index += swipe.direction === 'right' ? -1 : 1;

                                _this.render();

                                carousel.removeClass('animating');

                                _this.animating = false;
                            });
                        }
                    }
                });

                $.each(imagesData, function (i, data) {
                    _this.images.push(new Shot.Models.Image(data));
                });

                wrap.appendTo(carousel);

                this.render(this.currentId);

                return this;
            }
            Carousel.prototype.render = function (id) {
                var _this = this;
                var images = { previous: null, current: null, next: null };

                if (id !== undefined) {
                    this.currentId = id;

                    $.each(this.images, function (i, image) {
                        if (image.data.id === _this.currentId) {
                            _this.index = i;
                        }
                    });
                }

                this.index = Math.max(0, Math.min(this.images.length - 1, this.index));

                images.current = this.images[this.index];

                if (this.currentId === images.current.data.id) {
                    history.replaceState({ id: this.currentId }, '');
                } else {
                    this.currentId = images.current.data.id;

                    history.pushState({ id: this.currentId }, '', '/album/carousel/' + SHOT.album.id + '/' + images.current.data.id);
                }

                this.breadcrumb.prop('href', SHOT.rootPath + 'album/carousel/' + SHOT.album.id + '/' + images.current.data.id).html('<i class="fa fa-picture-o"/>&nbsp;' + images.current.data.title);

                this.carousel.find('.image img').remove();

                if (this.index > 0) {
                    images.previous = this.images[this.index - 1];
                }

                if (this.images.length > this.index + 1) {
                    images.next = this.images[this.index + 1];
                }

                $.each(['previous', 'current', 'next'], function (i, container) {
                    var anchor, image = images[container];

                    if (image instanceof Shot.Models.Image) {
                        anchor = _this[container].find('.image a');

                        if (container === 'current') {
                            anchor.attr('href', SHOT.rootPath + 'image/fullscreen/' + image.data.id);
                        } else {
                            anchor.attr('href', SHOT.rootPath + 'album/carousel/' + SHOT.album.id + '/' + image.data.id);
                        }

                        image.appendTo(anchor).render(2048);
                    }
                });

                return this;
            };

            Carousel.prototype.fullScreen = function (image) {
                var fullScreen = $('.full-screen').get(0), clone = image.el.clone(), el = $('<img/>');

                $(fullScreen).html('<div class="valign"></div>').append(clone);

                el.on('load', function () {
                    $(fullScreen).find('img').replaceWith(el);
                }).prop('src', image.data.paths.original);

                $.each(['r', 'mozR', 'webkitR', 'msR', 'oR'], function (i, prefix) {
                    var method = prefix + 'equestFullScreen';

                    if (typeof fullScreen[method] === 'function') {
                        fullScreen[method]();

                        return false;
                    }
                });

                return this;
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
                this.el = $('<img/>');

                return this;
            }
            Image.prototype.appendTo = function (parent) {
                this.preview = new Shot.Models.Preview({ x: this.data.width, y: this.data.height }, parent, this.data.paths.preview);

                this.el.appendTo(parent);

                return this;
            };

            Image.prototype.render = function (size) {
                var _this = this;
                var el = $('<img/>');

                el.prop('src', this.data.paths[size] ? this.data.paths[size] : this.data.paths['original']);

                el.on('load', function (e) {
                    _this.el.replaceWith(el);

                    _this.el = el;

                    if (_this.preview) {
                        _this.preview.destroy();
                    }
                });

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
        var Preview = (function () {
            function Preview(size, parent, filePath) {
                var _this = this;
                this.id = new Date().getTime() + Math.round(Math.random() * 999);

                this.el = $('<img/>');

                $(window).on('resize.' + this.id, function () {
                    var parentSize = { x: parent.width(), y: parent.height() };

                    if (size.x > parentSize.x) {
                        size.y *= parentSize.x / size.x;
                        size.x = parentSize.x;
                    }

                    if (size.y > parentSize.y) {
                        size.x *= parentSize.y / size.y;
                        size.y = parentSize.y;
                    }

                    _this.el.css({
                        position: 'absolute',
                        top: (parentSize.y / 2) - (size.y / 2),
                        height: size.y,
                        width: size.x
                    });

                    switch (parent.css('textAlign')) {
                        case 'start':
                            _this.el.css({ left: 0 });

                            break;
                        case 'center':
                            _this.el.css({ left: (parentSize.x / 2) - (size.x / 2) });

                            break;
                        case 'right':
                            _this.el.css({ right: 0 });

                            break;
                    }
                }).trigger('resize');

                this.el.addClass('preview').prop('src', filePath).appendTo(parent);

                return this;
            }
            Preview.prototype.destroy = function () {
                this.el.remove();

                $(window).off('resize.' + this.id);
            };
            return Preview;
        })();
        Models.Preview = Preview;
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

                this.el ? this.el.replaceWith(el) : this.el = el;

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
