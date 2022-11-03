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
                component.set("v.workOrderRecord", result);
                let itemStatusType = '';
                if(result && result.LocationId && result.Location.Country_Mapping__c 
                   && result.Location.Country_Mapping__r.Distribution_Center__c 
                   && result.Location.Country_Mapping__r.Distribution_Center__r.Name && result.Location.Country_Mapping__r.Distribution_Center__r.Name.includes(".Main")) {
                    itemStatusType = result.Location.Country_Mapping__r.Distribution_Center__r.Name.split(".Main")[0];
                }
                console.log('itemStatusType::', itemStatusType);
                component.set("v.itemStatusType", itemStatusType);
                this.populateValuesInForm(component, event);   
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
                component.set("v.locationRecord", result);
                let itemStatusType = '';
                if(result && result.Country_Mapping__c 
                   && result.Country_Mapping__r.Distribution_Center__c 
                   && result.Country_Mapping__r.Distribution_Center__r.Name && result.Country_Mapping__r.Distribution_Center__r.Name.includes(".Main")) {
                    itemStatusType = result.Country_Mapping__r.Distribution_Center__r.Name.split(".Main")[0];
                }
                console.log('itemStatusType::', itemStatusType);
                component.set("v.itemStatusType", itemStatusType);
                this.populateValuesInForm(component, event);   
            }
        });
        $A.enqueueAction(action);
    },
    handleRedirect: function(component,event){
        var navService = component.find("navService");
        var pageReference = {};
        if(component.get("v.currentObjectName") == 'WorkOrder') {
            pageReference = {
                type: 'standard__recordPage',
                attributes: {
                    recordId: component.get("v.workOrderId"),
                    objectApiName: 'WorkOrder',
                    actionName: 'view'
                }
            };
        } else {
            pageReference = {
                type: 'standard__recordPage',
                attributes: {
                    recordId: component.get("v.locationId"),
                    objectApiName: 'Location',
                    actionName: 'view'
                }
            };
        }
        navService.navigate(pageReference);
        //If the app is Console - close the current sub tab
        var workspaceAPI = component.find("workspace");
        workspaceAPI.isConsoleNavigation().then(function(response){
            if(response){
                workspaceAPI.getFocusedTabInfo().then(function(response){
                    var focusedTabId = response.tabId;
                    workspaceAPI.closeTab({tabId: focusedTabId});
                })
                .catch(function(error) {
                    console.log(error);
                }); 
            }
        });
    },
    createRow: function(component) {
        let listOfRequestLines = component.get("v.listOfRequestLines");
        let RequestLineObject = {};
        if(listOfRequestLines.length > 0) {
            RequestLineObject.index = listOfRequestLines[listOfRequestLines.length - 1].index + 1;
        } else {
            RequestLineObject.index = 1;
        }
        RequestLineObject.Product2Id = null;
        RequestLineObject.Product2Name = null;
        RequestLineObject.QuantityReturned = 1;
        listOfRequestLines.push(RequestLineObject);
        console.log('listOfRequestLines::::', JSON.stringify(listOfRequestLines));
        component.set("v.listOfRequestLines", listOfRequestLines);
    }, 
    validateLines : function(component) {
        let linesList = [];
        let productLineItemList = component.get("v.listOfRequestLines");
        let errorMessage = '';
        for(var i=0;i<productLineItemList.length;i++) {
            console.log('validateLines2 Invoked',JSON.stringify(productLineItemList[i]));
            if(productLineItemList[i].Product2Id == null ||productLineItemList[i].Product2Id == undefined) {
                errorMessage += 'Required field is blank: Product in Line Record ' + (i+1) +'\n';
            } 
            if(productLineItemList[i].QuantityReturned == null ||productLineItemList[i].QuantityReturned == undefined || productLineItemList[i].QuantityReturned == '') {
                errorMessage += 'Required field is blank: QuantityReturned in Line Record ' + (i+1)+'\n';
            } else if(productLineItemList[i].QuantityReturned && productLineItemList[i].QuantityReturned < 1) { 
                errorMessage += 'QuantityReturned should be greater than 1: QuantityReturned in Line Record ' + (i+1)+'\n';
            }
        }
        console.log('errorMessage::',errorMessage);

        return errorMessage;
	},
    showToast: function(component,event,title,type,message){
        component.find('notifLib').showToast({
            "title": title,
            "variant": type,
            "message": message
        });
    },
    fetchLocationList : function(component,event, IsCalledFromLocationChange) {
        var columns = [
            {'label': 'Location Name', 'fieldName': 'Name', 'type': 'text', 'sortable' : true,'initialWidth':200},
            {'label': 'Street', 'fieldName': 'FS_Street__c', 'type': 'text', 'sortable' : true,'initialWidth':190},
            {'label': 'City', 'fieldName': 'FS_City__c', 'type': 'text', 'sortable' : true,'initialWidth':190},
            {'label': 'Country', 'fieldName': 'FS_Country__c', 'type': 'text', 'sortable' : true,'initialWidth':190},
            {'label': 'Zip', 'fieldName': 'FS_Zip__c', 'type': 'text', 'sortable' : true,'initialWidth':190}
        ]; 
        component.set("v.locationRecords",[]);
        component.set("v.locationOrginalRecords",[]);
        component.set("v.locationFields",columns);
        console.log('loc columns::', component.get("v.locationFields"));
        console.log('wo::', component.get("v.locationFields"));
        var searchKey = component.get("v.searchedParam");
        var locationType = component.get("v.locationType");
        let subQuery = ' WHERE ';
        let currentLocationId = component.get("v.currentObjectName") == 'WorkOrder' ?  component.get("v.workOrderRecord.LocationId") : component.get("v.locationRecord.Id");
        let customerAccountId = component.find('accId').get('v.value');
        let primaryFSEId = component.find('servResInpField').get('v.value');
        if(locationType == '--None--') { 
            subQuery += 'Id = \''+currentLocationId+'\'';
        } else if(locationType == 'Customer Location') {
			subQuery += 'FS_Account__c = \''+customerAccountId+'\' AND Active__c = TRUE AND LocationType = \'Customer\'';            
        } else if(locationType == 'Alternate Location') {
			subQuery += 'SVC_My_Alternate_Location__c = 1 AND Active__c = TRUE AND LocationType = \'Alternate\'';            
        } 
        if(searchKey && locationType != 'All Locations') {
            subQuery += ' AND Name LIKE \'%'+searchKey+'%\'';      
        }
        if(locationType == 'All Locations') {
			subQuery += ' LIMIT 1';            
        }
        console.log('subQuery:::::', subQuery);
        
    	let action = component.get("c.fetchLocationList");
        action.setParams({
            "subQuery" : subQuery
        });
        action.setCallback(this, function(response) {
            let state = response.getState();
            if (state === "SUCCESS") {
                let result = response.getReturnValue();
                console.log('Location Response::', result);
                component.set("v.locationRecords",result);
                component.set("v.locationOrginalRecords",result);
                if(IsCalledFromLocationChange) {
                    var locationType = component.get("v.locationType");
                    if(locationType == '--None--') {
                        let destinationLocationId = component.get("v.currentObjectName") == 'WorkOrder' ? component.get("v.workOrderRecord.LocationId") : component.get("v.locationRecord.Id");
                        let destinationLocationName = component.get("v.currentObjectName") == 'WorkOrder'  ? component.get("v.workOrderRecord.Location.Name") : component.get("v.locationRecord.Name");
                        component.find("destinationLoc").set("v.value", destinationLocationId);
                        component.set("v.destinationLocationName", destinationLocationName);
                        if(component.get("v.currentObjectName") == 'WorkOrder') {
                            component.find("shipCity").set("v.value", component.get("v.workOrderRecord.Location.FS_City__c"));
                            component.find("shipCountry").set("v.value", component.get("v.workOrderRecord.Location.FS_Country__c"));
                            component.find("shipState").set("v.value", component.get("v.workOrderRecord.Location.FS_State__c"));
                            component.find("shipStreet").set("v.value", component.get("v.workOrderRecord.Location.FS_Street__c"));
                            component.find("shipPostal").set("v.value", component.get("v.workOrderRecord.Location.FS_Zip__c"));
                        } else {
                            component.find("shipCity").set("v.value", component.get("v.locationRecord.FS_City__c"));
                            component.find("shipCountry").set("v.value", component.get("v.locationRecord.FS_Country__c"));
                            component.find("shipState").set("v.value", component.get("v.locationRecord.FS_State__c"));
                            component.find("shipStreet").set("v.value", component.get("v.locationRecord.FS_Street__c"));
                            component.find("shipPostal").set("v.value", component.get("v.locationRecord.FS_Zip__c"));
                        }
                    } else {
                        let records = component.get("v.locationRecords");
                        console.log('records:::', records);
                        if(records && records.length > 0) {
                            component.find("destinationLoc").set("v.value", result[0].Id);
                            component.set("v.destinationLocationName", result[0].Name);
                            component.find("shipCity").set("v.value", result[0].FS_City__c);
                            component.find("shipCountry").set("v.value", result[0].FS_Country__c);
                            component.find("shipState").set("v.value", result[0].FS_State__c);
                            component.find("shipStreet").set("v.value", result[0].FS_Street__c);
                            component.find("shipPostal").set("v.value", result[0].FS_Zip__c);
                        }
                    }
                }
            }
        });
        $A.enqueueAction(action);
    }, 
    
    populateValuesInForm : function(component,event) {
        if(component.get("v.currentObjectName") == 'WorkOrder') {
            component.find("accId").set("v.value", component.get("v.workOrderRecord.AccountId"));
            component.find("sourcLocInpField").set("v.value", component.get("v.workOrderRecord.Location.Country_Mapping__r.Distribution_Center__c"));
            component.find("statusInpField").set("v.value", "Submitted");
            component.find("servResInpField").set("v.value", component.get("v.workOrderRecord.FS_Group_Member__c"));
            component.find("workOrderLookupInpField").set("v.value", component.get("v.workOrderRecord.Id")); 
            component.find("destinationLoc").set("v.value", component.get("v.workOrderRecord.LocationId"));
            component.set("v.destinationLocationName", component.get("v.workOrderRecord.Location.Name"));
            component.find("shipCity").set("v.value", component.get("v.workOrderRecord.Location.FS_City__c"));
            component.find("shipCountry").set("v.value", component.get("v.workOrderRecord.Location.FS_Country__c"));
            component.find("shipState").set("v.value", component.get("v.workOrderRecord.Location.FS_State__c"));
            component.find("shipStreet").set("v.value", component.get("v.workOrderRecord.Location.FS_Street__c"));
            component.find("shipPostal").set("v.value", component.get("v.workOrderRecord.Location.FS_Zip__c"));
        } else {
            component.find("accId").set("v.value", component.get("v.locationRecord.FS_Account__c"));
            component.find("sourcLocInpField").set("v.value", component.get("v.locationRecord.Country_Mapping__r.Distribution_Center__c"));
            component.find("statusInpField").set("v.value", "Submitted");
            component.find("servResInpField").set("v.value", component.get("v.locationRecord.Service_Resource__c"));
            component.find("destinationLoc").set("v.value", component.get("v.locationRecord.Id"));
            component.set("v.destinationLocationName", component.get("v.locationRecord.Name"));
            component.find("shipCity").set("v.value", component.get("v.locationRecord.FS_City__c"));
            component.find("shipCountry").set("v.value", component.get("v.locationRecord.FS_Country__c"));
            component.find("shipState").set("v.value", component.get("v.locationRecord.FS_State__c"));
            component.find("shipStreet").set("v.value", component.get("v.locationRecord.FS_Street__c"));
            component.find("shipPostal").set("v.value", component.get("v.locationRecord.FS_Zip__c"));
        }
        this.fetchLocationList(component, event, false);
    },
    populateAddrBasedOnDestLoc : function(component,locationId){
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
                component.set("v.destinationLocationName", result.Name);
                component.find("shipCity").set("v.value", result.FS_City__c);
                component.find("shipCountry").set("v.value", result.FS_Country__c);
                component.find("shipState").set("v.value", result.FS_State__c);
                component.find("shipStreet").set("v.value", result.FS_Street__c);
                component.find("shipPostal").set("v.value", result.FS_Zip__c);
            }
        });
        $A.enqueueAction(action);
    }
})