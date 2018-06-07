/*eslint-disable no-console, no-alert */
sap.ui.define([
	"sap/m/MessageToast",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function(MessageToast, Controller, JSONModel) {
	"use strict";

	return Controller.extend("DataPullJob.controller.View1", {

		onPress: function(evt) {

			var OModelCloud = new sap.ui.model.odata.v2.ODataModel("/com/wieiswie/v1/wiw.xsodata");
			var mandtFilter = new sap.ui.model.Filter({
                     path: "MANDT",
                     operator: sap.ui.model.FilterOperator.EQ,
                     value1: "000"
              });
			OModelCloud.read("/Person", {
				filters: [mandtFilter],
				success: function(oRetrievedResult) {
					var OModelOnPremise = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZHS_WIW_ODATA_SRV/");
					OModelOnPremise.setUseBatch(false);
					for (var i = 0; i < oRetrievedResult.results.length; i++) {
						delete oRetrievedResult.results[i].__metadata;
						OModelOnPremise.create("/Person", oRetrievedResult.results[i]);
						//OModelOnPremise.submitChanges();
					}

				},
				error: function(oError) { console.log(oError); 
				}
			});

			MessageToast.show(evt.getSource().getId() + " Pressed");
		},

		onInit: function(oEvent) {

		},

		doCleanUp: function(oModel) {
		
		}
	});
});