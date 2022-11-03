({
    populateStockedSerial: function(component,event){
        let device = $A.get("$Browser.formFactor");
        let cols = [];
        if(device == 'DESKTOP'){
            cols = [
                {'label': 'Product', 'fieldName': 'StockedProductName', 'type': 'text', 'sortable' : true},
                {'label': 'Serial Number', 'fieldName': 'Name', 'type': 'text', 'sortable' : true},
                {'label': 'Lot Number','fieldName': 'SVC_OrclLotNumber__c', 'type': 'text', 'sortable' : true}
            ];
        }
        else{
            cols = [
                {'label': 'Product', 'fieldName': 'StockedProductName', 'type': 'text', 'sortable' : true,'initialWidth':170},
                {'label': 'Serial Number', 'fieldName': 'Name', 'type': 'text', 'sortable' : true,'initialWidth':180},
                {'label': 'Lot Number','fieldName': 'SVC_OrclLotNumber__c', 'type': 'text', 'sortable' : true,'initialWidth':170}
            ];
        }
        component.set("v.stockedSerialCols",cols);
        
        var action = component.get("c.getStockedSerialRecords");
        action.setCallback(this, function(response){
            let state = response.getState();
            if (state == "SUCCESS"){
                let result = response.getReturnValue(); 
                console.log('Stocked Serial -> ', JSON.stringify(result));
                let stockedSerialData = [];
                for(let i = 0; i < result.length; i++){
                    result[i].StockedProductName = result[i].FS_Product__r.Name;
                    stockedSerialData.push(result[i]);
                }
                component.set("v.stockedSerialRows",stockedSerialData);
                component.set("v.originalStockedSerial",stockedSerialData);
            }
        });
        $A.enqueueAction(action);
    },
    
    handleShowModal: function(component,event,rows,columns,originalData,headerName){
        let modalBody;
        $A.createComponent("c:DebriefSearchComponent",{
            "rows": rows,
            "cols": columns,
            "originalData": originalData,
            "headerName": headerName,
            "count": component.get("v.rowIndex")
        },
        function(content,status){
            if(status === "SUCCESS"){
                modalBody = content;
                component.find("overlayLib").showCustomModal({
                    header: headerName,
                    body: modalBody,
                    showCloseButton: true
                });
            }
        });
    }
})