var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ts = require('typescript-api');
var P = require('promise-ts');
var Deferred = P.Deferred;

var glob = require('simple-glob');
var events = require('events');

function compile(files, options) {
    return new BatchCompiler().compile(files, options);
}
exports.compile = compile;

var BatchCompiler = (function (_super) {
    __extends(BatchCompiler, _super);
    function BatchCompiler() {
        _super.call(this);
        this._skipWrite = false;
        this.redirectErrors();
        this._compiler = new ts.BatchCompiler(ts.IO);
        process.mainModule.filename = require.resolve('typescript');
    }
    BatchCompiler.prototype.redirectErrors = function () {
        var _this = this;
        ts.IO.stderr.Write = function (s) {
            _this.emit('error', s);
        };
        ts.IO.stderr.WriteLine = function (s) {
            ts.IO.stderr.Write(s + '\n');
        };
        ts.IO.stdout.Write = function (s) {
            _this.emit('info', s);
        };
        ts.IO.stdout.WriteLine = function (s) {
            ts.IO.stdout.Write(s + '\n');
        };
        ts.BatchCompiler.prototype.addDiagnostic = function (diagnostic) {
            var diagnosticInfo = diagnostic.info();
            if (diagnosticInfo.category === 1) {
                this.hasErrors = true;
            }
            var errorLocation = '';
            if (diagnostic.fileName()) {
                errorLocation = diagnostic.fileName() + "(" + (diagnostic.line() + 1) + "," + (diagnostic.character() + 1) + "): ";
            }
            this.ioHost.stderr.WriteLine(errorLocation + diagnostic.message());
        };
    };

    BatchCompiler.prototype.compile = function (files, options) {
        var _this = this;
        var compiling = new Deferred();
        handleSkipWrite.call(this);
        setupArguments().done(function (args) {
            ts.IO.arguments = args;
            _this._batchCompile().done(function (results) {
                compiling.resolve(results);
            });
        });
        return compiling.promise;

        function handleSkipWrite() {
            options = options || {};
            this._skipWrite = options.skipWrite;
            delete options.skipWrite;
        }

        function setupArguments() {
            var unglobbing = new Deferred();
            setTimeout(function () {
                var args = argify(options);
                args.push.apply(args, glob(files));
                unglobbing.resolve(args);
            });
            return unglobbing.promise;
        }
    };

    BatchCompiler.prototype._batchCompile = function () {
        var compiling = new Deferred();
        setTimeout(function () {
            var compiler = this._compiler;

            ts.CompilerDiagnostics.diagnosticWriter = { Alert: function (s) {
                    compiler.ioHost.printLine(s);
                } };

            if (compiler.parseOptions()) {
                compiler.logger = compiler.compilationSettings.gatherDiagnostics() ? new DiagnosticsLogger(this.ioHost) : new ts.NullLogger();

                if (compiler.compilationSettings.watch()) {
                    compiler.watchFiles();
                    compiling.resolve();
                    return;
                }

                compiler.resolve();
                this._compile().then(function (callbacks) {
                    compiling.resolve(callbacks);
                }, function () {
                    compiling.reject();
                });
            } else {
                compiling.reject();
            }

            if (compiler.hasErrors) {
                compiling.reject(1);
            }
        }.bind(this));
        return compiling.promise;
    };

    BatchCompiler.prototype._compile = function () {
        var compiling = new Deferred();
        setTimeout(function () {
            var compiler = this._compiler;
            var tsCompiler = new ts.TypeScriptCompiler(compiler.logger, compiler.compilationSettings);

            compiler.resolvedFiles.forEach(function (resolvedFile) {
                var sourceFile = compiler.getSourceFile(resolvedFile.path);
                tsCompiler.addFile(resolvedFile.path, sourceFile.scriptSnapshot, sourceFile.byteOrderMark, 0, false, resolvedFile.referencedFiles);
            });

            var results = [];
            for (var it = tsCompiler.compile(function (path) {
                return compiler.resolvePath(path);
            }); it.moveNext();) {
                var result = it.current();

                result.diagnostics.forEach(function (d) {
                    return compiler.addDiagnostic(d);
                });
                if (!this._skipWrite && !compiler.tryWriteOutputFiles(result.outputFiles)) {
                    compiling.reject();
                }
                Array.prototype.push.apply(results, result.outputFiles);
            }
            compiling.resolve(results);
        }.bind(this));
        return compiling.promise;
    };
    return BatchCompiler;
})(events.EventEmitter);
exports.BatchCompiler = BatchCompiler;

var DiagnosticsLogger = (function () {
    function DiagnosticsLogger(ioHost) {
        this.ioHost = ioHost;
    }
    DiagnosticsLogger.prototype.information = function () {
        return false;
    };
    DiagnosticsLogger.prototype.debug = function () {
        return false;
    };
    DiagnosticsLogger.prototype.warning = function () {
        return false;
    };
    DiagnosticsLogger.prototype.error = function () {
        return false;
    };
    DiagnosticsLogger.prototype.fatal = function () {
        return false;
    };
    DiagnosticsLogger.prototype.log = function (s) {
        this.ioHost.stdout.WriteLine(s);
    };
    return DiagnosticsLogger;
})();

function argify(options) {
    var args = [];
    Object.keys(options).forEach(function (key) {
        var value = options[key];
        if (!value) {
            return;
        }
        if (key === 'optionsFile') {
            args.push('@' + value);
            return;
        }
        var flag = '-';
        if (key.length !== 1) {
            flag += '-';
        }
        args.push(flag + key);
        if (typeof value !== 'boolean') {
            args.push(value);
        }
    });
    return args;
}

var OutputFile = (function (_super) {
    __extends(OutputFile, _super);
    function OutputFile() {
        _super.apply(this, arguments);
    }
    return OutputFile;
})(ts.OutputFile);
exports.OutputFile = OutputFile;
