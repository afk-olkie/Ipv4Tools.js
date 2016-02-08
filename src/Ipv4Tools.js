(function () {
    "use strict";

    //ensure that there is a console.log function of some kind
    var console = window.console || { log : function () {} };

    /**
     * Ipv4Tools class constructor
     *
     * Uses a very simple regex for finding IPv4 addresses.
     * @constructor
     */
    window.Ipv4Tools = function () {};
    var Ipv4Tools = window.Ipv4Tools;

    //define variables in prototype that can be overriden per object
    Ipv4Tools.prototype.log = console.log;
    Ipv4Tools.prototype.enableDebugExceptions = false;

    //define a very simple regex for finding IPv4 addresses
    var rePreGuard = /(?:^|\s|[^.0-9a-zA-Z])/;
    var rePostGuard = /(?=[^.\da-zA-Z]|$|.(?:\s|$))/;
    var reOctets = /((\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3}))/;

    //DO NOT use 'g' flag for regex objects shared up in Class prototype! Will affect all instances using them.
    //has to have "[\s\S]*?" at start so that we can figure out where match ends (not using 'g' flag).
    //Could also remove these restrictions if we just moved the regex out of the prototype.
    //would also be better to not capture everything leading up to match if searching in large strings.
    //TODO: reconsider regex in prototype
    Ipv4Tools.prototype.ipv4Regex = new RegExp("[\\s\\S]*?" + rePreGuard.source + reOctets.source + rePostGuard.source, "");
    Ipv4Tools.prototype.ipv4AndTrailingLineRegex = new RegExp("[\\s\\S]*?" + rePreGuard.source + reOctets.source + rePostGuard.source + "(.*)", "");

    /**
     * Finds and sorts IPv4 addresses (including trailing string if desired)
     *
     * This is just a convienience function combining two separate functions in this class.
     *
     * @param {string} haystack   A string containing IPv4 addresses.
     *
     * @param {boolean} captureRestOfLine  If true, it will capture the rest of the line after an IPv4 match.
     *                    This could be useful for keeping the subnet info or other notes with the IP.
     *                     Ex: "192.168.100.0/24" or "192.168.100.1 MY NOTES"
     *
     * @return {string[]} - an array of sorted IPv4 address strings and possible trailing string
     */
    Ipv4Tools.prototype.findAndSortIpv4 = function (haystack, captureRestOfLine) {
        var ips;
        ips = this.findIpv4Addresses(haystack, captureRestOfLine);
        ips = this.sortIpv4Addresses(ips);
        return ips;
    };

    /**
     * Finds IP addresses (including trailing string if desired)
     *
     * @param {string} haystack   A string containing IPv4 addresses.
     * @param {boolean} captureRestOfLine  If true, it will capture the rest of the line after an IPv4 match.
     *                    This could be useful for keeping the subnet info or other notes with the IP.
     *                     Ex: "192.168.100.0/24" or "192.168.100.1 MY NOTES"
     *
     * @return {string[]} - an array of IPv4 address strings and possible trailing string
     */
    Ipv4Tools.prototype.findIpv4Addresses = function (haystack, captureRestOfLine) {
        var ipArray = [];
        var regex;

        //should we capture the rest of the line after an IP address match?
        if (captureRestOfLine === true) {
            regex = this.ipv4AndTrailingLineRegex;
        } else {
            regex = this.ipv4Regex;
        }

        //get all matches
        {
            //todo: make into generic regex function
            var subHaystack = haystack; //have to keep chopping haystack to make '^' match. Wish js regex had look behinds.
            var match = regex.exec(subHaystack);
            while (match !== null) {
                ipArray.push(match[1]);
                subHaystack = subHaystack.substring(match[0].length);
                match = regex.exec(subHaystack);
            }
        }

        //throw exception if no matches and debugging
        if (ipArray.length === 0 && this.enableDebugExceptions) {
            var msg = "Failed to find IP address in 'haystack'";
            this.log(msg);
            this.log("Original input:", haystack);
            this.log("Regex:", regex);
            throw msg + ". See console.";
        }

        //return an empty array if no matches
        ipArray = ipArray || [];

        return ipArray;
    };

    /**
     * Sorts IPv4 addresses (including any trailing string) in an array.
     *
     * @param {string[]} ipArray   an array of IPv4 addresses (can include more text after IPv4).
     */
    Ipv4Tools.prototype.sortIpv4Addresses = function (ipArray) {
        var self = this; //required for nested compare function

        //now sort the array
        ipArray = ipArray.sort(function (ip1, ip2) {
                var result = 0;
                var ip1Match = self.ipv4Regex.exec(ip1); //could also use the split method with a limit set
                var ip2Match = self.ipv4Regex.exec(ip2);

                if (ip1Match === null || ip2Match === null) {
                    var msg = "Failed finding IP address during sort.";
                    self.log(msg);
                    self.log("debug info: ", {
                        ip1 : ip1,
                        ip2 : ip2,
                        ip1Match : ip1Match,
                        ip2Match : ip2Match
                    });
                    throw msg + " See console.";
                }

                var index = 2; //start at 2 for first regex group for 1st octet
                while (result === 0 && index < ip1Match.length) {
                    result = ip1Match[index] - ip2Match[index];
                    index++;
                }

                //if no difference found yet, compare result based on entire match
                if (result === 0) {
                    result = self.stringCompare(ip1Match[0], ip2Match[0]);
                }

                return result;
            });

        return ipArray;
    };

    /**
     * Very simple string compare function.
     * Why not use localeCompare? very slow and spotty browser support
     *
     * @param {string} a   first string to compare
     * @param {string} b   second string to compare
     * @return {int}   -1 if a < b, +1 if a > b, or 0 if equal
     */
    Ipv4Tools.prototype.stringCompare = function (a, b) {
        var result;

        //could rewrite as result = (a>b)? +1: (a<b)? -1: 0;
        if (a > b) {
            result = +1;
        } else if (a < b) {
            result = -1;
        } else {
            result = 0;
        }
        return result;
    };

})();

window.ipv4Tools = new Ipv4Tools();

var output = ipv4Tools.findAndSortIpv4(input);
console.log(output.join("\n"));
