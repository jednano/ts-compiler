var Deferred = require('./Deferred');
var Promise = require('./Promise');

var when = function () {
    var args = [];
    for (var _i = 0; _i < (arguments.length - 0); _i++) {
        args[_i] = arguments[_i + 0];
    }
    if (args.length === 1) {
        var arg = args[0];
        if (arg instanceof Deferred) {
            return arg.promise;
        }
        if (arg instanceof Promise) {
            return arg;
        }
    }
    var done = new Deferred();
    if (args.length === 1) {
        done.resolve(args[0]);
        return done.promise;
    }
    var pending = args.length;
    var results = [];
    var onDone = function () {
        var resultArgs = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            resultArgs[_i] = arguments[_i + 0];
        }
        results.push(resultArgs);
        if (--pending === 0) {
            done.resolve.apply(done, results);
        }
    };
    var onFail = function () {
        done.reject();
    };
    args.forEach(function (a) {
        a.then(onDone, onFail);
    });
    return done.promise;
};

module.exports = when;
