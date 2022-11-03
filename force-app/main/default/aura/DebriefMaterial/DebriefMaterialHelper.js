({
	populateProductItems: function(component,event,type){
        let device = $A.get("$Browser.formFactor");
        let cols = [];
        if(device == 'DESKTOP'){
            cols = [
                {'label': 'Product Code', 'fieldName': 'SVC_Product_Code__c', 'type': 'text', 'sortable':true,'initialWidth':130},
                {'label': 'Product Name', 'fieldName': 'ProductName', 'type': 'text', 'sortable' : true,'initialWidth':150},
                {'label': 'Location','fieldName': 'LocationName', 'type': 'text', 'sortable' : true,'initialWidth':150},
                {'label': 'Name','fieldName': 'ProductItemNumber', 'type': 'text', 'sortable' : true,'initialWidth':80},
                {'label': 'Available Quantity','fieldName': 'QuantityOnHand', 'type': 'text','sortable': true,'initialWidth':160}
            ];
        }
        else{
            cols = [
                {'label': 'Product Code', 'fieldName': 'SVC_Product_Code__c', 'type': 'text', 'sortable':true,'initialWidth':150},
                {'label': 'Product Name', 'fieldName': 'ProductName', 'type': 'text', 'sortable' : true,'initialWidth':170},
                {'label': 'Location','fieldName': 'LocationName', 'type': 'text', 'sortable' : true,'initialWidth':150},
                {'label': 'Name','fieldName': 'ProductItemNumber', 'type': 'text', 'sortable' : true,'initialWidth':100},
                {'label': 'Available Quantity','fieldName': 'QuantityOnHand', 'type': 'text','sortable':true,'initialWidth':200}
            ];
        }
        component.set("v.stockCols",cols);
        
        var action = component.get("c.getProductItems");
        action.setParams({
            locationId: component.find("locationId").get("v.value")
        })
        action.setCallback(this,function(response){
            let state = response.getState();
            if (state == "SUCCESS"){
                let result = response.getReturnValue();
                console.log('Stock -> ' + JSON.stringify(result));
                for(let i = 0; i < result.length; i++){
                    result[i].ProductName = result[i].Product2.Name;
                    result[i].LocationName = result[i].Location.Name;
                }
                component.set("v.stockRows",result);
                component.set("v.originalStock",result);
                
                if(type == 'Search' && result.length == 0){
                    component.find("stockInput").set("v.value",'');
                    component.find("stockId").set("v.value",'');
                    component.find("lineInput").set("v.value",'');
                }
            }
        });
        $A.enqueueAction(action);
    },
    
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
                console.log('Stocked Serial -> ' + JSON.stringify(result));
                let lotControlledData = [];
                let stockedSerialData = [];
                for(let i = 0; i < result.length; i++){
                    result[i].StockedProductName = result[i].FS_Product__r.Name;
                    if(result[i].SVC_OrclLotNumber__c != null && result[i].SVC_OrclLotNumber__c != ''){
                        lotControlledData.push(result[i]);
                    }
                    else{
                        stockedSerialData.push(result[i]);
                    }
                }
                component.set("v.lotControlledRows",lotControlledData);
                component.set("v.originalLotControlledStock",lotControlledData);
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