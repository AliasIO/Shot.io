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
                    var ajaxUpload = new AjaxUpload.Form($('#files'), $('#thumbnail-grid'));

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
                var self = this;

                input.change(function () {
                    $.each(this.files, function () {
                        if (this.name && $.inArray(this.type, fileTypes) !== -1) {
                            self.files.push(new Image(this, self.thumbnailGrid));
                        }
                    });
                });
            }
            return Form;
        })();
        AjaxUpload.Form = Form;

        var File = (function () {
            function File(file, thumbnailGrid) {
                this.file = file;
                this.thumbnailGrid = thumbnailGrid;
                var self = this, formData = new FormData();

                this.thumbnail = $('<li><div class="container"><div class="processing"/><div class="title-wrap"><div class="title"/></div></div></li>');

                this.thumbnail.find('.title').text(file.name);

                this.progressBar = new ProgressBar(this.thumbnail);

                thumbnailGrid.prepend(this.thumbnail);

                formData.append('image', file);

                $.ajax({
                    url: 'http://shot.local' + SHOT.rootPath + 'upload',
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
                        self.thumbnail.find('.container').css({ backgroundImage: 'url(' + SHOT.rootPath + 'photos/thumb/smart/' + data.filename + ')' });

                        self.thumbnail.find('.processing').css({ backgroundImage: 'none' }).fadeOut(1000);

                        console.log('done');
                    });
                }).fail(function (e) {
                    self.progressBar.set(0);

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

                var self = this, reader = new FileReader();

                reader.onload = function (e) {
                    var image = document.createElement('img'), canvas = document.createElement('canvas');

                    $(image).on('load', function () {
                        var size = { x: this.width, y: this.height }, ctx = canvas.getContext('2d'), dataUrl = '';

                        if (size.x > size.y) {
                            size.x = Math.round(size.x *= self.thumbnailSize / size.y);
                            size.y = self.thumbnailSize;
                        } else {
                            size.y = Math.round(size.y *= self.thumbnailSize / size.x);
                            size.x = self.thumbnailSize;
                        }

                        canvas.width = size.x;
                        canvas.height = size.y;

                        ctx.drawImage(image, 0, 0, size.x, size.y);

                        dataUrl = canvas.toDataURL('image/png');

                        $(image).remove();
                        $(canvas).remove();

                        self.thumbnail.find('.container').css({ backgroundImage: 'url(' + dataUrl + ')' });
                    });

                    image.src = e.target.result;
                };

                reader.readAsDataURL(file);

                return this;
            }
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
            };
            return ProgressBar;
        })();
    })(AjaxUpload || (AjaxUpload = {}));
})(Shot || (Shot = {}));

$(function () {
    SHOT.app = new Shot.App();
});
