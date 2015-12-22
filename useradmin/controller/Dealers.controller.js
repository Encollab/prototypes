/*global history */
sap.ui.define([
    "encollab/dp/useradmin/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/Device",
    "encollab/dp/useradmin/model/formatter",
    "encollab/dp/useradmin/model/grouper",
    "encollab/dp/useradmin/model/GroupSortState"
], function(BaseController, JSONModel, Filter, FilterOperator, Device, formatter, grouper, GroupSortState) {
    "use strict";

    return BaseController.extend("encollab.dp.useradmin.controller.Dealers", {

        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        /**
         * Called when the master list controller is instantiated. It sets up the event handling for the master/detail communication and other lifecycle tasks.
         * @public
         */
        onInit: function() {
            // Control state model
            var oList = this.byId("list");

            this._oList = oList;

            this.getView().addEventDelegate({
                onBeforeFirstShow: function() {
                    this.getOwnerComponent().oListSelector.setBoundMasterList(oList);
                }.bind(this)
            });

            this.getRouter().getRoute("dealers").attachPatternMatched(this._onDealersMatched, this);
            this.getRouter().attachBypassed(this.onBypassed, this);

        },

        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */

        /**
         * Event handler for the list selection event
         * @param {sap.ui.base.Event} oEvent the list selectionChange event
         * @public
         */
        onSelectionChange: function(oEvent) {
            // get the list item, either from the listItem parameter or from the event's source itself (will depend on the device-dependent mode).
            this._showDetail(oEvent.getParameter("listItem") || oEvent.getSource());
        },

        /**
         * Event handler for the bypassed event, which is fired when no routing pattern matched.
         * If there was an object selected in the master list, that selection is removed.
         * @public
         */
        onBypassed: function() {
            this._oList.removeSelections(true);

            fnSetAppNotBusy;
        },


        /* =========================================================== */
        /* begin: internal methods                                     */
        /* =========================================================== */


        _createViewModel: function() {
            return new JSONModel({
                isFilterBarVisible: false,
                filterBarLabel: "",
                delay: 0,
                title: this.getResourceBundle().getText("vehicleMasterTitleCount", [0]),
                noDataText: this.getResourceBundle().getText("vehicleMasterListNoDataText"),
                sortBy: "Name",
                groupBy: "None"
            });
        },

        /**
         * If the master route was hit (empty hash) we have to set
         * the hash to to the first item in the list as soon as the
         * listLoading is done and the first item in the list is known
         * @private
         */
        _onDealersMatched: function() {
            this._setNotBusy();
        },

        _setNotBusy: function(oEvent) {
            var oViewModel = this.getModel("appView");
            oViewModel.setProperty("/busy", false);
            var oApp = this.getApp();
        },
        /**
         * Shows the selected item on the detail page
         * On phones a additional history entry is created
         * @param {sap.m.ObjectListItem} oItem selected Item
         * @private
         */
        _showDetail: function(oItem) {
            var bReplace = !Device.system.phone;
            this.getRouter().navTo("users", {
                dealer: oItem.getBindingContext().getProperty("dealerId")
            }, bReplace);
        },

    });

});