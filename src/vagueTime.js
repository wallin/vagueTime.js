/**
 * This module contains functionality that allows a precise timestamp
 * to be converted to a vague time, e.g. '3 weeks ago', 'just now' or
 * 'in 2 hours'.
 */

 /*globals exports, window */

(function () {
    'use strict';

    var times = {
        year: 31557600000, // 1000 ms * 60 s * 60 m * 24 h * 365.25 d
        month: 2629800000, // 31557600000 ms / 12 m
        week: 604800000, // 1000 ms * 60 s * 60 m * 24 h * 7 d
        day: 86400000, // 1000 ms * 60 s * 60 m * 24 h
        hour: 3600000, // 1000 ms * 60 s * 60 m
        minute: 60000 // 1000 ms * 60 s
    };

    if (exports) {
        exports.get = getVagueTime;
    } else {
        window.vagueTime = {
            get: getVagueTime
        };
    }

    /**
     * Public function `get`.
     *
     * Returns a vague time, such as '3 weeks ago', 'just now' or
     * 'in 2 hours', based on a precise timestamp and an optional
     * reference timestamp.
     *
     * @option from {number}    The timestamp to convert to vague time.
     * @option [until] {number} The optional reference timestamp from
     *                          which to calculate the vague time,
     *                          defaults to `Date.now()`.
     * @option [units] {string} The units the timestamps are measured
     *                          in, either 's' for seconds or 'ms' for
     *                          milliseconds, defaults to 's'.
     */
    function getVagueTime (options) {
        var units = normaliseUnits(options.units),
            from = normaliseTimestamp(options.from, units),
            until = normaliseTimestamp(options.until, units, Date.now()),
            difference, format, fallback, time, vagueTime;

        difference = until - from;

        if (difference > 0) {
            format = formatPast;
            fallback = 'just now';
        } else {
            difference = -difference;
            format = formatFuture;
            fallback = 'now';
        }

        for (time in times) {
            if (times.hasOwnProperty(time) && difference >= times[time]) {
                vagueTime = Math.floor(difference / times[time]);
                return format(vagueTime, pluraliseNoun(time, vagueTime));
            }
        }

        return fallback;
    }

    function normaliseUnits (units) {
        if (typeof units === 'undefined') {
            return 's';
        }

        if (units === 's' || units === 'ms') {
            return units;
        }

        throw new Error('Invalid units');
    }

    function normaliseTimestamp (time, units, defaultTime) {
        if (typeof time === 'undefined' && typeof defaultTime === 'number') {
            return defaultTime;
        }

        if (typeof time === 'string') {
            time = parseInt(time, 10);
        }

        if (typeof time !== 'number' || isNaN(time)) {
            throw new Error('Invalid timestamp');
        }

        if (units === 's') {
            return time * 1000;
        }

        return time;
    }

    function pluraliseNoun (noun, amount) {
        return noun + (amount > 1 ? 's' : '');
    }

    function formatPast (vagueTime, unit) {
        return vagueTime + ' ' + unit + ' ago';
    }

    function formatFuture (vagueTime, unit) {
        return 'in ' + vagueTime + ' ' + unit;
    }
}());

