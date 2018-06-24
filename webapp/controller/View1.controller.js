/*eslint-disable no-console, no-alert, no-loop-func*/
sap.ui.define([
	"sap/m/MessageToast",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function(MessageToast, Controller, JSONModel) {
	"use strict";

	return Controller.extend("DataPullJob.controller.View1", {

		getData: function(evt) {
			//create cloud Odata model
			var OModelCloud = new sap.ui.model.odata.v2.ODataModel("/com/wieiswie/v1/wiw.xsodata");
			//Bind it to app
			sap.ui.getCore().setModel(OModelCloud, "cloudModel");
			var mandtFilter = new sap.ui.model.Filter({
				path: "MANDT",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: "000"
			});
			//Read the filtered data

			OModelCloud.read("/Person", {
				filters: [mandtFilter],
				success: function(oRetrievedResult) {
					//set the data to the json model
					sap.ui.getCore().getModel("jsonModel").setData(oRetrievedResult);
				},
				error: function(oError) {
					console.log(oError);
				}
			});
			//display the new data in the list
			var olist = this.getView().byId("personList");
			olist.setModel(sap.ui.getCore().getModel("jsonModel"));
			olist.bindItems({
				path: "/results",
				template: new sap.m.ObjectListItem({
					title: "{FAMNAAM} {VOORNAAM}",
					attributes: [new sap.m.ObjectAttribute({
							text: "Mandt: {MANDT}"
						}),
						new sap.m.ObjectAttribute({
							text: "HoofdPerNr: {HOOFDPERNR}"
						})
					]
				})
			});

			MessageToast.show("People retrieved");
		},

		onInit: function(oEvent) {
			//Local json model to hold the data
			var jModel1 = new sap.ui.model.json.JSONModel();
			sap.ui.getCore().setModel(jModel1, "jsonModel");
		},

		postData: function(evt) {
			//Create the on premise odata model
			var OModelOnPremise = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZHS_WIW_ODATA_SRV/");
			OModelOnPremise.setUseBatch(false); //batch mode not supported
			//bind it to the app
			sap.ui.getCore().setModel(OModelOnPremise, "onPremiseModel");
			//get the json model with the data
			var data = sap.ui.getCore().getModel("jsonModel").getData();
			for (var i = 0; i < data.results.length; i++) {
				//Metadata would give an error
				delete data.results[i].__metadata;
				OModelOnPremise.create("/Person", data.results[i], {
					success: function(oCreatedEntry) {
						MessageToast.show("Entries posted succesfully");
					},
					error: function(oError) {
						MessageToast.show("ERROR: entry most likely already existed, check console");
						console.log(oError);
					}

				});
			}
		},

		onCleanUp: function(oEvent) {
			var oModelCloud = sap.ui.getCore().getModel("cloudModel");
			var data = sap.ui.getCore().getModel("jsonModel").getData();
			for (var i = 0; i < data.results.length; i++) {
				var mandt, pernr;
				mandt = data.results[i].MANDT;
				pernr = data.results[i].HOOFDPERNR;
					oModelCloud.remove("/Person(MANDT='" + mandt + "',HOOFDPERNR='" + pernr + "')", {
						success: function() { MessageToast.show("Entries deleted succesfully"); },
						error: function(oError) { MessageToast.show("ERROR: entry not found, check console"); }
					});
			}
			//sap.ui.getCore().getModel("jsonModel").setData(null); 
		}
	});
});