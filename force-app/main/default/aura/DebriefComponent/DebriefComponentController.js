({
	doInit: function(component,event,helper){
        let pageReference = component.get("v.pageReference");
        if(pageReference.state.c__recordId != undefined){
            component.set("v.recordId",pageReference.state.c__recordId);
            console.log('Record Id -> ' + component.get("v.recordId"));
            helper.setFields(component,event);
        }
	},
    
    handleAddMaterialRow: function(component,event,helper){
        let listOfMaterialLines = component.get("v.listOfMaterialLines");
        helper.createMaterialRow(component,listOfMaterialLines);
        
        let materialDiv = component.find("materialDiv");
        $A.util.addClass(materialDiv,"heightClass");
    },
    
    handleAddLaborRow: function(component,event,helper){
        let listOfLaborLines = component.get("v.listOfLaborLines");
        helper.createLaborRow(component,listOfLaborLines);
        
        let laborDiv = component.find("laborDiv");
        $A.util.addClass(laborDiv,"heightClass");
    },
    
    handleAddTravelRow: function(component,event,helper){
        let listOfTravelLines = component.get("v.listOfTravelLines");
        helper.createTravelRow(component,listOfTravelLines);
        
        let travelDiv = component.find("travelDiv");
        $A.util.addClass(travelDiv,"heightClass");
    },
    
    handleAddNotesRow: function(component,event,helper){
        let listOfNoteLines = component.get("v.listOfNoteLines");
        helper.createNotesRow(component,listOfNoteLines);
    },
    
    removeSelectedRow: function(component,event){
        let index = event.getParam("indexVar");
        let fieldSet = [];
        let varName = '';
        if(event.getParam("tabName") == 'Material'){
            fieldSet = component.get("v.listOfMaterialLines");
            varName = 'v.listOfMaterialLines';
        }
        if(event.getParam("tabName") == 'Labor'){
            fieldSet = component.get("v.listOfLaborLines");
            varName = 'v.listOfLaborLines';
        }
        if(event.getParam("tabName") == 'Travel'){
            fieldSet = component.get("v.listOfTravelLines");
            varName = 'v.listOfTravelLines';
        }
        if(event.getParam("tabName") == 'Notes'){
            fieldSet = component.get("v.listOfNoteLines");
            varName = 'v.listOfNoteLines';
        }
        fieldSet.splice(index, 1);
        component.set(varName, fieldSet);
        
        //Handle Deleted Records
        let removedId = event.getParam("removedId");
        let removedRecords = component.get("v.removedRecords");
        if(removedId){
            removedRecords.push(removedId);
        }
        component.set("v.removedRecords",removedRecords);
        console.log('Removed Records -> ' + removedRecords);
    },
    
    handleSaveRecords: function(component,event,helper){
        let materialLineList = component.get("v.listOfMaterialLines");
        let laborLineList = component.get("v.listOfLaborLines");
        let travelLineList = component.get("v.listOfTravelLines");
        let woNotesList = component.get("v.listOfNoteLines");
        let woData = component.find("workOrderInput");
        let woDataMap = {};
        let finalListOfLines = [];
        let pcMap = component.get("v.pcMap");
        
        console.log('Material Lines -> ' + JSON.stringify(materialLineList));
        console.log('Labor Lines -> ' + JSON.stringify(laborLineList));
        console.log('Travel Lines -> ' + JSON.stringify(travelLineList));
        console.log('Note Lines -> ' + JSON.stringify(woNotesList));
        
        for(let i = 0; i < woData.length; i++){
            let value = woData[i].get("v.value");
            if(woData[i].get("v.disabled") != true && value){
                woDataMap[woData[i].get("v.fieldName")] = value;
            }
        }
        woDataMap['Id'] = component.get("v.recordId");
        woDataMap['Status'] = 'Working';
        
        //Material Line Validation
        let message = '';
        if(materialLineList.length > 0){
            let requiredFieldsMaterial = [
                {label:'Product Stock', name: 'ProductItemId'},
                {label:'Consumed From Location', name:'FS_Consumed_From_Location__c'},
                {label:'Quantity', name: 'QuantityConsumed'}
            ];
            let blankFields = helper.validateInput(component,event,materialLineList,requiredFieldsMaterial);
            console.log('Blank -> ' + JSON.stringify(blankFields));
            
            //Validation
            if(blankFields.length > 0){
                for(let i = 0; i < blankFields.length; i++){
                    message += 'Required field is blank: ' + blankFields[i] + '\n';
                }
            }
            finalListOfLines = finalListOfLines.concat(materialLineList);
        }
        
        //Labor Line Validation
        if(laborLineList.length > 0){
            let requiredFieldsLabor = [
                {label:'Product', name: 'ProductName'},
                {label:'Start Date and Time', name:'FSL_Start_Date_and_Time__c'},
                {label:'Quantity', name: 'QuantityConsumed'}
            ];
            let blankFields = helper.validateInput(component,event,laborLineList,requiredFieldsLabor);
            if(blankFields.length > 0){
                for(let i = 0; i < blankFields.length; i++){
                    message += 'Required field is blank: ' + blankFields[i] + '\n';
                }
            }
            
            //Quantity Validation
            let errors = helper.validateQuantity(component,event,laborLineList);
            if(errors.length > 0){
                for(let i = 0; i < errors.length; i++){
                    message += errors[i] + '\n';
                }
            }
            finalListOfLines = finalListOfLines.concat(laborLineList);
        }
        
        //Travel Line Validation
        if(travelLineList.length > 0){
            let requiredFieldsTravel = [
                {label:'Product', name: 'ProductName'},
                {label:'Start Date and Time', name:'FSL_Start_Date_and_Time__c'},
                {label:'Quantity', name: 'QuantityConsumed'}
            ];
            let blankFields = helper.validateInput(component,event,travelLineList,requiredFieldsTravel);
            if(blankFields.length > 0){
                for(let i = 0; i < blankFields.length; i++){
                    message += 'Required field is blank: ' + blankFields[i] + '\n';
                }
            }
            
            //Quantity Validation
            let errors = helper.validateQuantity(component,event,travelLineList);
            if(errors.length > 0){
                for(let i = 0; i < errors.length; i++){
                    message += errors[i] + '\n';
                }
            }
            finalListOfLines = finalListOfLines.concat(travelLineList);
        }
        
        //WO Note Line Validation
        if(woNotesList.length > 0){
            let requiredFieldsNote = [
                {label:'Note Type', name: 'SVC_Note_Type__c'}
            ];
            let blankFields = helper.validateInput(component,event,woNotesList,requiredFieldsNote);
            if(blankFields.length > 0){
                for(let i = 0; i < blankFields.length; i++){
                    message += 'Required field is blank: ' + blankFields[i] + '\n';
                }
            }
        }
        
        if(message){
            helper.showToast(component,event,'','error',message);
            return;    
        }
        
        //Id Manipulation
        let removedRecords = component.get("v.removedRecords");
        for(let i = 0; i < finalListOfLines.length; i++){
            let prodItemId = finalListOfLines[i].ProductItemId;
            let existingProdItemId = pcMap[finalListOfLines[i].Id];
            if(existingProdItemId && prodItemId && prodItemId != existingProdItemId){
                removedRecords.push(finalListOfLines[i].Id);
                finalListOfLines[i].Id = '';
            }
            else if(prodItemId == existingProdItemId){
                finalListOfLines[i].ProductItemId = '';
            }
        }
        component.set("v.removedRecords",removedRecords);
        
        console.log('Final Lines -> ' + JSON.stringify(finalListOfLines));
        console.log('Deleted Records -> ' + removedRecords);
        console.log('WO Data Insert -> ' + JSON.stringify(woDataMap));
        
        //Calling Helper for Upsert
        helper.handleSave(component,event,woDataMap,JSON.stringify(finalListOfLines),JSON.stringify(woNotesList));
    },
    
    handleCancel: function(component,event,helper){
        helper.handleRedirect(component,event);
    }
})