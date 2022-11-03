({
    doInit: function(component,event){
        var today = new Date();
        component.find("startDateInput").set("v.value",today.toISOString());
    },
    
    openProductModal: function(component,event){
        let modalBody;
        $A.createComponent("c:DebriefSearchComponent",{
            "rows": component.get("v.rows"),
            "cols": component.get("v.cols"),
            "originalData": component.get("v.originalData"),
            "headerName": "Product Search" + ' ' + component.get("v.tabName"),
            "count": component.get("v.rowIndex")
        },
        function(content,status){
            if(status === "SUCCESS"){
                modalBody = content;
                component.find("overlayLib").showCustomModal({
                    header: "Product Search",
                    body: modalBody,
                    showCloseButton: true
                });
            }
        });
    },
    
    handleSelect: function(component,event){
        let selectedRecord = event.getParam("selectedRecord");
        console.log('Selected Id -> ' + JSON.stringify(selectedRecord));
        let productTabName = 'Product Search' + ' ' + component.get("v.tabName");
        if(selectedRecord && component.get("v.rowIndex") == event.getParam("count")){
            if(event.getParam("headerName") == productTabName){
                for(let i = 0; i < selectedRecord.length; i++){
                    component.find("productInput").set("v.value",selectedRecord[i].Id);
                    component.find("productNameInput").set("v.value",selectedRecord[i].Product2.Name);
                    component.find("activityTypeInput").set("v.value",selectedRecord[i].Product2.SVC_Activity_Code__c);
                }
            }
        }
    },
    
    removeRow: function(component,event){
        let rec = component.get("v.rec");
        let recordId = rec.Id;
        component.getEvent("RemoveEvent").setParams({
            "indexVar": component.get("v.rowIndex"),
            "tabName": component.get("v.tabName"),
            "removedId": recordId ? recordId : ''
        }).fire();
    }
})