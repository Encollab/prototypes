jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

// We cannot provide stable mock data out of the template.
// If you introduce mock data, by adding .json files in your webapp/localService/mockdata folder you have to provide the following minimum data:
// * At least 3 Objects in the list
// * All 3 Objects have at least one LineItems

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
		"encollab/dp/vehicle/test/integration/MasterJourney",
		"encollab/dp/vehicle/test/integration/NavigationJourney",
		"encollab/dp/vehicle/test/integration/NotFoundJourney",
		"encollab/dp/vehicle/test/integration/BusyJourney"
	], function () {
		QUnit.start();
	});
});

