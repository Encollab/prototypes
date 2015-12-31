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
        _statusStateMap: {
            "INP": "Error",
            "SUB": "Success"
        },

        SOStatusState: function(value) {
            return (value && this.formatter._statusStateMap[value]) ? this.formatter._statusStateMap[value] : "None";
        },
        calcPrice: function(price, qty, discount) {
            return parseFloat(price * qty * (1 - discount)).toFixed(2);
        },
        totalBasket: function(items) {
            if (!items || !items.push) return 0;
            var total = 0;
            for (var i = 0; i < items.length; i++) {
                total = total + parseFloat(items[i].UnitPrice * items[i].Quantity * (1 - items[i].Discount)).toFixed(2);
            }
            return total;
        }

    };

});