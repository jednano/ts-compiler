var Promise = require('./Promise');

var Deferred = (function () {
    function Deferred() {
        this.doneCallbacks = [];
        this.failCallbacks = [];
        this.progressCallbacks = [];
        this._promise = new Promise(this);
        this._state = 'pending';
    }
    Object.defineProperty(Deferred.prototype, "promise", {
        get: function () {
            return this._promise;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Deferred.prototype, "state", {
        get: function () {
            return this._state;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Deferred.prototype, "rejected", {
        get: function () {
            return this.state === 'rejected';
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Deferred.prototype, "resolved", {
        get: function () {
            return this.state === 'resolved';
        },
        enumerable: true,
        configurable: true
    });

    Deferred.prototype.resolve = function () {
        var args = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            args[_i] = arguments[_i + 0];
        }
        args.unshift(this);
        return this.resolveWith.apply(this, args);
    };

    Deferred.prototype.resolveWith = function (context) {
        var args = [];
        for (var _i = 0; _i < (arguments.length - 1); _i++) {
            args[_i] = arguments[_i + 1];
        }
        this._result = args;
        this.doneCallbacks.forEach(function (callback) {
            callback.apply(context, args);
        });
        this.doneCallbacks = [];
        this._state = 'resolved';
        return this;
    };

    Deferred.prototype.reject = function () {
        var args = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            args[_i] = arguments[_i + 0];
        }
        args.unshift(this);
        return this.rejectWith.apply(this, args);
    };

    Deferred.prototype.rejectWith = function (context) {
        var args = [];
        for (var _i = 0; _i < (arguments.length - 1); _i++) {
            args[_i] = arguments[_i + 1];
        }
        this.failCallbacks.forEach(function (callback) {
            callback.apply(context, args);
        });
        this.failCallbacks = [];
        this._state = 'rejected';
        return this;
    };

    Deferred.prototype.progress = function () {
        var callbacks = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            callbacks[_i] = arguments[_i + 0];
        }
        var _this = this;
        var d = new Deferred();
        if (this.resolved || this.rejected) {
            callbacks.forEach(function (callback) {
                callback.apply(_this._notifyContext, _this._notifyArgs);
            });
            return d;
        }
        callbacks.forEach(function (callback) {
            _this.progressCallbacks.push(_this.wrap(d, callback, d.notify));
        });
        this.checkStatus();
        return d;
    };

    Deferred.prototype.notify = function () {
        var args = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            args[_i] = arguments[_i + 0];
        }
        args.unshift(this);
        return this.notifyWith.apply(this, args);
    };

    Deferred.prototype.notifyWith = function (context) {
        var args = [];
        for (var _i = 0; _i < (arguments.length - 1); _i++) {
            args[_i] = arguments[_i + 1];
        }
        if (this.resolved || this.rejected) {
            return this;
        }
        this._notifyContext = context;
        this._notifyArgs = args;
        this.progressCallbacks.forEach(function (callback) {
            callback.apply(context, args);
        });
        return this;
    };

    Deferred.prototype.checkStatus = function () {
        if (this.resolved) {
            this.resolve.apply(this, this._result);
        } else if (this.rejected) {
            this.reject.apply(this, this._result);
        }
    };

    Deferred.prototype.then = function (doneFilter, failFilter, progressFilter) {
        var d = new Deferred();
        this.progressCallbacks.push(this.wrap(d, progressFilter, d.progress));
        this.doneCallbacks.push(this.wrap(d, doneFilter, d.resolve));
        this.failCallbacks.push(this.wrap(d, failFilter, d.reject));
        this.checkStatus();
        return this;
    };

    Deferred.prototype.wrap = function (d, f, method) {
        return function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            var result = f.apply(f, args);
            if (result && result instanceof Promise) {
                result.then(function () {
                    d.resolve();
                }, function () {
                    d.reject();
                });
            } else {
                method.apply(d, [result]);
            }
        };
    };

    Deferred.prototype.done = function () {
        var callbacks = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            callbacks[_i] = arguments[_i + 0];
        }
        var _this = this;
        var d = new Deferred();
        callbacks.forEach(function (callback) {
            _this.doneCallbacks.push(_this.wrap(d, callback, d.resolve));
        });
        this.checkStatus();
        return d;
    };

    Deferred.prototype.fail = function () {
        var callbacks = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            callbacks[_i] = arguments[_i + 0];
        }
        var _this = this;
        var d = new Deferred();
        callbacks.forEach(function (callback) {
            _this.failCallbacks.push(_this.wrap(d, callback, d.reject));
        });
        this.checkStatus();
        return d;
    };

    Deferred.prototype.always = function () {
        var callbacks = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            callbacks[_i] = arguments[_i + 0];
        }
        var _this = this;
        var d = new Deferred();
        callbacks.forEach(function (callback) {
            _this.doneCallbacks.push(_this.wrap(d, callback, d.resolve));
            _this.failCallbacks.push(_this.wrap(d, callback, d.reject));
        });
        this.checkStatus();
        return d;
    };
    return Deferred;
})();

module.exports = Deferred;
