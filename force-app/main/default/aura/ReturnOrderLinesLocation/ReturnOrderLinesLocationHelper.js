({
    getWorkOrder : function(component, locationid) {
       /* this.getProducts(component);
        this.getStockedSerials(component);*/
        var action = component.get("c.fetchLocation");
        action.setParams({
            "locationid" : locationid    
        });
        action.setCallback(this, function(response) {
            let state = response.getState();
            console.log(state)
            if (state === "SUCCESS"){
                let result = response.getReturnValue(); 
                console.log('Location Response --> ', JSON.stringify(result)); 
                component.set("v.LocationRecord", result);
                let itemStatusType = '';
                if(result && result.Country_Mapping__c 
                   && result.Country_Mapping__r.Distribution_Center__c 
                   		&& result.Country_Mapping__r.Distribution_Center__r.Name && result.Country_Mapping__r.Distribution_Center__r.Name.includes(".Main")) {
                    itemStatusType = result.Country_Mapping__r.Distribution_Center__r.Name.split(".Main")[0];
                }
                console.log('itemStatusType::', itemStatusType);
                component.set("v.itemStatusType", itemStatusType);
                this.getProducts(component, itemStatusType);
                this.getStockedSerials(component);
            }
        });
        $A.enqueueAction(action);
    }, 
    getProducts : function(component, itemStatusType) {
        var productcolumns = [
            {'label': 'Product Name', 'fieldName': 'Name', 'type': 'text', 'sortable' : true,'initialWidth':250},
            {'label': 'Product Code', 'fieldName': 'ProductCode', 'type': 'text', 'sortable' : true,'initialWidth':150},
            {'label': 'Product Family','fieldName': 'Family', 'type': 'text', 'sortable' : true,'initialWidth':180},
            {'label': 'EHS Doc of Decontamination Req','fieldName': 'SVC_OrclEHSDocofDeconReq__c', 'type': 'text', 'sortable' : true,'initialWidth':150},
            {'label': 'Service Product Line','fieldName': 'FS_Product_Line__c', 'type': 'text', 'sortable' : true,'initialWidth':200},
            {'label': 'Manufacturer','fieldName': 'Manufacturer__c', 'type': 'text', 'sortable' : true,'initialWidth':150},
            {'label': 'Unit of Measure','fieldName': 'FS_Unit_Of_Measure__c', 'type': 'text', 'sortable' : true,'initialWidth':200}
        ]; 
        component.set("v.productcols",productcolumns);
        var action1 = component.get("c.fetchProducts");
        action1.setParams({
            "itemStatusType" : itemStatusType   
        });
        action1.setCallback(this, function(response) {
            let state = response.getState();
            console.log(state)
            if (state === "SUCCESS"){
                let result = response.getReturnValue(); 
                console.log('Response -> ', JSON.stringify(result)); 
                component.set("v.productrows", result);
                component.set("v.productoriginalData", result);    
            }
        });
        $A.enqueueAction(action1); 
    },
    getStockedSerials : function(component) {
        var stockedcolumns = [
            {'label': 'Product Name', 'fieldName': 'FS_ProductName', 'type': 'text', 'sortable' : true,'initialWidth':150},
            {'label': 'Product Item', 'fieldName': 'FS_Product_Item__c', 'type': 'text', 'sortable' : true,'initialWidth':150},
            {'label': 'Serial Number','fieldName': 'Name', 'type': 'text', 'sortable' : true,'initialWidth':150},
        ]; 
        component.set("v.stockedSerialcols",stockedcolumns);
        var action1 = component.get("c.fetchStockedSerials");
        action1.setCallback(this, function(response) {
            let state = response.getState();
            if (state === "SUCCESS") {
            	let result = response.getReturnValue(); 
                console.log('Response -> ', JSON.stringify(result)); 
                result.forEach(element=>{
                    if (element && element.FS_Product__c && element.FS_Product__r && element.FS_Product__r.Name) { 
                        element.FS_ProductName = element.FS_Product__r.Name;
                    }
            	})
                result.forEach(element=>{
                    if (element.FS_Product_Item__c) { 
            			element.FS_Product_Item__c = element.FS_Product_Item__r.ProductItemNumber;
            		}
            	})
                console.log('Response -> ', JSON.stringify(result)); 
                component.set("v.stockedSerialrows", result);
                component.set("v.stockedSerialoriginalData", result);
            }
		});
        $A.enqueueAction(action1);
    },
    createRow: function(component, listOfReturnLines) {
        let ReturnLineObject = {};
        if(listOfReturnLines.length > 0) {
            ReturnLineObject.index = listOfReturnLines[listOfReturnLines.length - 1].index + 1;
        } else {
            ReturnLineObject.index = 1;
        }
        ReturnLineObject.Product2Id = null;
        ReturnLineObject.Product2Name = null;
        ReturnLineObject.QuantityReturned = 1.00;
        ReturnLineObject.SVC_Stocked_Serial__c = null;
        ReturnLineObject.SVC_Stocked_SerialName__c=null;
        listOfReturnLines.push(ReturnLineObject);
        component.set("v.listOfReturnLines", listOfReturnLines);
    }, 
     validateLines : function(component, auraID) {
        let linesList = [];
        let returnLineItemList = component.get("v.listOfReturnLines");
        let focusElement;
        console.log('auraID::',JSON.stringify(auraID));
        console.log('returnLineItemList', returnLineItemList.length);
        console.log('Return Lines List -> ' +JSON.stringify(component.get("v.listOfReturnLines")));
        if(returnLineItemList.length == 0) {
            return true;
        } else if(returnLineItemList.length == 1) {
            linesList = JSON.parse(JSON.stringify(component.find(auraID)));
            if(auraID == 'productNameField' || auraID == 'QuantityExpected') {
                if(component.find(auraID).get("v.value") == null) {
                    component.find(auraID).setCustomValidity("Complete this field");
                    component.find(auraID).reportValidity();
                    component.find(auraID).focus();
                    return false;
                } else {
                    component.find(auraID).setCustomValidity("");
                    component.find(auraID).reportValidity();
                }
            }
            if(auraID == 'QuantityExpected') {
                if(component.find(auraID).get("v.value") < 1) {
                    component.find(auraID).setCustomValidity("Quantity cannot be less than 1");
                    component.find(auraID).reportValidity();
                    component.find(auraID).focus();
                    return false;
                } else {
                    component.find(auraID).setCustomValidity("");
                    component.find(auraID).reportValidity();
                }
            }            
        } else {
            linesList = component.find(auraID);
        }
        console.log('linesList:::', JSON.stringify(linesList));
        console.log('linesList11:::', linesList);
        if(linesList) {
            console.log('linesList len', linesList.length);
            for(var i=0;i<linesList.length;i++) {
                if(linesList[i] == null || linesList[i].get("v.value") == null || linesList[i].get("v.value") == '' || linesList[i].get("v.value") == undefined) {
                    linesList[i].setCustomValidity("Complete this field");
                    linesList[i].reportValidity();
                    if(focusElement == null || focusElement == undefined) {
                        focusElement = linesList[i];
                    }
                } else {
                    linesList[i].setCustomValidity("");
                    linesList[i].reportValidity();
                }
                if(auraID == "QuantityExpected" && linesList[i].get("v.value") != null) {
                    if(linesList[i].get("v.value") < 1) {
                        linesList[i].setCustomValidity("Quantity cannot be less than 1");
                        linesList[i].reportValidity();
                        if(focusElement == null || focusElement == undefined) {
                            focusElement = linesList[i];
                        }
                    } else {
                        linesList[i].setCustomValidity("");
                        linesList[i].reportValidity();
                    }
                }
            }
            if(focusElement != null) {
                focusElement.focus();
                return false;
            }
            return true;
        }
    }
});