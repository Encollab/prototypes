sap.ui.define([
		"encollab/dp/masterdetail/controller/BaseController",
		"sap/ui/model/json/JSONModel"
	], function (BaseController, JSONModel) {
		"use strict";

		return BaseController.extend("encollab.dp.masterdetail.controller.App", {

			onInit : function () {
				var oViewModel,
					fnSetAppNotBusy,
					oListSelector = this.getOwnerComponent().oListSelector,
					iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

				oViewModel = new JSONModel({
					busy : true,
					delay : 0
				});
				this.setModel(oViewModel, "appView");

				fnSetAppNotBusy = function() {
					oViewModel.setProperty("/busy", false);
					oViewModel.setProperty("/delay", iOriginalBusyDelay);
				};

				this.getOwnerComponent().getModel().metadataLoaded()
						.then(fnSetAppNotBusy);

				// Makes sure that master view is hidden in split app
				// after a new list entry has been selected.
				oListSelector.attachListSelectionChange(function () {
					this.byId("idAppControl").hideMaster();
				}, this);

				// apply content density mode to root view
				this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

				// Turn off batch mode on model for testing
				//this.getOwnerComponent().getModel().metadataLoaded().then(this.getModel().setUseBatch(false));
				this.getOwnerComponent().getModel().setUseBatch(false);
			}

		});

	}
);
