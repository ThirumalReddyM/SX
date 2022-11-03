({ 
    doInitialization: function(component, event, helper) {
        console.log('doInit');
        var myPageRef = component.get("v.pageReference");
        if(myPageRef) {
            var currentObjectName = myPageRef.state.c__currentObjectName;
            console.log('currentObjectName -> ' + currentObjectName);
            component.set("v.currentObjectName", currentObjectName);
            if(currentObjectName) { 
                if(currentObjectName == 'WorkOrder') {
                    component.set("v.workOrderId", myPageRef.state.c__id);
                    let locationTypeList = JSON.parse(JSON.stringify(component.get("v.locationTypeList")));
                    locationTypeList.push('Customer Location');
                    locationTypeList.push('All Locations');
                    component.set("v.locationTypeList", locationTypeList);
                    helper.getWorkOrder(component, myPageRef.state.c__id);
                } else {
                    component.set("v.locationId", myPageRef.state.c__id);
                    helper.getLocation(component, myPageRef.state.c__id);
                }
            }
            component.set("v.spinner", false);
            helper.createRow(component);
            component.set("v.loaded", true);
        }        
    },
    
    handleOnLoad: function(component, event, helper) {
        console.log('onload:::::::::');
        
        helper.populateValuesInForm(component, event);        
    },
    handleLocationTypeChange : function(component, event, helper) {
        component.find("destinationLoc").set("v.value",'');
        component.set("v.destinationLocationName", '');
        component.find("shipCity").set("v.value", '');
        component.find("shipCountry").set("v.value", '');
        component.find("shipState").set("v.value", '');
        component.find("shipStreet").set("v.value", '');
        component.find("shipPostal").set("v.value", '');
        if(component.get("v.locationType") == 'All Locations') {
            $A.util.removeClass(component.find('destinationLoc'), 'slds-hide');
        } else {
            $A.util.addClass(component.find('destinationLoc'), 'slds-hide');
        }       
        helper.fetchLocationList(component, event, true);
    },
    
   	handleOnSuccess:  function(component, event, helper) {
        console.log('handleOnSuccess started::');
        var record = event.getParams().response;  
        console.log('Created Product Request Id->' +record.id);
        let productReqLineItemList = [];
        let productRequestLineItemDetails = component.get("v.listOfRequestLines");
        console.log('Created productRequestLineItemDetails->' +JSON.stringify(productRequestLineItemDetails));
        if(productRequestLineItemDetails) {
            console.log('In');
            let accountId = component.find('accId').get('v.value');
            let caseId = component.get("v.currentObjectName") == 'WorkOrder' ?  component.get("v.workOrderRecord").CaseId : null;
            let sourceLocationId = component.find('sourcLocInpField').get('v.value');
            let destinationLocationId = component.find('destinationLoc').get('v.value');
            for(var i=0;i<productRequestLineItemDetails.length;i++) {
                let productReqLineItem = {};
                productReqLineItem.QuantityRequested = productRequestLineItemDetails[i].QuantityReturned;
                productReqLineItem.Product2Id = productRequestLineItemDetails[i].Product2Id;
                productReqLineItem.ParentId = record.id;
                productReqLineItem.AccountId = accountId ? accountId : productReqLineItem.AccountId;
                productReqLineItem.CaseId = caseId ? caseId : productReqLineItem.CaseId;
                productReqLineItem.SourceLocationId = sourceLocationId ? sourceLocationId : productReqLineItem.SourceLocationId;
                productReqLineItem.DestinationLocationId = destinationLocationId != null ? destinationLocationId : productReqLineItem.DestinationLocationId;
                productReqLineItem.NeedByDate = component.find('needByDate').get('v.value');
                if(component.get("v.currentObjectName") == 'WorkOrder') {
                	productReqLineItem.WorkOrderId = component.get("v.workOrderRecord").Id;
                }
                productReqLineItemList.push(productReqLineItem);
            }
            console.log('Created productReqLineItemList->' +JSON.stringify(productReqLineItemList));
            let action = component.get("c.insertReturnLines");
            action.setParams({
                "jsonOfListOfReturnLines": JSON.stringify(productReqLineItemList)
            });
            action.setCallback(this, function(response) {
                const toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    message: "Product Request and Line Items are successfully created!",
                    type: "success",
                    duration: '2000',
                });
                toastEvent.fire();
            });
            $A.enqueueAction(action);
            var navEvt = $A.get("e.force:navigateToSObject");
            navEvt.setParams({
                "recordId": record.id,
                isredirect : true
            });
            navEvt.fire();
        }
        component.set("v.spinner", false);
    },
    handleSaveRecords :  function(component, event, helper) {
        event.preventDefault(); //Prevent default submit
        let productLineItemList = component.get("v.listOfRequestLines");
        console.log('productLineItemList', productLineItemList.length);
        console.log('productLineItemList:::',productLineItemList);
        var needbyDate = new Date(component.find("needByDate").get("v.value"));
        var tempDate = new Date();
        var todayDate = new Date((tempDate.getMonth()+1)+'/'+tempDate.getDate()+'/'+tempDate.getFullYear());
        component.find("needByDate").reportValidity();
        component.find("shipmentPriority").reportValidity();
        if(component.get("v.locationType") == '--None--') {
            helper.showToast(component,event,'','error','Type should be selected'); 
        } else if(component.find("needByDate").get("v.value") == null) {
            helper.showToast(component,event,'','error','Needby Date should not be blank');
        } else if(component.find("shipmentPriority").get("v.value") == null) {
            helper.showToast(component,event,'','error','Shipment Priority should not be blank');
        } else if(component.get("v.destinationLocationName") == null || component.get("v.destinationLocationName") == '') {
            helper.showToast(component,event,'','error','Destination Location should not be blank');
        }  else if(needbyDate && needbyDate < todayDate) {
        	helper.showToast(component,event,'','error','Needby Date should not be lesser than today date');
        }  else if(productLineItemList.length == 0) {
        	helper.showToast(component,event,'','error','Please create lines');
        } else if(productLineItemList.length > 0) { 
            var errorMessage = helper.validateLines(component);
        	console.log('errorMessage::', errorMessage);
            if(errorMessage != '') {
                helper.showToast(component,event,'','error',errorMessage);
                return;    
            } else {
                console.log("ProductRequestCreateForm", JSON.stringify(component.find('ProductRequestCreateForm')));
                component.set("v.spinner", true);
                component.find('ProductRequestCreateForm').submit();
            }
        } 
    },
    addNewRow: function(component, event, helper) {
        let productLineItemList = component.get("v.listOfRequestLines");
        console.log('productLineItemList', productLineItemList.length);
        var errorMessage = helper.validateLines(component);
        console.log('errorMessage::', errorMessage);
        if(errorMessage != '') {
            helper.showToast(component,event,'','error',errorMessage);
            return;    
        } else {
            let listOfRequestLines = component.get("v.listOfRequestLines");
            helper.createRow(component, listOfRequestLines);
        }
    },   
    
    removeSelectedRow: function(component,event){
        let index = event.getParam("indexVar");
        console.log('index::', index);
        let fieldSet = [];
        let varName = '';
        fieldSet = component.get("v.listOfRequestLines");
        fieldSet.splice(index-1, 1);
        if(fieldSet && fieldSet.length > 0) {
            for(var i=0;i<fieldSet.length;i++) {
                fieldSet[i].index = i+1;
            }
        } 
        component.set("v.listOfRequestLines", fieldSet);
        
    },
    handleError : function(component,event, helper) {
        let errorList = event.getParams();
        console.log('error::',JSON.stringify( event.getParams()));
        if(errorList && errorList.output && errorList.output.fieldErrors ) {
            console.log('error fieldErrors::',JSON.stringify(errorList.output.fieldErrors));
            let errorMessage = '';
            for (let key in errorList.output.fieldErrors) {
              	console.log(key, errorList.output.fieldErrors[key]);
                for(var i=0;i<errorList.output.fieldErrors[key].length;i++) {
                    errorMessage = errorMessage + errorList.output.fieldErrors[key][i].fieldLabel + ': ';
                    errorMessage = errorMessage + errorList.output.fieldErrors[key][i].errorCode + ' - ';
                    errorMessage = errorMessage + errorList.output.fieldErrors[key][i].message;
                    errorMessage = errorMessage + '\n';
                }
            }
            if(errorList && errorList.output && errorList.output.errors ) {
            	console.log('error fieldErrors::',JSON.stringify(errorList.output.errors));
                for(var i=0;i<errorList.output.errors.length;i++) {
                    errorMessage = errorMessage + 'OTHER_EXCEPTION - ';
                    errorMessage = errorMessage + errorList.output.errors[i].message;
                    errorMessage = errorMessage + '\n';
                }
            }
            helper.showToast(component,event,'','error',errorMessage);
            console.log('errorMessage::', errorMessage);
            component.set("v.spinner", false);
        }        
    },
    handleCancel: function(component,event,helper){
        helper.handleRedirect(component,event);
    },
    handleSearchForLocation: function(component, event, helper) {
        console.log('called handlesearch');
        var searchedParam = event.getParam("searchedParam");
        component.set("v.searchedParam", searchedParam);
        helper.fetchLocationList(component, event, false);
    },

    openLocation: function(component, event, helper) {
        helper.fetchLocationList(component, event, false);
        component.find("destinationLoc").set("v.value",'');
        component.set("v.destinationLocationName", '');
        component.find("shipCity").set("v.value", '');
        component.find("shipCountry").set("v.value", '');
        component.find("shipState").set("v.value", '');
        component.find("shipStreet").set("v.value", '');
        component.find("shipPostal").set("v.value", '');
        component.set("v.objectName", "Search Location");
        component.set("v.locationLoaded",true);
        component.set("v.locationCurrentIndex",parseInt(event.getSource().get("v.title")));
    },
    
    handleSelectForLocation: function(component,event, helper){
        console.log('objectName:::::::', component.get("v.objectName"));
        console.log('selectedRecord:::::::', event.getParam("selectedRecord"));
        if(event.getParam("headerName") === "Search Location"){
            component.find("destinationLoc").set("v.value",event.getParam("selectedId"));
            component.set("v.destinationLocationName", event.getParam("selectedRowName"));
            component.set("v.locationLoaded",false);   
            let selectedRecord = JSON.parse(JSON.stringify(event.getParam("selectedRecord")));
            if(selectedRecord) {                
                component.find("shipCity").set("v.value", (selectedRecord[0].FS_City__c != undefined ? selectedRecord[0].FS_City__c : ''));
                component.find("shipCountry").set("v.value", (selectedRecord[0].FS_Country__c != undefined ? selectedRecord[0].FS_Country__c : ''));
                component.find("shipState").set("v.value", (selectedRecord[0].FS_State__c != undefined ? selectedRecord[0].FS_State__c : ''));
                component.find("shipStreet").set("v.value", (selectedRecord[0].FS_Street__c != undefined ? selectedRecord[0].FS_Street__c : ''));
                component.find("shipPostal").set("v.value", (selectedRecord[0].FS_Zip__c != undefined ? selectedRecord[0].FS_Zip__c : ''));
            }
        }
    },
    handleCloseModalForLocation: function(component,event){
        component.set("v.locationLoaded",false);
    },
    handleDestinationLocation : function(component,event, helper){
        component.set("v.destinationLocationName", '');
        component.find("shipCity").set("v.value", '');
        component.find("shipCountry").set("v.value", '');
        component.find("shipState").set("v.value", '');
        component.find("shipStreet").set("v.value", '');
        component.find("shipPostal").set("v.value", '');
        helper.populateAddrBasedOnDestLoc(component,component.find("destinationLoc").get("v.value"));
    }
})