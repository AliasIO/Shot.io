var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Shot;
(function (Shot) {
    (function (AjaxUpload) {
        var fileTypes = [
            'image/jpg',
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/bmp'
        ];

        var Form = (function () {
            function Form(input, thumbnailGrid) {
                var _this = this;
                this.input = input;
                this.thumbnailGrid = thumbnailGrid;
                this.files = [];
                this.thumbnailQueue = [];
                input.on('change', function (e) {
                    $.each(e.target.files, function (i, file) {
                        var image;

                        if (file.name && $.inArray(file.type, fileTypes) !== -1) {
                            image = new Image(file, _this.thumbnailGrid);

                            _this.files.push(image);
                            _this.thumbnailQueue.push(image);
                        }
                    });

                    _this.nextThumbnail();
                });

                return this;
            }
            Form.prototype.nextThumbnail = function () {
                var _this = this;
                if (this.thumbnailQueue.length) {
                    this.thumbnailQueue.shift().createThumbnail(function () {
                        return _this.nextThumbnail();
                    });
                }

                return this;
            };
            return Form;
        })();
        AjaxUpload.Form = Form;

        var File = (function () {
            function File(file, thumbnailGrid) {
                var _this = this;
                this.file = file;
                this.thumbnailGrid = thumbnailGrid;
                var formData = new FormData();

                formData.append('image', file);

                this.thumbnail = $('<li><div class="container"><div class="processing"/><div class="title-wrap"><div class="title"/></div></div></li>');

                this.thumbnail.find('.title').html('<i class="icon-picture"/>&nbsp;' + file.name);

                this.progressBar = new ProgressBar(this.thumbnail);

                thumbnailGrid.prepend(this.thumbnail);

                $.ajax({
                    url: SHOT.rootPath + 'upload',
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                    cache: false,
                    xhr: function () {
                        var xhr = $.ajaxSettings.xhr();

                        if (xhr.upload) {
                            xhr.upload.addEventListener('progress', function (e) {
                                if (e.lengthComputable) {
                                    _this.progressBar.set((e.loaded / e.total) * 100);
                                }
                            }, false);
                        }

                        return xhr;
                    }
                }, 'json').done(function (data) {
                    _this.progressBar.set(100, function () {
                        var image = $('<img/>');

                        image.hide().on('load', function (e) {
                            _this.thumbnail.find('.temporary').fadeOut('fast', function () {
                                $(this).remove();
                            });

                            _this.thumbnail.find('.processing').fadeOut('fast');

                            $(e.target).fadeIn('fast');
                        }).prependTo(_this.thumbnail.find('.container')).prop('src', SHOT.rootPath + 'photos/thumb/smart/' + data.filename);
                    });
                }).fail(function (e) {
                    _this.progressBar.set(0);

                    _this.thumbnail.find('.container').addClass('error');

                    console.log('fail');
                });

                return this;
            }
            return File;
        })();

        var Image = (function (_super) {
            __extends(Image, _super);
            function Image(file, thumbnailGrid) {
                _super.call(this, file, thumbnailGrid);
                this.file = file;
                this.thumbnailGrid = thumbnailGrid;
                this.thumbnailSize = 480;

                return this;
            }
            Image.prototype.createThumbnail = function (callback) {
                var _this = this;
                var reader = new FileReader();

                callback = typeof callback === 'function' ? callback : function () {
                };

                reader.onload = function (e) {
                    var image = $('<img/>');

                    image.on('load', function (e) {
                        var canvas = $('<canvas/>').get(0), size = {
                            x: e.target.width < e.target.height ? _this.thumbnailSize : e.target.width * _this.thumbnailSize / e.target.height,
                            y: e.target.height < e.target.width ? _this.thumbnailSize : e.target.height * _this.thumbnailSize / e.target.width
                        };

                        canvas.width = _this.thumbnailSize;
                        canvas.height = _this.thumbnailSize;

                        canvas.getContext('2d').drawImage(e.target, (canvas.width - size.x) / 2, (canvas.height - size.y) / 2, size.x, size.y);

                        $(canvas).hide().fadeIn('fast').addClass('temporary').prependTo(_this.thumbnail.find('.container'));

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

                reader.readAsDataURL(this.file);

                return this;
            };
            return Image;
        })(File);

        var ProgressBar = (function () {
            function ProgressBar(thumbnail) {
                this.thumbnail = thumbnail;
                var wrap = $('<div class="progressbar-wrap"/>');

                this.el = $('<div class="progressbar"/>');

                wrap.append(this.el);

                thumbnail.find('.container').append(wrap);
            }
            ProgressBar.prototype.set = function (percentage, callback) {
                var _this = this;
                this.el.stop(true, true).animate({ width: percentage + '%' }, 200, function () {
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
    })(Shot.AjaxUpload || (Shot.AjaxUpload = {}));
    var AjaxUpload = Shot.AjaxUpload;
})(Shot || (Shot = {}));
var Shot;
(function (Shot) {
    (function (Album) {
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
                    _this.render(e.originalEvent.state.id);
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
                    _this.images.push(new Image(data));
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

                this.breadcrumb.prop('href', SHOT.rootPath + 'album/carousel/' + SHOT.album.id + '/' + images.current.data.id).html('<i class="icon-picture"/>&nbsp;' + images.current.data.title);

                this.carousel.find('.image img').remove();

                if (this.index > 0) {
                    images.previous = this.images[this.index - 1];
                }

                if (this.images.length > this.index + 1) {
                    images.next = this.images[this.index + 1];
                }

                $.each(['previous', 'current', 'next'], function (i, container) {
                    var anchor, image = images[container];

                    if (image instanceof Image) {
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
                    $(fullScreen).find('img').replaceWidth(el);
                }).prop('src', image.data.paths.original);

                $.each(['r', 'mozR', 'webkitR', 'msR', 'oR'], function (i, prefix) {
                    var method = prefix + 'equestFullScreen';

                    if (typeof fullScreen[method] === 'function') {
                        fullScreen[method]();

                        return false;
                    }
                });
            };
            return Carousel;
        })();
        Album.Carousel = Carousel;

        var Image = (function () {
            function Image(data) {
                this.data = data;
                this.el = $('<img/>');

                return this;
            }
            Image.prototype.appendTo = function (parent) {
                this.preview = new Preview({ x: this.data.width, y: this.data.height }, parent, this.data.paths.preview);

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
        Album.Image = Image;

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
        Album.Preview = Preview;
    })(Shot.Album || (Shot.Album = {}));
    var Album = Shot.Album;
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

            switch (SHOT.controller) {
                case 'Admin':
                    new Shot.AjaxUpload.Form($('#files'), $('.thumbnail-grid'));

                    break;
                case 'Album':
                    if (SHOT.action === 'carousel') {
                        new Shot.Album.Carousel($('.carousel'), SHOT.images);
                    }

                    break;
            }

            return this;
        }
        return App;
    })();
    Shot.App = App;
})(Shot || (Shot = {}));
