({
    createMaterialRow: function(component,listOfLines){
        let productConsumed = {};
        let locationMap = component.get("v.locationMap");
        let dataMap = component.get("v.dataMap");
        
        if(listOfLines.length > 0){
            productConsumed.index = listOfLines[listOfLines.length - 1].index + 1;
        }
        else{
            productConsumed.index = 1;
        }
        productConsumed.TechnicianName = dataMap['TechnicianName'];
        productConsumed.Service_Resource__c = dataMap['TechnicianId'];
        productConsumed.FS_Consumed_From_Location__c = locationMap['LocationId'];
        productConsumed.ConsumedFromLocationName = locationMap['LocationName'];
        productConsumed.QuantityConsumed = 1;
        productConsumed.FS_Line_Type__c = 'Parts';
        productConsumed.Line_Sub_Type__c = 'Material';
        productConsumed.WorkOrderId = component.get("v.recordId");
        productConsumed.SVC_Case__c = component.get("v.caseId");
        productConsumed.FS_Activity_Type__c = '';
        productConsumed.SVC_WDLotNumber__c = '';
        productConsumed.Lot_Controlled_Part__c = '';
        productConsumed.Stocked_Serial__c = '';
        productConsumed.ProductItemId = '';
        productConsumed.SER_Decon_Required__c = '';
        productConsumed.SER_Refurbishable__c = '';
        productConsumed.SVC_SER_Returnable__c = '';
        productConsumed.ProductStockName = '';
        productConsumed.ProductName = '';
        productConsumed.Tracking_Number__c = '';
        productConsumed.Reason_Code__c = '';
        
        listOfLines.push(productConsumed);
        component.set("v.listOfMaterialLines", listOfLines);
    },
    
    createLaborRow: function(component,listOfLines) {
        let productConsumed = {};
        let dataMap = component.get("v.dataMap");
        if(listOfLines.length > 0) {
            productConsumed.index = listOfLines[listOfLines.length - 1].index + 1;
        }
        else{
            productConsumed.index = 1;
        }
        productConsumed.TechnicianName = dataMap['TechnicianName'];
        productConsumed.Service_Resource__c = dataMap['TechnicianId'];
        productConsumed.QuantityConsumed = 1;
        productConsumed.FS_Line_Type__c = 'Parts';
        productConsumed.Line_Sub_Type__c = 'Labor';	
        productConsumed.FS_Activity_Type__c = '';
        productConsumed.WorkOrderId = component.get("v.recordId");
        productConsumed.SVC_Case__c = component.get("v.caseId");
        productConsumed.SVC_Division_Products__c = dataMap['DivisionProduct'];
        productConsumed.Application_Workflow_Problem__c = '';
        productConsumed.ProductName = '';
        productConsumed.PricebookEntryId = '';
        productConsumed.FSL_Start_Date_and_Time__c = '';
        
        listOfLines.push(productConsumed);
        component.set("v.listOfLaborLines", listOfLines);
    },
    
    createTravelRow: function(component,listOfLines) {
        let productConsumed = {};
        let dataMap = component.get("v.dataMap");
        
        if(listOfLines.length > 0){
            productConsumed.index = listOfLines[listOfLines.length - 1].index + 1;
        } 
        else{
            productConsumed.index = 1;
        }
        productConsumed.ProductName = '';
        productConsumed.FSL_Start_Date_and_Time__c = '';
        productConsumed.TechnicianName = dataMap['TechnicianName'];
        productConsumed.Service_Resource__c = dataMap['TechnicianId'];
        productConsumed.QuantityConsumed = 1;
        productConsumed.FS_Line_Type__c = 'Parts';
        productConsumed.Line_Sub_Type__c = 'Travel';	
        productConsumed.FS_Activity_Type__c = '';
        productConsumed.WorkOrderId = component.get("v.recordId");
        productConsumed.SVC_Case__c = component.get("v.caseId");
        
        listOfLines.push(productConsumed);
        component.set("v.listOfTravelLines", listOfLines);
    },
    
    createNotesRow: function(component,listOfLines){
        let woNote = {};
        if(listOfLines.length > 0){
            woNote.index = listOfLines[listOfLines.length - 1].index + 1;
        } else {
            woNote.index = 1;
        }
        woNote.SVC_Note_Type__c = '';
        woNote.SVC_Note_Description__c = '';
        woNote.SVC_Case__c = component.get("v.caseId");
        woNote.FS_Work_Order__c = component.get("v.recordId");
        listOfLines.push(woNote);
        component.set("v.listOfNoteLines", listOfLines);
    },
    
    setFields : function(component,event){
        let workOrderInfoSection = [
            {'label': 'Work Order Number', 'fieldName': 'WorkOrderNumber', 'type': 'text','required':false,'editable':false},
            {'label': 'Asset', 'fieldName': 'AssetId', 'type': 'text', 'required':false,'editable':false},
            {'label': 'Work Order Status','fieldName': 'Status', 'type': 'text','required':false,'editable':false},
            {'label': 'Task Type','fieldName': 'FS_Order_Type__c', 'type': 'text','required':false,'editable':true},
            {'label': 'Account','fieldName': 'AccountId', 'type': 'text','required':false,'editable':false},
            {'label': 'Billing Type','fieldName': 'FS_Billing_Type__c', 'type': 'text','required':false,'editable':false},
            {'label': 'Case','fieldName': 'CaseId', 'type': 'text','required':false,'editable':false},
            {'label': 'PO Number','fieldName': 'SVC_PO_Number__c', 'type': 'text','required':false,'editable':false},
            {'label': 'PO Value','fieldName': 'SVC_PO_Value__c', 'type': 'text','required':false,'editable':false},
            {'label': 'SVMX Only FSE Note','fieldName': 'SVC_FSE_Internal_Note__c', 'type': 'text','required':false,'editable':true},
            {'label': 'Service Request Type','fieldName': 'SVC_Serv_Request_Type__c', 'type': 'text','required':false,'editable':false},
            {'label': 'Division Products','fieldName': 'SVC_Division_Products__c', 'type': 'text','required':false,'editable':false},
            {'label': 'Cost Center','fieldName': 'SVC_Cost_Center__c', 'type': 'text','required':false,'editable':false},
            {'label': 'Assigned Technician','fieldName': 'FS_Group_Member__c', 'type': 'text','required':false,'editable':false},
            {'label': 'ASP Engineer','fieldName': 'FS_ASP_Engineer__c', 'type': 'text','required':false,'editable':true}
        ];
        
        let taskClosureSection = [
            {'label': 'Complaint', 'fieldName': 'Complaint__c', 'type': 'text', 'sortable' : true,'required':false,'editable':true},
            {'label': 'Software Version', 'fieldName': 'Software_Version__c', 'type': 'text', 'sortable' : true,'required':false,'editable':true},
            {'label': 'Service Guide','fieldName': 'Service_Guide__c', 'type': 'text', 'sortable' : true,'required':false,'editable':true}
        ];
        
        component.set("v.workOrderInfoSection",workOrderInfoSection);
        component.set("v.taskClosureSection",taskClosureSection);
        this.getWorkOrderDetails(component,event);
	},
    
    getWorkOrderDetails: function(component,event){
        var action = component.get("c.getWorkOrderData");
        action.setParams({
            "recordId": component.get("v.recordId")
        });
        action.setCallback(this, function(response){
            let state = response.getState();
            if (state === "SUCCESS"){
                let result = response.getReturnValue();
                let dataMap = {};
                console.log('WO Data -> ', JSON.stringify(result)); 
                
                let woMap = {};
                for(let key in result){
                    woMap[key] = result[key];
                }
                
                //Constructing Data Map
                dataMap['TechnicianId'] = result['FS_Group_Member__c'];
                if(dataMap['TechnicianId'] != '' && dataMap['TechnicianId'] != null && dataMap['TechnicianId'] != undefined){
                    dataMap['TechnicianName'] = result['FS_Group_Member__r'].Name;
                }
                dataMap['DivisionProduct'] = result['SVC_Division_Products__c'];
                dataMap['PricebookId'] = result['Pricebook2Id'];
                dataMap['TaskType'] = result['SVC_Serv_Request_Type__c'];
                dataMap['CurrencyCode'] = result['CurrencyIsoCode'];
                component.set("v.dataMap",dataMap);
                
                let input = component.find("workOrderInput");
                for(let i = 0; i < input.length; i++){
                    console.log('Field Name -> ' + input[i].get("v.fieldName"));
                    input[i].set("v.value",woMap[input[i].get("v.fieldName")]);
                    if(input[i].get("v.fieldName") == 'CaseId'){
                        component.set("v.caseId",woMap[input[i].get("v.fieldName")]);
                    }
                }
                
                this.getLocations(component,event);
            }
        });
        $A.enqueueAction(action);
    },
    
    getLocations: function(component,event){
        let dataMap = component.get("v.dataMap");
        let locationMap = {};
        let technicianId = dataMap['TechnicianId'];
        
        let device = $A.get("$Browser.formFactor");
        let cols = [];
        if(device == 'DESKTOP'){
            cols = [
                {'label': 'Location Name','fieldName': 'Name', 'type': 'text', 'sortable' : true,'initialWidth':160},
                {'label': 'Service Resource', 'fieldName': 'ServiceResourceName', 'type': 'text', 'sortable' : true,'initialWidth':150},
                {'label': 'City', 'fieldName': 'FS_City__c', 'type': 'text', 'sortable' : true,'initialWidth':100},
                {'label': 'State', 'fieldName': 'FS_State__c', 'type': 'text', 'sortable' : true,'initialWidth':100},
                {'label': 'Country', 'fieldName': 'FS_Country__c', 'type': 'text', 'sortable' : true,'initialWidth':130}
            ];
        }
        else{
            cols = [
                {'label': 'Location Name','fieldName': 'Name', 'type': 'text', 'sortable' : true,'initialWidth':160},
                {'label': 'Service Resource', 'fieldName': 'ServiceResourceName', 'type': 'text', 'sortable' : true,'initialWidth':190},
                {'label': 'City', 'fieldName': 'FS_City__c', 'type': 'text', 'sortable' : true,'initialWidth':100},
                {'label': 'State', 'fieldName': 'FS_State__c', 'type': 'text', 'sortable' : true,'initialWidth':100},
                {'label': 'Country', 'fieldName': 'FS_Country__c', 'type': 'text', 'sortable' : true,'initialWidth':120}
            ];
        }
        component.set("v.locationCols",cols);
        
        var action = component.get("c.getTechnicianLocation");
        action.setParams({
            "technicianId": technicianId
        });
        action.setCallback(this,function(response){
            let state = response.getState();
            if (state === "SUCCESS"){
                let result = response.getReturnValue();
                console.log('Response Locations -> ', JSON.stringify(result));
                if(result.length > 0){
                    for(let i = 0; i < result.length; i++){
                        result[i].ServiceResourceName = result[i].Service_Resource__r.Name;
                        locationMap['LocationId'] = result[i].Id;
                        locationMap['LocationName'] = result[i].Name;
                    }
                    component.set("v.locationMap",locationMap);
                    component.set("v.locationRows",result);
                    component.set("v.originalLocations",result);
                }
                
                //Invoke Next Action
                this.getProductDataLabor(component,event);
            }
        });
        $A.enqueueAction(action);
    },
    
    getProductDataLabor: function(component,event){
        let dataMap = component.get("v.dataMap");
        let device = $A.get("$Browser.formFactor");
        let cols = [];
        if(device == 'DESKTOP'){
            cols = [
                {'label': 'Product Code', 'fieldName': 'ProductCode', 'type': 'text', 'sortable' : true},
                {'label': 'Product Name', 'fieldName': 'Name', 'type': 'text', 'sortable' : true}
            ];
        }
        else{
            cols = [
                {'label': 'Product Code', 'fieldName': 'ProductCode', 'type': 'text', 'sortable' : true,'initialWidth':150},
                {'label': 'Product Name', 'fieldName': 'Name', 'type': 'text', 'sortable' : true,'initialWidth':200}
            ];
        }
        component.set("v.prodCols",cols);
        
        var action = component.get("c.getLaborProducts");
        action.setParams({
            "pricebookId": dataMap['PricebookId'],
            "divisionProduct": dataMap['DivisionProduct'],
            "taskType": dataMap['TaskType'],
            "currencyCode": dataMap['CurrencyCode']
        });
        action.setCallback(this,function(response){
            let state = response.getState();
            if (state === "SUCCESS"){
                let result = response.getReturnValue(); 
                console.log('Products Labor -> ', JSON.stringify(result));
                for(let i = 0; i < result.length; i++){
                    result[i].ProductCode = result[i].Product2.ProductCode;
                    result[i].Name = result[i].Product2.Name;
                }
                component.set("v.productRows", result);
                component.set("v.originalProduct", result);
                $A.util.addClass(component.find("loadSpinner"),"slds-hide");
                this.getTravelProducts(component,event);
            }
        });
        $A.enqueueAction(action);
    },
    
    getTravelProducts: function(component,event){
        let dataMap = component.get("v.dataMap");
        let device = $A.get("$Browser.formFactor");
        let cols = [];
        if(device == 'DESKTOP'){
            cols = [
                {'label': 'Product Code', 'fieldName': 'ProductCode', 'type': 'text', 'sortable' : true},
                {'label': 'Product Name', 'fieldName': 'Name', 'type': 'text', 'sortable' : true},
                {'label': 'Division Products', 'fieldName': 'DivisionProducts', 'type': 'text', 'sortable' : true}
            ]; 
        }
        else{
            cols = [
                {'label': 'Product Code', 'fieldName': 'ProductCode', 'type': 'text', 'sortable' : true,'initialWidth':150},
                {'label': 'Product Name', 'fieldName': 'Name', 'type': 'text', 'sortable' : true,'initialWidth':200},
                {'label': 'Division Products', 'fieldName': 'DivisionProducts', 'type': 'text', 'sortable' : true,'initialWidth':200}
            ]; 
        }
        component.set("v.travelProdCols",cols);
        
        var action = component.get("c.getTravelProducts");
        action.setParams({
            "pricebookId": dataMap['PricebookId'],
            "divisionProduct": dataMap['DivisionProduct'],
            "currencyCode": dataMap['CurrencyCode']
        });
        action.setCallback(this, function(response) {
            let state = response.getState();
            if (state === "SUCCESS"){
                let result = response.getReturnValue(); 
                console.log('Products Travel -> ', JSON.stringify(result));
                for(let i = 0; i < result.length; i++){
                    result[i].ProductCode = result[i].Product2.ProductCode;
                    result[i].Name = result[i].Product2.Name;
                    result[i].DivisionProducts = result[i].Product2.SVC_Division_Products__c;
                }
                component.set("v.travelProductRows", result);
                component.set("v.originalTravelProduct", result);
                component.set("v.loaded",true);
                $A.util.addClass(component.find("loadSpinner"),"slds-hide");
                
                this.getProductsConsumed(component,event);
            }
        });
        $A.enqueueAction(action);
    },
    
    handleSave: function(component,event,woDataMap,finalListOfLines,woNotesList){
        let recordsToBeDeleted = component.get("v.removedRecords");
        $A.util.removeClass(component.find("saveSpinner"),"slds-hide");
        var action = component.get("c.insertDebrief");
        action.setParams({
            workOrderData: woDataMap,
            debriefLines: finalListOfLines,
            workOrderNotes: woNotesList,
            toBeDeletedIds: recordsToBeDeleted.length > 0 ? recordsToBeDeleted : []
        })
        action.setCallback(this, function(response) {
            let state = response.getState();
            if (state === "SUCCESS"){
                let result = response.getReturnValue();
                $A.util.addClass(component.find("saveSpinner"),"slds-hide");
                this.handleRedirect(component,event);
                this.showToast(component,event,'','success','Debrief Logged Successfully!');
            }
            else if(state === "ERROR"){
                var errors = action.getError();
                if (errors){
                    if(errors[0] && errors[0].message){
                        $A.util.addClass(component.find("saveSpinner"),"slds-hide");
                        this.showToast(component,event,'','error',errors[0].message);
                    }
                }
            }
        });
        $A.enqueueAction(action);
    },
    
    handleRedirect: function(component,event){
        //If the app is Console - Close the current Sub Tab
        var workspaceAPI = component.find("workspace");
        workspaceAPI.isConsoleNavigation().then(function(response){
            console.log('Response Navigation -> ' + JSON.stringify(response));
            if(response){
                workspaceAPI.getFocusedTabInfo().then(function(response){
                    var focusedTabId = response.tabId;
                    workspaceAPI.refreshTab({
                        tabId: focusedTabId,
                        includeAllSubtabs: true
                    });
                    workspaceAPI.closeTab({tabId: focusedTabId});
                })
                .catch(function(error) {
                    console.log(error);
                }); 
            }
            else{
                var navService = component.find("navService");
                var pageReference = {
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: component.get("v.recordId"),
                        objectApiName: 'WorkOrder',
                        actionName: 'view'
                    }
                };
                navService.navigate(pageReference);
            }
        });
    },
    
    showToast: function(component,event,title,type,message){
        component.find('notifLib').showToast({
            "title": title,
            "variant": type,
            "message": message
        });
    },
    
    validateInput: function(component,event,lineItemList,requiredFields){
        let blankFields = [];
        loop1: for(let i = 0; i < requiredFields.length; i++){
            loop2: for(let j = 0; j < lineItemList.length; j++){
                let fieldValue = lineItemList[j][requiredFields[i].name];
                if(!fieldValue || fieldValue.length == 0){
                    blankFields.push(requiredFields[i].label);
                }
            }
        }
        return blankFields;
    },
    
    validateQuantity: function(component,event,lineItemList){
        let errors = [];
        for(let i = 0; i < lineItemList.length; i++){
        	let fieldValue = lineItemList[i]['QuantityConsumed'];
            if(fieldValue && fieldValue < 0){
               errors.push('You cannot enter Quantity less than 0');
            }
            if(fieldValue && fieldValue >= 18){
                errors.push('You cannot enter more than 18 hours Labor');
            }
        }
        return errors;
    },
    
    getProductsConsumed: function(component,event){
        var action = component.get("c.getProductsConsumedData");
        action.setParams({
            "workOrderId": component.get("v.recordId")
        });
        action.setCallback(this,function(response){
            let state = response.getState();
            if (state === "SUCCESS"){
                let result = response.getReturnValue();
                let pcMap = {};
                let listOfMaterialLines = [];
                let listOfLaborLines = [];
                let listOfTravelLines = [];
                
                for(let i = 0; i < result.length; i++){
                    let prodItemId = result[i].ProductItemId;
                    pcMap[result[i].Id] = prodItemId;
                    
                    //Material Tab Information
                    if(prodItemId){
                        let productConsumed = {};
                        productConsumed.Id = result[i].Id;
                        productConsumed.index = i;
                        if(result[i].Service_Resource__c != null && result[i].Service_Resource__c != '' && result[i].Service_Resource__c != undefined){
                            productConsumed.TechnicianName = result[i].Service_Resource__r.Name;
                        }
                        productConsumed.Service_Resource__c = result[i].Service_Resource__c;
                        productConsumed.QuantityConsumed = result[i].QuantityConsumed;
                        productConsumed.ProductName = result[i].Product2.Name;
                        productConsumed.FS_Activity_Type__c = result[i].FS_Activity_Type__c;
                        productConsumed.FS_Line_Type__c = result[i].FS_Line_Type__c;
                        productConsumed.Line_Sub_Type__c = result[i].Line_Sub_Type__c;
                        productConsumed.WorkOrderId = result[i].WorkOrderId;
                        productConsumed.SVC_Case__c = result[i].SVC_Case__c;
                        productConsumed.ProductStockName = result[i].Product2.ProductCode;
                        productConsumed.ProductItemId = result[i].ProductItemId;
                        productConsumed.Tracking_Number__c = result[i].Tracking_Number__c;
                        productConsumed.Reason_Code__c = result[i].Reason_Code__c;
                        productConsumed.SVC_WDLotNumber__c = result[i].SVC_WDLotNumber__c;
                        
                        productConsumed.FS_Consumed_From_Location__c = result[i].FS_Consumed_From_Location__c;
                        if(result[i].FS_Consumed_From_Location__c != null && result[i].FS_Consumed_From_Location__c != '' && result[i].FS_Consumed_From_Location__c != undefined){
                            productConsumed.ConsumedFromLocationName = result[i].FS_Consumed_From_Location__r.Name;
                        }
                        
                        productConsumed.Lot_Controlled_Part__c = result[i].Lot_Controlled_Part__c;
                        if(result[i].Lot_Controlled_Part__c != null && result[i].Lot_Controlled_Part__c != '' && result[i].Lot_Controlled_Part__c != undefined){
                            productConsumed.LotControlledName = result[i].Lot_Controlled_Part__r.Name;
                        }
                        
                        productConsumed.Stocked_Serial__c = result[i].Stocked_Serial__c;
                        if(result[i].Stocked_Serial__c != null && result[i].Stocked_Serial__c != '' && result[i].Stocked_Serial__c != undefined){
                            productConsumed.StockedSerialName = result[i].Stocked_Serial__r.Name;
                        }
                        listOfMaterialLines.push(productConsumed);
                    }
                    
                    //Labor and Travel Information
                    if(!prodItemId){
                        let productConsumed = {};
                        productConsumed.Id = result[i].Id;
                        productConsumed.index = i;
                        productConsumed.TechnicianName = result[i].Service_Resource__r.Name;
                        productConsumed.Service_Resource__c = result[i].Service_Resource__c;
                        productConsumed.QuantityConsumed = result[i].QuantityConsumed;
                        productConsumed.ProductName = result[i].Product2.Name;
                        productConsumed.FS_Activity_Type__c = result[i].FS_Activity_Type__c;
                        productConsumed.FS_Line_Type__c = result[i].FS_Line_Type__c;
                        productConsumed.Line_Sub_Type__c = result[i].Line_Sub_Type__c;
                        productConsumed.SVC_Case__c = result[i].SVC_Case__c;
                        productConsumed.WorkOrderId = result[i].WorkOrderId;
                        productConsumed.SVC_Division_Products__c = result[i].SVC_Division_Products__c;
                        productConsumed.FSL_Start_Date_and_Time__c = result[i].FSL_Start_Date_and_Time__c;
                        productConsumed.PricebookEntryId = result[i].PricebookEntryId;
                        productConsumed.Application_Workflow_Problem__c = result[i].Application_Workflow_Problem__c;
                        if(result[i].Line_Sub_Type__c == 'Labor'){
                            listOfLaborLines.push(productConsumed);
                        }
                        if(result[i].Line_Sub_Type__c == 'Travel'){
                            listOfTravelLines.push(productConsumed);
                        }
                    }
                }
                component.set("v.listOfMaterialLines",listOfMaterialLines);
                component.set("v.listOfLaborLines",listOfLaborLines);
                component.set("v.listOfTravelLines",listOfTravelLines);
                component.set("v.pcMap",pcMap);
                
                //Retrieve WO Notes Data
                this.getWONotes(component,event);
            }
        });
        $A.enqueueAction(action);
    },
    
    getWONotes: function(component,event){
        var action = component.get("c.getWorkOrderNotes");
        action.setParams({
            "workOrderId": component.get("v.recordId")
        });
        action.setCallback(this,function(response){
            let state = response.getState();
            if(state === "SUCCESS"){
                let listOfNoteLines = [];
                let result = response.getReturnValue();
                for(let i = 0; i < result.length; i++){
                    let woNote = {};
                    woNote.Id = result[i].Id;
                    woNote.SVC_Note_Type__c = result[i].SVC_Note_Type__c;
                    woNote.SVC_Note_Description__c = result[i].SVC_Note_Description__c;
                    listOfNoteLines.push(woNote);
                }
                component.set("v.listOfNoteLines",listOfNoteLines);
            }
        });
        $A.enqueueAction(action);
    }
})