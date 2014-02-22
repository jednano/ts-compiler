/// <reference path="node_modules/typescript-api/typescript-api.d.ts" />


declare module "ts-compiler" {
	import ts = require('typescript-api');
	import events = require('events');
	
	export function compile(files: string[], callback?: Function): void;
	export function compile(files: string[], options?: any, callback?: Function): void;
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
	export class BatchCompiler extends events.EventEmitter {
		private _skipWrite;
		private _compiler;
		constructor();
		private redirectErrors();
		public compile(files: string[], callback?: Function): BatchCompiler;
		public compile(files: string[], options?: any, callback?: Function): BatchCompiler;
		private _batchCompile(callback);
		private _compile(callback);
	}
	export class OutputFile extends ts.OutputFile {
	}
}
