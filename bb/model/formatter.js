sap.ui.define([], function() {
    "use strict";

    return {
        /**
         * Rounds the currency value to 2 digits
         *
         * @public
         * @param {string} sValue value to be formatted
         * @returns {string} formatted currency value with 2 digits
         */
        currencyValue: function(sValue) {
            if (!sValue) {
                return "";
            }

            return parseFloat(sValue).toFixed(2);
        },
        Number: function(value) {
            return isNaN(value) ? value : Number(value);
        },
        Date: function(value) {
            if (value) {
                var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
                    pattern: "E dd MMMM yyyy" //"dd-MM-yyyy"
                });
                return oDateFormat.format(new Date(value));
            } else {
                return value;
            }
        },
        exists: function(object) {
            return object ? true : false;
        },
        _statusStateMap: {
            "INP": "Error",
            "SUB": "Success"
        },

        SOStatusState: function(value) {
            return (value && this.formatter._statusStateMap[value]) ? this.formatter._statusStateMap[value] : "None";
        },
        calcPrice: function(price, qty) {
            return parseFloat(price * qty).toFixed(2);
        }

    };

});