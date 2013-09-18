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
            switch (SHOT.controller) {
                case 'Admin':
                    new AjaxUpload.Form($('#files'), $('#thumbnail-grid'));

                    break;
            }
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
                        var thumbnail = $('<img/>'), canvas = $('<canvas/>').get(0), ctx = canvas.getContext('2d'), size = {
                            x: this.width < this.height ? self.thumbnailSize : this.width * self.thumbnailSize / this.height,
                            y: this.height < this.width ? self.thumbnailSize : this.height * self.thumbnailSize / this.width
                        };

                        canvas.width = self.thumbnailSize;
                        canvas.height = self.thumbnailSize;

                        ctx.drawImage(image.get(0), (canvas.width - size.x) / 2, (canvas.height - size.y) / 2, size.x, size.y);

                        thumbnail.css({ opacity: 0 }).on('load', function () {
                            $(this).animate({ opacity: .5 }, 'fast');
                        }).prop('src', canvas.toDataURL('image/png')).addClass('temporary').prependTo(self.thumbnail.find('.container'));

                        $(image, canvas).remove();

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
})(Shot || (Shot = {}));

$(function () {
    SHOT.app = new Shot.App();
});
