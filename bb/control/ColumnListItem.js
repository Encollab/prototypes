jQuery.sap.declare("encollab.dp.bb.control.ColumnListItem");
sap.m.ColumnListItem.extend("encollab.dp.bb.control.ColumnListItem", {
    metadata: {
        properties: {
            role: {
                type: "string",
                defaultValue: "Default"
            }
        }
    },

    renderer: {
        renderLIAttributes: function(rm, oLI) {
            rm.addClass("sapMListTblRow");
            var vAlign = oLI.getVAlign();
            if (vAlign != sap.ui.core.VerticalAlign.Inherit) {
                rm.addClass("sapMListTblRow" + vAlign);
            }

            rm.addClass("role" + oLI.getRole());
        }
    }
});
