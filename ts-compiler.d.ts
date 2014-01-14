/// <reference path="node_modules/typescript-api/typescript-api.d.ts" />
/// <reference path="node_modules/promise-ts/promise.d.ts" />

declare module "ts-compiler" {
	import ts = require('typescript-api');
	import P = require('promise-ts');

	export function compile(files: string[], options?: ICompilerOptions): P.Promise;

	export interface ICompilerOptions {
		declaration?: boolean;
		help?: boolean;
		mapRoot?: string;
		module?: string;
		noImplicitAny?: boolean;
		noResolve?: boolean;
		out?: string;
		outDir?: string;
		removeComments?: boolean;
		sourcemap?: boolean;
		sourceRoot?: string;
		target?: string;
		version?: string;
		watch?: boolean;
		optionsFile?: string;
		skipWrite?: boolean;
	}

	export class BatchCompiler extends ts.BatchCompiler {
		private _skipWrite;
		constructor();
		public compileFiles(globs: string[], options?: ICompilerOptions): P.Promise;
		private _batchCompile();
		private _compile();
	}

	export function argify(options: ICompilerOptions): string[];

	export class Logger implements ts.ILogger {
		public information(): boolean;
		public debug(): boolean;
		public warning(): boolean;
		public error(): boolean;
		public fatal(): boolean;
		public log(s: string): void;
	}

	export class OutputFile extends ts.OutputFile {
	}

}
