jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"encollab/dp/masterdetail/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"encollab/dp/masterdetail/test/integration/pages/App",
	"encollab/dp/masterdetail/test/integration/pages/Browser",
	"encollab/dp/masterdetail/test/integration/pages/Master",
	"encollab/dp/masterdetail/test/integration/pages/Detail",
	"encollab/dp/masterdetail/test/integration/pages/NotFound"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "encollab.dp.masterdetail.view."
	});

	sap.ui.require([
		"encollab/dp/masterdetail/test/integration/NavigationJourneyPhone",
		"encollab/dp/masterdetail/test/integration/NotFoundJourneyPhone",
		"encollab/dp/masterdetail/test/integration/BusyJourneyPhone"
	], function () {
		QUnit.start();
	});
});

