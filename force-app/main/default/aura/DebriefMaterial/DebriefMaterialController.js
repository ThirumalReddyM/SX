({
    doInit: function(component,event,helper){
        helper.populateProductItems(component,event,'Init');
        helper.populateStockedSerial(component,event);
    },
    
    openLocationModal: function(component,event,helper){
        let rows = component.get("v.locationRows");
        let columns = component.get("v.locationCols");
        let originalLocations = component.get("v.originalLocations");
        helper.handleShowModal(component,event,rows,columns,originalLocations,'Location Search');
    },
    
    openStockModal: function(component,event,helper){
        let rows = component.get("v.stockRows");
        let columns = component.get("v.stockCols");
        let originalStock = component.get("v.originalStock");
        helper.handleShowModal(component,event,rows,columns,originalStock,'Product Stock Search');
    },
    
    openStockedSerialModal: function(component,event,helper){
        let rows = component.get("v.stockedSerialRows");
        let columns = component.get("v.stockedSerialCols");
        let originalData = component.get("v.originalStockedSerial");
        helper.handleShowModal(component,event,rows,columns,originalData,'Stocked Serial Search');
    },
    
    openLotControlledModal: function(component,event,helper){
        let rows = component.get("v.lotControlledRows");
        let columns = component.get("v.stockedSerialCols");
        let originalData = component.get("v.originalLotControlledStock");
        helper.handleShowModal(component,event,rows,columns,originalData,'Lot Controlled Search');
    },
    
    handleSelectedRow: function(component,event,helper){
        let selectedRecord = event.getParam("selectedRecord");
        
        if(selectedRecord && component.get("v.rowIndex") == event.getParam("count")){
            
            if(event.getParam("headerName") == 'Product Stock Search'){
                for(let i = 0; i < selectedRecord.length; i++){
                    component.find("stockInput").set("v.value",selectedRecord[i].SVC_Product_Code__c);
                    component.find("stockId").set("v.value",selectedRecord[i].Id);
                    component.find("lineInput").set("v.value",selectedRecord[i].Product2.Name);
                    component.find("deconInput").set("v.value",selectedRecord[i].SVC_SER_Decon_Required__c);
                    component.find("refurbishInput").set("v.value",selectedRecord[i].SVC_SER_Refurbishable__c);
                    component.find("returnInput").set("v.value",selectedRecord[i].SVC_SER_Returnable__c);
                }
            }
            if(event.getParam("headerName") == 'Lot Controlled Search'){
                for(let i = 0; i < selectedRecord.length; i++){
                    component.find("lotControlledInput").set("v.value",selectedRecord[i].Name);
                    component.find("lotControlledId").set("v.value",selectedRecord[i].Id);
                    component.find("lotNumberInput").set("v.value",selectedRecord[i].SVC_OrclLotNumber__c);
                }
            }
            if(event.getParam("headerName") == 'Stocked Serial Search'){
                for(let i = 0; i < selectedRecord.length; i++){
                    component.find("stockedSerialInput").set("v.value",selectedRecord[i].Name);
                    component.find("stockedSerialId").set("v.value",selectedRecord[i].Id);
                }
            }
            if(event.getParam("headerName") == 'Location Search'){
                for(let i = 0; i < selectedRecord.length; i++){
                    component.find("locationInput").set("v.value",selectedRecord[i].Name);
                    component.find("locationId").set("v.value",selectedRecord[i].Id);
                }
                helper.populateProductItems(component,event,'Search');
            }
        }
    },
    
    removeRow: function(component,event){
        let rec = component.get("v.rec");
        let recordId = rec.Id;
        component.getEvent("RemoveEvent").setParams({
            "indexVar":component.get("v.rowIndex"),
            "tabName": "Material",
            "removedId": recordId ? recordId : ''
        }).fire();
    }
})