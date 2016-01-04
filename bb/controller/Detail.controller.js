sap.ui.define([
    "encollab/dp/bb/controller/App.controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "encollab/dp/bb/control/ColumnListItem",
], function(Controller, Filter, FilterOperator, MessageBox, MessageToast, ColumnListItem) {
    "use strict";
    return Controller.extend("encollab.dp.bb.controller.Detail", {
        _oDialog: null,
        onInit: function() {
            Controller.prototype.onInit.apply(this, arguments);

            this.myRouter.getRoute("detail").attachPatternMatched(this._onObjectMatched, this);
        },
        _onObjectMatched: function(oEvent) {
            this.myView.bindElement({
                path: "/" + oEvent.getParameter("arguments").objectId
                    // parameters: {
                    //     expand: 'Order_Details'
                    // }
            });
        },
        isChangeable: function(Status) {
            if (
                Status !== null &&
                this.myView.getBindingContext() &&
                this.myView.getBindingContext().getObject()
            ) {
                var oData = this.myView.getBindingContext().getObject();
                return oData.Status === 'Open' ? true : false;
            }
            return false;

        },
        isReady: function(Status) {
            if (
                Status !== null &&
                this.myView.getBindingContext() &&
                this.myView.getBindingContext().getObject()
            ) {
                var oOrder = this.myView.getBindingContext().getObject();
                return (Status === 'Open' && oOrder.OrderAllowance >= oOrder.OrderTotal);
            }
            return false;
        },
        allocationStateCheck: function(val) {
            if (
                val !== null &&
                this.myView.getBindingContext() &&
                this.myView.getBindingContext().getObject()
            ) {
                var oOrder = this.myView.getBindingContext().getObject();
                return oOrder.OrderAllowance >= oOrder.OrderTotal ? 'Success' : 'Error';
            }
            return 'None';

        },
        itemDeletable: function(HgrLvlItemInBOM) {
            var oOrder = this.myView.getBindingContext().getObject();
            return oOrder ? oOrder.SOStatus === 'INP' && HgrLvlItemInBOM === '000000' : false;
        },
        onCustPOPressed: function(oEvent) {
            // create dialog
            this._oDialog = sap.ui.xmlfragment("encollab.dp.view.partsOrder.custPODialog", this);
            this._oDialog.bindElement({
                path: oEvent.getSource().getBindingContext().getPath()
            });
            this.myView.addDependent(this._oDialog);
            this._oDialog.open();
        },
        onCustPODialogConfirm: function(oEvent) {
            var oCustPO = this._findElementIn('custPOTextArea', this._oDialog.findElements(true));

            var sPath = oEvent.getSource().getBindingContext().getPath();
            this.onDialogCancel(oEvent);
            this.busyDialog.open();

            this.mainModel.update(sPath, {
                'CustomerPONr': oCustPO.getValue()
            }, {
                merge: true,
                success: jQuery.proxy(function(odata, response) {
                    this.busyDialog.close();
                }, this),
                error: jQuery.proxy(function(oError) {
                    this.busyDialog.close();
                    this.gatewayError(oError);
                }, this)
            });
        },
        onItemPress: function(oEvent) {
            var oItem = oEvent.getSource().getBindingContext().getObject();
            if (oItem) {
                if (!this._oMaterialPopover) {
                    this._oMaterialPopover = sap.ui.xmlfragment("encollab.dp.view.partsOrder.MaterialPopover", this);
                    this.myView.addDependent(this._oMaterialPopover);
                }
                this._oMaterialPopover.bindElement({
                    path: "/Materials('" + oItem.Material + "')",
                    parameters: {
                        expand: 'MatPrices'
                    }
                });
                this._oMaterialPopover.openBy(oEvent.getSource());
            }
        },
        materialPopoverGo: function(oEvent) {
            this.materialPopoverClose();
            var oItem = oEvent.getSource();
            if (oItem) {
                this.myRouter.navTo("partsdetail", {
                    materialPath: oItem.getBindingContext().getPath().substr(1)
                });
            }
        },
        materialPopoverClose: function(oEvent) {
            this._oMaterialPopover.close();
        },
        onDialogCancel: function(oEvent) {
            this._oDialog.close().destroy();
        },
        onItemAdd: function(oEvent) {
            // create dialog
            this._oDialog = sap.ui.xmlfragment("encollab.dp.view.common.addMaterialDialog", this);
            this._oDialog.bindElement({
                path: oEvent.getSource().getBindingContext().getPath()
            });
            this.myView.addDependent(this._oDialog);
            this._oDialog.open();
        },
        onAddMaterialSearch: function(oEvent) {
            var oList = this._findElementIn('addMaterialList', this._oDialog.findElements(true));

            var filters = [];
            var searchString = oEvent.getSource().getValue();

            if (searchString && searchString.length > 0) {

                filters = [
                    new Filter("MaterialDescUpper", FilterOperator.Contains, searchString.toUpperCase()),
                    new Filter("MaterialNr", FilterOperator.Contains, searchString.toUpperCase())
                ];

                oList.bindItems({
                    path: "/Materials",
                    parameters: {
                        select: "MaterialNr,MatlDesc"
                    },
                    template: sap.ui.xmlfragment("encollab.dp.view.common.addMaterialTemplate"),
                    filters: [
                        new Filter("SalesOrg", FilterOperator.EQ, this.myComponent.getMySettingValue('VKO')),
                        new Filter(filters, false)
                    ]
                });
            }
        },
        onAddMaterialSelect: function(oEvent) {
            var oListItem;
            if (oEvent.sId === 'updateFinished') {
                if (oEvent.getSource().getItems().length === 1) {
                    oListItem = oEvent.getSource().getItems()[0];
                } else {
                    return;
                }
            } else {
                oListItem = oEvent.getParameter('listItem');
            }

            var oOrder = this.myView.getBindingContext().getObject();

            var mPayload = {
                OrderNr: oOrder.OrderNr,
                Material: oListItem.getDescription(),
                TrgtQtyInSalesUnits: '1',
                TrgtQtyUOM: 'EA'
            };
            this.onDialogCancel(oEvent);
            this.busyDialog.open();

            this.mainModel.create("/SOItems", mPayload, {
                success: jQuery.proxy(function(odata, response) {
                    this.busyDialog.close();
                }, this),
                error: jQuery.proxy(function(oError) {
                    this.busyDialog.close();
                    this.gatewayError(oError);
                }, this)
            });
        },
        onItemDelete: function(oEvent) {
            // create dialog
            this._oDialog = sap.ui.xmlfragment("encollab.dp.bb.view.itemDeleteDialog", this);
            this._oDialog.bindElement({
                path: oEvent.getSource().getBindingContext().getPath()
            });
            this.myView.addDependent(this._oDialog);
            this._oDialog.open();
        },
        onDeleteDialogConfirm: function(oEvent) {
            // get texts
            var successMsg = this.getText("deleteItemDialogSuccessMsg");

            var sPath = oEvent.getSource().getBindingContext().getPath();
            this.onDialogCancel(oEvent);
            this.busyDialog.open();
            this.mainModel.remove(sPath, {
                success: jQuery.proxy(function(odata, response) {
                    this.busyDialog.close();
                    MessageToast.show(successMsg);
                    this.mainModel.refresh();
                }, this),
                error: jQuery.proxy(function(oError) {
                    this.busyDialog.close();
                    this.gatewayError(oError);
                }, this)
            });
        },
        onChangeItemQty: function(oEvent) {
            // create dialog
            this._oDialog = sap.ui.xmlfragment("encollab.dp.view.partsOrder.changeQtyDialog", this);
            this._oDialog.bindElement({
                path: oEvent.getSource().getBindingContext().getPath()
            });
            this.myView.addDependent(this._oDialog);
            this._oDialog.open();
        },
        onQtyLiveChange: function(oEvent) {
            var newValue = oEvent.getParameter('newValue');
            if (newValue[newValue.length - 1] === '.') {
                oEvent.getSource().setValue(newValue.slice(0, -1));
                return;
            }
            var oConfirm = this._findElementIn('confirmButton', this._oDialog.getButtons());
            if (newValue > 0) {
                oConfirm.setEnabled(true);
                oEvent.getSource().removeStyleClass('qtyError');
            } else {
                oConfirm.setEnabled(false);
                oEvent.getSource().addStyleClass('qtyError');
            }
        },
        onQtyDialogConfirm: function(oEvent) {
            var oInput = this._findElementIn('newQty', this._oDialog.findElements(true));
            var sPath = oEvent.getSource().getBindingContext().getPath();

            this.onDialogCancel(oEvent);
            this.busyDialog.open();

            this.mainModel.update(sPath, {
                'TrgtQtyInSalesUnits': oInput.getValue()
            }, {
                merge: true,
                success: jQuery.proxy(function(odata, response) {
                    this.busyDialog.close();
                    this.mainModel.refresh();
                }, this),
                error: jQuery.proxy(function(oError) {
                    this.busyDialog.close();
                    this.gatewayError(oError);
                }, this)
            });
        },
        onUpload: function(oEvent) {
            this._oDialog = sap.ui.xmlfragment("encollab.dp.bb.view.uploadDialog", this);
            this.myView.addDependent(this._oDialog);
            // this._oDialog.bindElement({
            //     path: this.myView.getBindingContext().getPath()
            // });
            this._oDialog.open();
        },
        onUploadDialogConfirm: function(oEvent) {
            this.onDialogCancel(oEvent);
            this.busyDialog.open();
            this._addUploadItems();

        },
        _addUploadItems: function() {
            this.errorMessage('BADMAT1 Invalid!', 'Material BADMAT1 not found');
            this.errorMessage('BADMAT2 Invalid!', 'Material BADMAT2 not found');

            this.warningMessage('Material 101 has warnings', 'Material 101-Warning Material 2 has correctable issues');

            this.addItem({
                    "BBOrderID": 10273,
                    "PartName": "Good Material 1",
                    "PartID": 100,
                    "BuyBackPrice": "12.4000",
                    "Quantity": 5,
                    "UOM": "Each",
                    "Status": "Ok"
                },
                jQuery.proxy(function(odata, response) {
                    this.addItem({
                            "BBOrderID": 10273,
                            "PartName": "Warning Material 2",
                            "PartID": 101,
                            "BuyBackPrice": "8.00",
                            "Quantity": 2,
                            "UOM": "Each",
                            "Status": "Invalid"
                        },
                        jQuery.proxy(function(odata, response) {
                            this.addItem({
                                "BBOrderID": 10273,
                                "PartName": "Good Material 3",
                                "PartID": 102,
                                "BuyBackPrice": "8.45",
                                "Quantity": 3,
                                "UOM": "Each",
                                "Status": "Ok"
                            });
                        }, this));
                }, this)
            );

        },
        addItem: function(mPayload, success, error) {
            if (!success) {
                success = jQuery.proxy(function(odata, response) {
                    this.busyDialog.close();
                }, this);
            }
            if (!error) {
                error = jQuery.proxy(function(oError) {
                    this.busyDialog.close();
                    this.gatewayError(oError);
                }, this);
            }
            this.mainModel.create("/BBOrderItems", mPayload, {
                success: success,
                error: error
            });
        },

        // var oTable = this.myView.byId('bbTable');
        // oTable.addItem(
        //     new ColumnListItem({
        //         role: 'BB',
        //         type: 'Active',
        //         press: this.onItemPress,
        //         cells: [
        //             new ObjectIdentifier({
        //                 title: 'WARNMAT1'
        //             }),
        //             new ObjectIdentifier({
        //                 text: 'Warning Material 1'
        //             }),
        //             new sap.m.ObjectAttribute({
        //                 text: "5 EA",
        //                 active: true,
        //                 press: this.onChangeItemQty
        //             }),
        //             new ObjectIdentifier({
        //                 text: '$ 13.00'
        //             }),
        //             new ObjectIdentifier({
        //                 text: '$ 12.00'
        //             }),
        //             new sap.m.ObjectAttribute({
        //                 text: "Not Valid"
        //             }),
        //             new ObjectIdentifier({
        //                 text: ' '
        //             }),
        //             new Button({
        //                 icon: "sap-icon://delete",
        //                 press: $.proxy(this.onItemDelete, this)
        //             })
        //         ]
        //     }));
        // this.warningMessage('WARNMAT1 has warnings', 'Material WARNMAT1 has correctable issues');
        onOrderDelete: function(oEvent) {
            // create dialog
            this._oDialog = sap.ui.xmlfragment("encollab.dp.view.partsOrder.orderDeleteDialog", this);
            this._oDialog.bindElement({
                path: oEvent.getSource().getBindingContext().getPath()
            });
            this.myView.addDependent(this._oDialog);
            this._oDialog.open();
        },
        onDeleteOrderDialogConfirm: function(oEvent) {
            // get texts
            var successMsg = this.getText("deleteOrderDialogSuccessMsg");

            this.onDialogCancel(oEvent);
            this.busyDialog.open();
            this.mainModel.remove(this.myView.getBindingContext().getPath(), {
                success: jQuery.proxy(function(odata, response) {
                    this.busyDialog.close();
                    MessageToast.show(successMsg);
                    this.onNavBack();
                }, this),
                error: jQuery.proxy(function(oError) {
                    this.busyDialog.close();
                    this.gatewayError(oError);
                }, this)
            });
        },
        onOrderSubmit: function(oEvent) {
            // create dialog
            this._oDialog = sap.ui.xmlfragment("encollab.dp.view.partsOrder.orderSubmitDialog", this);
            this._oDialog.bindElement({
                path: oEvent.getSource().getBindingContext().getPath()
            });
            this.myView.addDependent(this._oDialog);
            this._oDialog.open();
        },
        onSubmitOrderDialogConfirm: function(oEvent) {
            // get texts
            var successMsg = this.getText("submitPODialogSuccessMsg");

            this.onDialogCancel(oEvent);
            this.busyDialog.open();
            this.mainModel.update(this.myView.getBindingContext().getPath(), {
                'SOStatus': 'SUB'
            }, {
                merge: true,
                success: jQuery.proxy(function(odata, response) {
                    this.busyDialog.close();
                    MessageToast.show(successMsg);
                }, this),
                error: jQuery.proxy(function(oError) {
                    this.busyDialog.close();
                    this.gatewayError(oError);
                }, this)
            });
        },
        onUpdateFinished: function(oEvent) {

            this.myView.setBusy(false);
        },
        onNavBack: function() {
            Controller.prototype.onNavBack.apply(this, ["order"]);
        }
    });
});