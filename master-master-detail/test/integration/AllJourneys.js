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
	"encollab/dp/mastermasterdetail/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"encollab/dp/mastermasterdetail/test/integration/pages/App",
	"encollab/dp/mastermasterdetail/test/integration/pages/Browser",
	"encollab/dp/mastermasterdetail/test/integration/pages/Master",
	"encollab/dp/mastermasterdetail/test/integration/pages/Detail",
	"encollab/dp/mastermasterdetail/test/integration/pages/NotFound"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "encollab.dp.mastermasterdetail.view."
	});

	sap.ui.require([
		"encollab/dp/mastermasterdetail/test/integration/MasterJourney",
		"encollab/dp/mastermasterdetail/test/integration/NavigationJourney",
		"encollab/dp/mastermasterdetail/test/integration/NotFoundJourney",
		"encollab/dp/mastermasterdetail/test/integration/BusyJourney"
	], function () {
		QUnit.start();
	});
});

