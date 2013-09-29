var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Shot;
(function (Shot) {
    var App = (function () {
        function App() {
            $(document).on('dragstart', 'img', function (e) {
                e.preventDefault();
            });

            switch (SHOT.controller) {
                case 'Admin':
                    new AjaxUpload.Form($('#files'), $('.thumbnail-grid'));

                    break;
                case 'Album':
                    new Album.Carousel($('.carousel'), SHOT.images);

                    break;
            }

            return this;
        }
        return App;
    })();
    Shot.App = App;

    var AjaxUpload;
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
                this.input = input;
                this.thumbnailGrid = thumbnailGrid;
                this.files = [];
                this.thumbnailQueue = [];
                var self = this;

                input.change(function () {
                    $.each(this.files, function () {
                        var image;

                        if (this.name && $.inArray(this.type, fileTypes) !== -1) {
                            image = new Image(this, self.thumbnailGrid);

                            self.files.push(image);
                            self.thumbnailQueue.push(image);
                        }
                    });

                    self.nextThumbnail();
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
                this.file = file;
                this.thumbnailGrid = thumbnailGrid;
                var self = this, formData = new FormData();

                formData.append('image', file);

                this.thumbnail = $('<li><div class="container"><div class="processing"/><div class="title-wrap"><div class="title"/></div></div></li>');

                this.thumbnail.find('.title').text(file.name);

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
                                    self.progressBar.set((e.loaded / e.total) * 100);
                                }
                            }, false);
                        }

                        return xhr;
                    }
                }, 'json').done(function (data) {
                    self.progressBar.set(100, function () {
                        var image = $('<img/>');

                        image.hide().on('load', function () {
                            self.thumbnail.find('.temporary').fadeOut('fast', function () {
                                $(this).remove();
                            });

                            self.thumbnail.find('.processing').fadeOut('fast');

                            $(this).fadeIn('fast');
                        }).prependTo(self.thumbnail.find('.container')).prop('src', SHOT.rootPath + 'photos/thumb/smart/' + data.filename);
                    });
                }).fail(function (e) {
                    self.progressBar.set(0);

                    self.thumbnail.find('.container').addClass('error');

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
                var self = this, reader = new FileReader();

                callback = typeof callback === 'function' ? callback : function () {
                };

                reader.onload = function (e) {
                    var image = $('<img/>');

                    image.on('load', function () {
                        var canvas = $('<canvas/>').get(0), size = {
                            x: this.width < this.height ? self.thumbnailSize : this.width * self.thumbnailSize / this.height,
                            y: this.height < this.width ? self.thumbnailSize : this.height * self.thumbnailSize / this.width
                        };

                        canvas.width = self.thumbnailSize;
                        canvas.height = self.thumbnailSize;

                        canvas.getContext('2d').drawImage(this, (canvas.width - size.x) / 2, (canvas.height - size.y) / 2, size.x, size.y);

                        $(canvas).css({ opacity: 0 }).animate({ opacity: .5 }, 'fast').addClass('temporary').prependTo(self.thumbnail.find('.container'));

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
                var self = this;

                this.el.stop(true, true).animate({ width: percentage + '%' }, 200, function () {
                    if (percentage === 100) {
                        self.el.fadeOut('fast');
                    }

                    if (typeof callback === 'function') {
                        callback();
                    }
                });

                return this;
            };
            return ProgressBar;
        })();
    })(AjaxUpload || (AjaxUpload = {}));

    var Album;
    (function (Album) {
        var Carousel = (function () {
            function Carousel(carousel, imagesData) {
                this.carousel = carousel;
                this.index = 0;
                this.images = [];
                var self = this, dragStart = { x: 0, y: 0 }, offset = 0, wrap = $('<div class="wrap"/>'), cutOff;

                $(window).on('resize', function () {
                    cutOff = $(window).width() / 2;
                }).trigger('resize');

                $.each(['previous', 'current', 'next'], function () {
                    wrap.append('<div class="' + this + '"><a class="image"><div class="valign"/></a></div>');
                });

                $(carousel).swipe(function (e, swipe) {
                    var opacity, destination, distance, duration;

                    if (e === 'start') {
                        wrap.stop();

                        offset = wrap.position().left;

                        carousel.addClass('animating');
                    }

                    if (e === 'move') {
                        wrap.css({ opacity: (cutOff - Math.min(cutOff, Math.abs(swipe.x))) / cutOff, left: offset - Math.min(cutOff, Math.max(-cutOff, swipe.x)) });
                    }

                    if (e === 'end') {
                        if (swipe.distance < 50 || swipe.speed < cutOff || (swipe.direction === 'right' && self.index === 0) || (swipe.direction === 'left' && self.index === self.images.length - 1)) {
                            wrap.stop().animate({ opacity: 1, left: '-100%' }, 'normal', 'easeOutQuad', function () {
                                carousel.removeClass('animating');
                            });
                        } else {
                            destination = offset + (swipe.direction === 'right' ? cutOff : -cutOff);
                            distance = Math.abs(destination - wrap.position().left);
                            duration = distance / swipe.speed * 1000;

                            wrap.stop().animate({ opacity: 0, left: destination }, duration, 'easeOutQuad', function () {
                                wrap.stop().css({ left: '-100%' }).animate({ opacity: 1 }, duration / 2, 'easeInQuad');

                                self.index += swipe.direction === 'right' ? -1 : 1;

                                self.render();

                                carousel.removeClass('animating');
                            });
                        }
                    }
                });

                $.each(imagesData, function () {
                    self.images.push(new Image(this));
                });

                wrap.appendTo(carousel);

                this.render();

                return this;
            }
            Carousel.prototype.render = function () {
                var previous, current, next;

                this.index = Math.max(0, Math.min(this.images.length - 1, this.index));

                this.carousel.find('.image img').remove();

                current = this.images[this.index];

                current.appendTo(this.carousel.find('.current .image')).render(2048);

                if (this.index > 0) {
                    previous = this.images[this.index - 1];

                    previous.appendTo(this.carousel.find('.previous .image')).render(2048);
                }

                if (this.images.length > this.index + 1) {
                    next = this.images[this.index + 1];

                    next.appendTo(this.carousel.find('.next .image')).render(2048);
                }

                return this;
            };
            return Carousel;
        })();
        Album.Carousel = Carousel;

        var Image = (function () {
            function Image(data) {
                this.data = data;
                var self = this;

                this.el = $('<img/>');

                return this;
            }
            Image.prototype.appendTo = function (parent) {
                var self = this;

                this.preview = new Preview({ x: this.data.width, y: this.data.height }, parent, this.data.paths.preview);

                this.el.appendTo(parent);

                return this;
            };

            Image.prototype.render = function (size) {
                var self = this, el = $('<img/>');

                el.prop('src', this.data.paths[size] ? this.data.paths[size] : this.data.paths['original']);

                el.on('load', function () {
                    self.el.replaceWith(this);

                    if (self.preview) {
                        self.preview.destroy();
                    }
                });

                return this;
            };
            return Image;
        })();

        var Preview = (function () {
            function Preview(size, parent, filePath) {
                var self = this;

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

                    self.el.css({
                        position: 'absolute',
                        top: (parentSize.y / 2) - (size.y / 2),
                        height: size.y,
                        width: size.x
                    });

                    switch (parent.css('textAlign')) {
                        case 'start':
                            self.el.css({ left: 0 });

                            break;
                        case 'center':
                            self.el.css({ left: (parentSize.x / 2) - (size.x / 2) });

                            break;
                        case 'right':
                            self.el.css({ right: 0 });

                            break;
                    }
                }).trigger('resize');

                this.el.addClass('preview').prop('src', filePath).appendTo(parent);

                return this;
            }
            Preview.prototype.destroy = function () {
                var self = this;

                this.el.stop().fadeOut('fast', function () {
                    $(window).off('resize.' + self.id);

                    $(this).remove();

                    self = null;
                });
            };
            return Preview;
        })();
    })(Album || (Album = {}));
})(Shot || (Shot = {}));

$(function () {
    SHOT.app = new Shot.App();
});
