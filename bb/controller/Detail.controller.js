sap.ui.define([
    "encollab/dp/bb/controller/App.controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function(Controller, Filter, FilterOperator, MessageBox, MessageToast) {
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
        isChangeable: function(SOStatus) {
            return SOStatus === 'INP' ? true : false;
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
            this._oDialog = sap.ui.xmlfragment("encollab.dp.view.common.itemDeleteDialog", this);
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
            var basketTotal = 0;
            var aItems = this.myView.byId('itemsTable').getItems();
            for (var i = 0; i < aItems.length; i++) {
                var oItem = aItems[i].getBindingContext().getObject();
                var price = oItem.UnitPrice;
                var qty = oItem.Quantity;
                var disc = oItem.Discount;
                var itemPrice = (price*qty)*(1-disc);
                basketTotal = basketTotal + itemPrice;
            }

            this.myView.byId('headerId').setNumber('$'+Number(basketTotal.toFixed(2)));

            this.myView.setBusy(false);
        },
        onNavBack: function() {
            Controller.prototype.onNavBack.apply(this, ["order"]);
        }
    });
});