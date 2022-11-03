({
    getWorkOrder : function(component,workOrderId){
        var action = component.get("c.fetchWorkOrder");
        action.setParams({
            "workOrderId" : workOrderId    
        });
        action.setCallback(this, function(response) {
            let state = response.getState();
            console.log(state)
            if (state === "SUCCESS"){
                let result = response.getReturnValue(); 
                console.log('Work Order Response --> ', JSON.stringify(result)); 
                let itemStatusType = '';
                if(result && result.LocationId && result.Location.Country_Mapping__c 
                   && result.Location.Country_Mapping__r.Distribution_Center__c 
                   && result.Location.Country_Mapping__r.Distribution_Center__r.Name && result.Location.Country_Mapping__r.Distribution_Center__r.Name.includes(".Main")) {
                    itemStatusType = result.Location.Country_Mapping__r.Distribution_Center__r.Name.split(".Main")[0];
                }
                console.log('itemStatusType::', itemStatusType);
                component.set("v.itemStatusType", itemStatusType);
                this.getProducts(component, itemStatusType);
            }
        });
        $A.enqueueAction(action);
    },
	getLocation : function(component,locationId){
        var action = component.get("c.fetchLocation");
        action.setParams({
            "locationId" : locationId    
        });
        action.setCallback(this, function(response) {
            let state = response.getState();
            console.log(state)
            if (state === "SUCCESS"){
                let result = response.getReturnValue(); 
                console.log('location Response --> ', JSON.stringify(result)); 
                let itemStatusType = '';
                if(result && result.Country_Mapping__c 
                   && result.Country_Mapping__r.Distribution_Center__c 
                   && result.Country_Mapping__r.Distribution_Center__r.Name && result.Country_Mapping__r.Distribution_Center__r.Name.includes(".Main")) {
                    itemStatusType = result.Country_Mapping__r.Distribution_Center__r.Name.split(".Main")[0];
                }
                console.log('itemStatusType::', itemStatusType);
                component.set("v.itemStatusType", itemStatusType);
                this.getProducts(component, itemStatusType);
            }
        });
        $A.enqueueAction(action);
    },

    getProducts: function(component,itemStatusType){
        var productcolumns = [
            {'label': 'Product Name', 'fieldName': 'Name', 'type': 'text', 'sortable' : true,'initialWidth':150},
            {'label': 'Product Code', 'fieldName': 'ProductCode', 'type': 'text', 'sortable' : true,'initialWidth':150},
            {'label': 'Product Family','fieldName': 'Family', 'type': 'text', 'sortable' : true,'initialWidth':150},
            {'label': 'Service Product Line','fieldName': 'FS_Product_Line__c', 'type': 'text', 'sortable' : true,'initialWidth':180},
            {'label': 'Unit of Measure','fieldName': 'FS_Unit_Of_Measure__c', 'type': 'text', 'sortable' : true,'initialWidth':150},
            {'label': 'SER Instrument Model Group','fieldName': 'SVC_OrclInstrumentModelGroup__c', 'type': 'text', 'sortable' : true,'initialWidth':220},
            {'label': 'SER Item Classification','fieldName': 'SVC_OrclSerItemClassification__c', 'type': 'text', 'sortable' : true,'initialWidth':200},
            {'label': 'SER Returnable','fieldName': 'SVC_OrclSerReturnable__c', 'type': 'text', 'sortable' : true,'initialWidth':150},
            {'label': 'Item Status','fieldName': 'SVC_OrclItemStatus__c', 'type': 'text', 'sortable' : true,'initialWidth':140},
            {'label': 'Item Remarks','fieldName': 'SVC_OrclItemRemarks__c', 'type': 'text', 'sortable' : true,'initialWidth':140}
        ]; 
        component.set("v.productcols",productcolumns);
        var action = component.get("c.fetchProducts");
        action.setParams({
            "searchParam" : component.get("v.searchedParam"),
            "itemStatusType" : itemStatusType   
        });
        action.setCallback(this, function(response){
            let state = response.getState();
            if (state === "SUCCESS"){
                let result = response.getReturnValue();
                console.log('Response -> ' + JSON.stringify(result));
                component.set("v.productrows",result);
                component.set("v.productoriginalData",result);
            }
        });
        $A.enqueueAction(action); 
    }
});