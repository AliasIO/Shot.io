module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		watch: {
			ts: {
				files: ['src/ts/**/*.ts'],
				tasks: ['typescript']
			},
			js: {
				files: ['public/js/src/**/*.js'],
				tasks: ['uglify']
			},
			sass: {
				files: ['src/sass/**/*.sass', 'src/sass/**/*.scss'],
				tasks: ['compass']
			},
		},
		typescript: {
			base: {
				src: ['src/ts/**/*.ts'],
				dest: 'public/js/src/shot.js',
				options: {
					base_path: 'scr/ts',
					module: 'amd',
					target: 'es5'
				}
			}
		},
		uglify: {
			my_target: {
				options: {
					//sourceMap: 'public/js/<%= pkg.name %>.map',
					//sourceMapPrefix: 1
				},
				files: {
					'public/js/<%= pkg.name %>.min.js': [
						'public/js/src/lib/jquery.js',
						'public/js/src/**/*.js'
					]
				}
			}
		},
		compass: {
			dist: {
				options: {
					require: 'zurb-foundation',
					outputStyle: 'compressed',
					sassDir: 'src/sass',
					cssDir: 'public/css',
					imagesDir: 'public/img',
					httpImagesPath: '/img'
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-typescript');

	grunt.registerTask('default', ['typescript', 'uglify', 'compass', 'watch']);
};
