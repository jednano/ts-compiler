var Promise = (function () {
    function Promise(deferred) {
        this.deferred = deferred;
    }
    Promise.prototype.then = function (doneFilter, failFilter, progressFilter) {
        return this.deferred.then(doneFilter, failFilter, progressFilter).promise;
    };

    Promise.prototype.done = function () {
        var callbacks = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            callbacks[_i] = arguments[_i + 0];
        }
        return this.deferred.done.apply(this.deferred, callbacks).promise;
    };

    Promise.prototype.fail = function () {
        var callbacks = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            callbacks[_i] = arguments[_i + 0];
        }
        return this.deferred.fail.apply(this.deferred, callbacks).promise;
    };

    Promise.prototype.always = function () {
        var callbacks = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            callbacks[_i] = arguments[_i + 0];
        }
        return this.deferred.always.apply(this.deferred, callbacks).promise;
    };

    Object.defineProperty(Promise.prototype, "resolved", {
        get: function () {
            return this.deferred.resolved;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Promise.prototype, "rejected", {
        get: function () {
            return this.deferred.rejected;
        },
        enumerable: true,
        configurable: true
    });
    return Promise;
})();

module.exports = Promise;
