({
    doInit: function(component,event,helper){
        helper.populateStockedSerial(component,event);
    },
    
    openStockedSerialModal: function(component,event,helper){
        let rows = component.get("v.stockedSerialRows");
        let columns = component.get("v.stockedSerialCols");
        let originalData = component.get("v.originalStockedSerial");
        helper.handleShowModal(component,event,rows,columns,originalData,'Stocked Serial Search');
    },
    
    handleSelectedRow: function(component,event){
        let selectedRecord = event.getParam("selectedRecord");
        
        if(selectedRecord && component.get("v.rowIndex") == event.getParam("count")){
            for(let i = 0; i < selectedRecord.length; i++){
                component.find("stockedSerialInput").set("v.value",selectedRecord[i].Name);
                component.find("stockedSerialId").set("v.value",selectedRecord[i].Id);
            }
        }
    },
    
    removeRow: function(component,event){
        component.getEvent("RemoveEvent").setParams({
            "indexVar":component.get("v.rowIndex")
        }).fire();
    }
})