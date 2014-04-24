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
				tasks: ['concat', 'uglify']
			},
			sass: {
				files: ['src/sass/**/*.sass', 'src/sass/**/*.scss'],
				tasks: ['sass']
			},
		},
		typescript: {
			base: {
				src: ['src/ts/**/*.ts'],
				dest: 'public/js/src/shot.js',
				options: {
					basepath: 'scr/ts',
					module: 'amd',
					target: 'es5'
				}
			}
		},
		concat: {
			options: {
				separator: ';',
			},
			dist: {
				dest: 'public/js/src/<%= pkg.name %>.js',
				src: [
					'bower_components/jquery/dist/jquery.js',
					'bower_components/jquery-easing-original/jquery.easing.1.3.js',
					'bower_components/fastclick/lib/fastclick.js',
					'bower_components/foundation/js/foundation/foundation.js',
					'bower_components/foundation/js/foundation/foundation.topbar.js',
					'bower_components/foundation/js/foundation/foundation.dropdown.js',
					'bower_components/foundation/js/foundation/foundation.interchange.js',
					'bower_components/handlebars/handlebars.js',
					'bower_components/swipe.jquery.js/swipe.jquery.js',
					'public/js/src/**/*.js'
				]
			}
		},
		uglify: {
			my_target: {
				options: {
					sourceMap: 'public/js/<%= pkg.name %>.map'
				},
				files: {
					'public/js/<%= pkg.name %>.min.js': [
						'public/js/src/<%= pkg.name %>.js'
					]
				}
			}
		},
		sass: {
			dist: {
				options: {
					loadPath: [
						'bower_components/foundation/scss',
						require('node-bourbon').includePaths
					],
				},
				files: [{
					expand: true,
					cwd: 'src/sass',
					src: '<%= pkg.name %>.sass',
					dest: 'public/css',
					ext: '.css'
				}]
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-typescript');

	grunt.registerTask('default', ['typescript', 'concat', 'uglify', 'sass', 'watch']);
};
