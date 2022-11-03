({
    doInit: function(component, event, helper) {
        let listOfReturnLines = [];
        var myPageRef = component.get("v.pageReference");
        var locationid = myPageRef.state.c__Locationid;
        
        helper.getWorkOrder(component, locationid);
        helper.createRow(component, listOfReturnLines);  
        
        /***
        helper.createRow(component, listOfReturnLines);
        var productcolumns = [
            {'label': 'Product Name', 'fieldName': 'Name', 'type': 'text', 'sortable' : true},
            {'label': 'Product Code', 'fieldName': 'ProductCode', 'type': 'text', 'sortable' : true},
            {'label': 'Product Family','fieldName': 'Family', 'type': 'text', 'sortable' : true},
            {'label': 'EHS Doc of Decontamination Req','fieldName': 'SVC_OrclEHSDocofDeconReq__c', 'type': 'text', 'sortable' : true},
            {'label': 'Service Product Line','fieldName': 'FS_Product_Line__c', 'type': 'text', 'sortable' : true},
            {'label': 'Manufacturer','fieldName': 'Manufacturer__c', 'type': 'text', 'sortable' : true},
            {'label': 'Unit of Measure','fieldName': 'FS_Unit_Of_Measure__c', 'type': 'text', 'sortable' : true}
        ]; 
        component.set("v.productcols",productcolumns);
        var stockedcolumns = [
            
            {'label': 'Product Name', 'fieldName': 'FS_ProductName', 'type': 'text', 'sortable' : true},
            {'label': 'Product Item', 'fieldName': 'FS_Product_Item__c', 'type': 'text', 'sortable' : true},
            {'label': 'Serial Number','fieldName': 'Name', 'type': 'text', 'sortable' : true},
        ]; 
            component.set("v.stockedSerialcols",stockedcolumns);
            var action1 = component.get("c.fetchProducts");
            action1.setCallback(this, function(response) {
            let state = response.getState();
            console.log(state)
            if (state === "SUCCESS"){
            let result = response.getReturnValue(); 
            console.log('Response -> ', JSON.stringify(result)); 
            component.set("v.productrows", result);
            component.set("v.productoriginalData", result);
            var action2 = component.get("c.fetchStockedSerials");
            action2.setCallback(this, function(response) {
            let state = response.getState();
            if (state === "SUCCESS"){
            let result = response.getReturnValue(); 
            console.log('Response -> ', JSON.stringify(result)); 
            result.forEach(element=>{
            if (element.FS_Product__r.Name){ element.FS_ProductName = element.FS_Product__r.Name;}
            })
            result.forEach(element=>{
            if (element.FS_Product_Item__c){ element.FS_Product_Item__c = element.FS_Product_Item__r.ProductItemNumber;}
            })
            console.log('Response -> ', JSON.stringify(result)); 
            component.set("v.stockedSerialrows", result);
            component.set("v.stockedSerialoriginalData", result);
            }
            });
            $A.enqueueAction(action2);
            }
            });
            $A.enqueueAction(action1);
            **/
            },
            
            addNewRow: function(component, event, helper) {
            let listOfReturnLines = component.get("v.listOfReturnLines");
            helper.createRow(component, listOfReturnLines);
            },
            
            removeRow: function(component, event, helper) {
            let toBeDeletedRowIndex = event.getSource().get("v.name");
            let listOfReturnLines = component.get("v.listOfReturnLines");
            
            let newListOfReturnLines = [];
        for (let i = 0; i < listOfReturnLines.length; i++) {
            let tempRecord = Object.assign({}, listOfReturnLines[i]); //cloning object
            if (tempRecord.index !== toBeDeletedRowIndex) {
                newListOfReturnLines.push(tempRecord);
            }
        }
        
        for (let i = 0; i < newListOfReturnLines.length; i++) {
            newListOfReturnLines[i].index = i + 1;
        }
        
        component.set("v.listOfReturnLines", newListOfReturnLines);
    },
    
    handleSearch: function(component, event, helper) {
        var searchedParam = event.getParam("searchedParam");
        component.set("v.searchedParam", searchedParam);  
        console.log('Searched Param from search event ->' +component.get('v.searchedParam'));
        var action1 = component.get("c.fetchProducts");
        action1.setParams({
            "searchParam" : component.get('v.searchedParam')    
        });
        action1.setCallback(this, function(response) {
            let state = response.getState();
            console.log(state)
            if (state === "SUCCESS"){
                let result = response.getReturnValue(); 
                console.log('Response -> ', JSON.stringify(result)); 
                component.set("v.productrows", result);
                component.set("v.productoriginalData", result);
                var action2 = component.get("c.fetchStockedSerials");
                action2.setCallback(this, function(response) {
                    let state = response.getState();
                    if (state === "SUCCESS"){
                        let result = response.getReturnValue(); 
                        console.log('Response -> ', JSON.stringify(result)); 
                        component.set("v.stockedSerialrows", result);
                        component.set("v.stockedSerialoriginalData", result);
                    }
                });
                $A.enqueueAction(action2);
            }
        });
        $A.enqueueAction(action1);
    },
    
    openProduct: function(component, event, helper) {
        component.set("v.objectName", "Search Products");
        component.set("v.productloaded",true);
        component.set("v.productcurrentIndex",parseInt(event.getSource().get("v.title")));
    },
    
    openStockedSerial: function(component, event, helper) {
        component.set("v.objectName", "Search Stocked Serial");
        component.set("v.stockedSerialloaded",true);
        component.set("v.stockedSerialcurrentIndex",parseInt(event.getSource().get("v.title")));
    },
    
    removeAllRows: function(component, event, helper) {
        let listOfReturnLines = [];
        helper.createRow(component, listOfReturnLines);
    },
    handleSelect: function(component,event){
        console.log('Data Coming -> ' + event.getParam("selectedId"));
        console.log('Data Value Coming -> ' + event.getParam("selectedRowName")+' Index Val '+event.getParam("index"));
        console.log(JSON.stringify(component.get("v.listOfReturnLines")));
        
        let indexVal = event.getParam("index");
        let resultArr=component.get("v.listOfReturnLines");
        
        console.log('arr '+JSON.stringify(resultArr[indexVal]));
        
        
        if(event.getParam("headerName")==="Search Products"){
            console.log('arr '+JSON.stringify(resultArr[indexVal-1]));
            resultArr[indexVal-1].Product2Id=event.getParam("selectedId");
            resultArr[indexVal-1].Product2Name=event.getParam("selectedRowName");
            
            console.log(JSON.stringify(component.get("v.listOfReturnLines")));
            component.set("v.productloaded",false);   
            
        }else  if(event.getParam("headerName")==="Search Stocked Serial"){
            resultArr[indexVal-1].SVC_Stocked_Serial__c=event.getParam("selectedId");
            resultArr[indexVal-1].SVC_Stocked_SerialName__c=event.getParam("selectedRowName");
            resultArr[indexVal-1].Product2Id=event.getParam("selectedStockProdId");
            resultArr[indexVal-1].Product2Name=event.getParam("selectedStockProdRowName");
            component.set("v.stockedSerialloaded",false);   
        }
        component.set("v.listOfReturnLines",resultArr);
        console.log(JSON.stringify(component.get("v.listOfReturnLines")));
        
    },
    handleCloseModal: function(component,event){
        component.set("v.productloaded",false);
        component.set("v.stockedSerialloaded",false);
    },
    
    createReturnLines: function(component, event, helper) {
        /*if($A.util.isEmpty(component.get('v.listOfReturnLines'))){
            const toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                title: "Line Items missing",
                message: "Return Order cannot be created without Return Order Line Items!",
                type: "error",
                duration:' 2000',
            });
            toastEvent.fire();
        }else {*/
        var validationPassForQuantity = helper.validateLines(component, "QuantityExpected");
        console.log('validationPassForQuantity::', validationPassForQuantity);
        var validationPassForProduct = helper.validateLines(component, "productNameField");
        console.log('validationPassForProduct::', validationPassForProduct);
        var showValidationError = false;
        var vaildationFailReason = '';
        if(!validationPassForQuantity) {
            const toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                title: "Invalid data",
                message: "Quantity cannot be less than 1!",
                type: "error",
                duration:' 2000',
            });
            toastEvent.fire();
        }else if(!validationPassForProduct){
            const toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                title: "Required Field Missing",
                message: "Product cannot be empty for the creation of Return Order Line Item!",
                type: "error",
                duration:' 2000',
            });
            toastEvent.fire();
        }else if(!validationPassForQuantity || !validationPassForProduct){
            const toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                title: "Required Field Missing",
                message: "Product cannot be empty or Quantity cannot be less than 1!",
                type: "error",
                duration:' 2000',
            });
            toastEvent.fire();
        }else if(validationPassForQuantity && validationPassForProduct) {
            console.log('List of Return Lines => ',JSON.stringify(component.get("v.listOfReturnLines")));
            var params = event.getParam('arguments');
            if(params){
                var ReturnLinesList = params.ReturnLinesList;
                 console.log('In aura method child => ', JSON.stringify(ReturnLinesList))
            }
           
            var evt = component.getEvent("ReturnOrderSubmitEvent");
            evt.setParams({
                "returnWorkOrderLineItems":component.get("v.listOfReturnLines")
            }).fire();
            helper.createRow(component, []);
        }
        //}
    }
});