sap.ui.define([
    "encollab/dp/bb/controller/App.controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter"
], function(Controller, Filter, FilterOperator, Sorter) {
    "use strict";
    return Controller.extend("encollab.dp.bb.controller.Enquiry", {
        _userAuthorisations: ['PartOrders'],
        _userParameters: ['VKO', 'VTW'],
        onInit: function() {
            Controller.prototype.onInit.apply(this, arguments);
            this._performSearch("");
        },
        onSearchOrders: function(evt) {
            this._performSearch(evt.getSource().getValue() || "");
        },
        _performSearch: function(searchString) {
            var oList = this.getView().byId('ordersList');
            if(!oList) return;
            var filters = [];

            if (!this._oItemTemplate) {
                this._oItemTemplate = sap.ui.xmlfragment("encollab.dp.bb.view.OrderTemplate",this);
            }

            if (searchString.length > 0) {
                filters = new Filter([
                    new Filter("OrderID", FilterOperator.Contains, searchString.toUpperCase())
//                    new Filter("ShipAddr_Name1", FilterOperator.Contains, searchString.toUpperCase())
                ], false);
            } else {
                // filters = [
                //     new Filter("CreatedBy", FilterOperator.EQ, 'GRAHAMR' ) //this.myComponent.getMyId())
                // ];
            }

            oList.bindItems({
                path: "/Orders",
                // parameters: {
                //     select: "OrderID,OrderDate,OrderTypeDesc,SOStatus,SOStatusDesc,ShipAddr_Name1,NetValue,CustomerPONr"
                // },
                template: this._oItemTemplate,
                sorter: new Sorter("OrderDate", true),
                filters: filters
            });
        },
        onCreateOrder: function(oEvent) {
            this.myRouter.navTo("createorder");
        },
        authTest: function(value) {
            console.log('authTest');
            return false;
        },
        onPress: function(oEvent) {
            var oItem = oEvent.getSource();
            this.myRouter.navTo("detail", {
                objectId: oEvent.getParameter('listItem').getBindingContext().getPath().substr(1)
            });
            oItem.removeSelections();
        }
    });
});