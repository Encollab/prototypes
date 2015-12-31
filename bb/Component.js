sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "sap/m/MessagePopover",
    "sap/m/MessagePopoverItem",
    "encollab/dp/bb/model/models",
    "encollab/dp/bb/controller/ListSelector",
    "encollab/dp/bb/controller/ErrorHandler",
], function(UIComponent, Device, MessagePopover, MessagePopoverItem, models, ListSelector, ErrorHandler) {
    "use strict";

    return UIComponent.extend("encollab.dp.bb.Component", {

        metadata: {
            manifest: "json"
        },

        /**
         * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
         * In this method, the FLP and device models are set and the router is initialized.
         * @public
         * @override
         */
        init: function() {
            this.oListSelector = new ListSelector();
            this._oErrorHandler = new ErrorHandler(this);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // call the base component's init function and create the App view
            UIComponent.prototype.init.apply(this, arguments);

            // create the views based on the url/hash
            this.getRouter().initialize();


        },

        /**
         * The component is destroyed by UI5 automatically.
         * In this method, the ListSelector and ErrorHandler are destroyed.
         * @public
         * @override
         */
        destroy: function() {
            this.oListSelector.destroy();
            this._oErrorHandler.destroy();
            // call the base component's destroy function
            UIComponent.prototype.destroy.apply(this, arguments);
        },

        /**
         * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
         * design mode class should be set, which influences the size appearance of some controls.
         * @public
         * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
         */
        getContentDensityClass: function() {
            if (this._sContentDensityClass === undefined) {
                // check whether FLP has already set the content density class; do nothing in this case
                if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
                    this._sContentDensityClass = "";
                } else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
                    this._sContentDensityClass = "sapUiSizeCompact";
                } else {
                    // "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
                    this._sContentDensityClass = "sapUiSizeCozy";
                }
            }
            return this._sContentDensityClass;
        },

        _setupMessagePopover: function() {
            if (this.messagePopover) return;
            // set MessagePopover
            this.messagePopover = new MessagePopover({
                items: {
                    path: '/',
                    template: new MessagePopoverItem({
                        type: '{type}',
                        title: '{title}',
                        description: '{description}'
                    })
                },
                itemSelect: $.proxy(this.onMessagePopoverItemSelect, this)
            });

            // set message info model
            var oMessageModel = new JSONModel();
            oMessageModel.setData({
                errorMessages: '0',
                warningMessages: '0',
                sucessMessages: '0',
                infoMessages: '0',
                totalMessages: '0'
            });

            this.setModel(oMessageModel, "msg");
        },
        resetMessagePopover: function() {
            if (this.messagePopover) {
                this.messagePopover.removeAllItems();
                this._recalcMessageCounters();
            }
        },
        onMessagePopoverItemSelect: function(oEvent) {
            //oEvent.getSource().removeItem(oEvent.getParameter('item'));
            //this._recalcMessageCounters();
        },
        addMessage: function(messageType, messageTitle, messageText) {
            this._setupMessagePopover();
            this.messagePopover.addItem(new MessagePopoverItem({
                type: messageType || sap.ui.core.MessageType.Information,
                title: messageTitle || 'No title',
                description: messageText
            }));
            this._recalcMessageCounters();
        },
        _recalcMessageCounters: function() {
            var oMessages = this.messagePopover.getItems(),
                error = 0,
                warning = 0,
                success = 0,
                info = 0;
            for (var i = 0; i < oMessages.length; i++) {
                switch (oMessages[i].getType()) {
                    case sap.ui.core.MessageType.Error:
                        error++;
                        break;
                    case sap.ui.core.MessageType.Warning:
                        warning++;
                        break;
                    case sap.ui.core.MessageType.Success:
                        success++;
                        break;
                    default:
                        info++;
                        break;
                }
            }
            this.getModel('msg').setProperty('/errorMessages', error + '');
            this.getModel('msg').setProperty('/warningMessages', warning + '');
            this.getModel('msg').setProperty('/successMessages', success + '');
            this.getModel('msg').setProperty('/infoMessages', info + '');
            this.getModel('msg').setProperty('/totalMessages', oMessages.length + '');
        },

    });

});