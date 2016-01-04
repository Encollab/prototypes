sap.ui.define([
    "encollab/dp/bb/controller/BaseController",
    "sap/ui/core/UIComponent",
    "sap/ui/core/routing/History",
    "sap/ui/core/MessageType",
    "sap/m/MessageToast",
    "sap/m/ButtonType",
    "sap/m/BusyDialog",
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device",
    "encollab/dp/bb/model/formatter"
], function(Controller, UIComponent, History, MessageType, MessageToast, ButtonType, BusyDialog, JSONModel, Device, formatter) {
    "use strict";
    return Controller.extend("encollab.dp.bb.controller.App", {
        myComponent: null,
        myRouter: null,
        myView: null,
        mainModel: null,
        busyDialog: null,
        formatter: formatter,

        onInit: function() {
            Controller.prototype.onInit.apply(this, arguments);
            
            this.myComponent = this.getOwnerComponent();
            this.MessageToast = MessageToast;
            this.myRouter = UIComponent.getRouterFor(this);
            this.myView = this.getView();
            this.mainModel = this.myComponent.getModel();

            this._bundle = this.myComponent.getModel('i18n').getResourceBundle();

            // set device model
            var oDeviceModel = new JSONModel(Device);
            oDeviceModel.setDefaultBindingMode("OneWay");
            this.myComponent.setModel(oDeviceModel, "device");

            this.busyDialog = new BusyDialog();

            this.myView.addEventDelegate({
                onAfterRendering: $.proxy(this.onAfterViewRendered, this)
            });

            this.myView.addStyleClass(this.myComponent.getContentDensityClass());
            this.myView.setBusyIndicatorDelay(0);

            this.myComponent.resetMessagePopover();

            if (this.myView.getControllerName() !== 'encollab.dp.controller.App') {
                if (!this._checkUserSettings()) {
                    if (this.myView && this.myView.getContent && this.myView.getContent()[0] && this.myView.getContent()[0].destroyContent) {
                        this.myView.getContent()[0].destroyContent();
                    }
                }
            }

            this.mainModel.setUseBatch(false);

        },
        onAfterViewRendered: function(oEvent) {},
        onOpenInfoDialog: function() {
            this.myComponent.infoDialog.open(this.myView);
        },
        isUserAuthorised: function(auth) {
            return true; //this.myComponent.getMyAuthorisation(auth);
        },
        _findElementIn: function(id, arrayCtrls) { //Pass in an array of control and return element by id
            for (var i = 0; i < arrayCtrls.length; i++) {
                if (arrayCtrls[i].getId() === id) {
                    return arrayCtrls[i];
                }
            }
        },
        _checkUserAuthorisations: function(aAuths) {
            return true;
            var allOk = true;
            // 'Portal' is minimum authorisation required. We check this everytime.
            if (!this.isUserAuthorised('Portal')) {
                this.errorMessage('Portal', 'AuthCheck Failed');
                allOk = false;
            } else {
                //this.successMessage('Portal', 'AuthCheck Passed');
            }
            if (aAuths && aAuths.length) {
                for (var i = 0; i < aAuths.length; i++) {
                    if (!this.isUserAuthorised(aAuths[i])) {
                        this.errorMessage(aAuths[i], 'AuthCheck Failed');
                        allOk = false;
                    } else {
                        //this.successMessage(aAuths[i], 'AuthCheck Passed');
                    }
                }
            }
            return allOk;
        },
        _checkUserSettings: function() {
            return true;
            var allOk = true;
            allOk = this._checkUserAuthorisations(this._userAuthorisations);
            if (this._userParameters) {
                // This is where we check user parameters are maintained in SAP system
                var map = formatter.UserParamMap; //Texts map
                for (var j = 0; j < this._userParameters.length; j++) {
                    if (!this.myComponent.getMySettingValue(this._userParameters[j])) {
                        var paramName = map[this._userParameters[j]] ? map[this._userParameters[j]] : this._userParameters[j];
                        this.errorMessage(
                            'Parameter ' + this._userParameters[j] + ' not found',
                            'Parameter ' + paramName + ' not found'
                        );
                        allOk = false;
                    }
                }
            }
            return allOk;
        },
        attachmentURL: function(docid) {
            return this.mainModel.sServiceUrl+"/Attachments('" + docid + "')/$value";
        },
        // Message handling methods
        onMessageButtonPress: function(oEvent) {
            this.myComponent.messagePopover.openBy(oEvent.getSource());
        },
        showMessagePopover: function() {
            if (this.myView && this.myView.byId('messageButton')) {
                this.myView.byId('messageButton').firePress();
            }
        },
        addMessage: function(messageType, messageTitle, messageText) {
            this.myComponent.addMessage(messageType, messageTitle, messageText);
        },
        errorMessage: function(messageTitle, messageText) {
            this.addMessage(MessageType.Error, messageTitle, messageText);
        },
        warningMessage: function(messageTitle, messageText) {
            this.addMessage(MessageType.Warning, messageTitle, messageText);
        },
        successMessage: function(messageTitle, messageText) {
            this.addMessage(MessageType.Success, messageTitle, messageText);
        },
        infoMessage: function(messageTitle, messageText) {
            this.addMessage(MessageType.Information, messageTitle, messageText);
        },
        popErrorMessage: function(messageTitle, messageText) {
            this.errorMessage(messageTitle, messageText);
            this.showMessagePopover();
        },
        messageButtonType: function(value) {
            var oMsg = this.myView.getModel('msg').getData();

            if (oMsg) {
                if (oMsg.errorMessages !== '0') {
                    return ButtonType.Reject;
                }
                if (oMsg.warningMessages !== '0') {
                    return ButtonType.Emphasized;
                }
                if (oMsg.successMessages !== '0') {
                    return ButtonType.Accept;
                }
            }
            return ButtonType.Default;
        },
        messageButtonIcon: function(value) {
            var oMsg = this.myView.getModel('msg').getData();

            if (oMsg) {
                if (oMsg.errorMessages !== '0') {
                    return 'sap-icon://message-error';
                }
                if (oMsg.warningMessages !== '0') {
                    return 'sap-icon://message-warning';
                }
                if (oMsg.successMessages !== '0') {
                    return 'sap-icon://message-success';
                }
            }
            return 'sap-icon://message-information';
        },
        messageButtonText: function(value) {
            var oMsg = this.myView.getModel('msg').getData();

            if (oMsg) {
                if (oMsg.errorMessages !== '0') {
                    return oMsg.errorMessages;
                }
                if (oMsg.warningMessages !== '0') {
                    return oMsg.warningMessages;
                }
                if (oMsg.successMessages !== '0') {
                    return oMsg.successMessages;
                }
            }
            return value;
        },
        gatewayError: function(oError) {
            // Error message text might be JSON or XML
            var errorMessage = '?';
            try {
                errorMessage = JSON.parse(oError.responseText).error.message.value;
            } catch (err) {
                var xmlDoc = $($.parseXML(oError.responseText));
                errorMessage = xmlDoc.find('message').text();
            }
            this.popErrorMessage(
                oError.statusText || 'Error',
                errorMessage
            );
        },
        getText: function(textId, textParams) {
            return this._bundle ? this._bundle.getText(textId, textParams) : null;
        },
        onNavBack: function(route) {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.myRouter.navTo(route, true);
            }
        }
    });
});