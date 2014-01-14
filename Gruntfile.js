module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: ['test/**/*.js'],
		typescript: {
			options: {
				module: 'commonjs',
				target: 'es5'
			},
			dist: {
				options: {
					declaration: true
				},
				src: ['ts-compiler.ts'],
				dest: ''
			},
			test: {
				src: ['test/*.ts'],
				dest: ''
			}
		},
		mochaTest: {
			test: {
				options: {
					reporter: 'spec',
					clearRequireCache: true
				},
				src: ['test/ts-compiler.js']
			}
		},
		watch: {
			ts: {
				files: '**/*.ts',
				tasks: ['test']
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-typescript');

	grunt.registerTask('default', ['test', 'watch']);
	grunt.registerTask('test', ['build', 'mochaTest', 'clean']);
	grunt.registerTask('build', ['clean', 'typescript']);

};
