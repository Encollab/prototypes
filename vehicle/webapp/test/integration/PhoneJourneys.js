jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"encollab/dp/vehicle/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"encollab/dp/vehicle/test/integration/pages/App",
	"encollab/dp/vehicle/test/integration/pages/Browser",
	"encollab/dp/vehicle/test/integration/pages/Master",
	"encollab/dp/vehicle/test/integration/pages/Detail",
	"encollab/dp/vehicle/test/integration/pages/NotFound"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "encollab.dp.vehicle.view."
	});

	sap.ui.require([
		"encollab/dp/vehicle/test/integration/NavigationJourneyPhone",
		"encollab/dp/vehicle/test/integration/NotFoundJourneyPhone",
		"encollab/dp/vehicle/test/integration/BusyJourneyPhone"
	], function () {
		QUnit.start();
	});
});

