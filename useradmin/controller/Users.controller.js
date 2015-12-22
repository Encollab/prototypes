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

    return BaseController.extend("encollab.dp.useradmin.controller.Users", {

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

            this.getRouter().getRoute("users").attachPatternMatched(this._onUsersMatched, this);
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
        _onUsersMatched: function(oEvent) {
            this._setNotBusy();
            var sDealerPath = oEvent.getParameter("arguments").dealer;
            // this.getModel().metadataLoaded().then(function() {
            //     var sObjectPath = this.getModel().createKey("Vehicles", {
            //         VIN: sObjectId
            //     });
            //     this._bindView("/" + sObjectPath);
            // }.bind(this));

            this._bindView("/" + sDealerPath);
        },
        /**
         * Binds the view to the object path. Makes sure that detail view displays
         * a busy indicator while data for the corresponding element binding is loaded.
         * @function
         * @param {string} sObjectPath path to the object to be bound to the view.
         * @private
         */
        _bindView: function(sObjectPath) {
            // Set busy indicator during view binding
            var oViewModel = this.getModel("detailView");

            // If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
            oViewModel.setProperty("/busy", false);

            this.getView().bindElement({
                path: sObjectPath,
                // parameters: {
                //     expand: 'Dealer'
                // },
                events: {
                    change: this._onBindingChange.bind(this),
                    dataRequested: function() {
                        oViewModel.setProperty("/busy", true);
                    },
                    dataReceived: function() {
                        oViewModel.setProperty("/busy", false);
                    }
                }
            });
        },

        _onBindingChange: function() {
            var oView = this.getView(),
                oElementBinding = oView.getElementBinding();

            // No data for the binding
            if (!oElementBinding.getBoundContext()) {
                this.getRouter().getTargets().display("detailObjectNotFound");
                // if object could not be found, the selection in the master list
                // does not make sense anymore.
                this.getOwnerComponent().oListSelector.clearMasterListSelection();
                return;
            }

            var sPath = oElementBinding.getPath(),
                oResourceBundle = this.getResourceBundle(),
                oObject = oView.getModel().getObject(sPath),
                sObjectId = oObject.ObjectID,
                sObjectName = oObject.Name,
                oViewModel = this.getModel("detailView");

            this.getOwnerComponent().oListSelector.selectAListItem(sPath);

            var oTest = this.getView().byId('myTest2');
            if (oObject.DealerId !== '') {
                oTest.bindElement({
                    path: "/Dealer('" + oObject.DealerId + "')"
                });
            }
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