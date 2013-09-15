module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		watch: {
			ts: {
				files: ['src/ts/**/*.ts'],
				tasks: ['typescript']
			},
			js: {
				files: ['src/js/**/*.js'],
				tasks: ['uglify']
			},
			sass: {
				files: ['src/sass/**/*.sass'],
				tasks: ['compass']
			},
		},
		typescript: {
			base: {
				src: ['src/ts/**/*.ts'],
				dest: 'src/js',
				options: {
					base_path: 'scr/ts',
					module: 'amd',
					target: 'es5'
				}
			}
		},
		uglify: {
			my_target: {
				files: {
					'public/js/<%= pkg.name %>.min.js': [
						'src/js/**/*.js'
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
};
