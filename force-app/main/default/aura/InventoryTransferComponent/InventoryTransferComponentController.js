({
	doInit: function(component,event,helper){
        let pageReference = component.get("v.pageReference");
        if(pageReference.state.c__recordId != undefined){
            component.set("v.recordId",pageReference.state.c__recordId);
            console.log('Record Id -> ' + component.get("v.recordId"));
        }
        helper.setFields(component,event);
        helper.createProductRow(component,event);
	},
    
    handleAddProductRow: function(component,event,helper){
        helper.createProductRow(component,event);
    },
    
    removeSelectedRow: function(component,event){
        let index = event.getParam("indexVar");
        let fieldSet = [];
        fieldSet = component.get("v.listOfProducts");
        fieldSet.splice(index, 1);
        component.set("v.listOfProducts",fieldSet);
    },
    
    handleSaveRecords: function(component,event,helper){
        let headerMap = {};
        let prodTransferInput = component.find("prodTransferInput");
        for(let i = 0; i < prodTransferInput.length; i++){
            let value = prodTransferInput[i].get("v.value");
            if(value){
                headerMap[prodTransferInput[i].get("v.fieldName")] = value;
            }
        }
        console.log('Header Map -> ' + JSON.stringify(headerMap));
        
        //Line Data
        let listOfProducts = component.get("v.listOfProducts");
        console.log('Products -> ' + JSON.stringify(listOfProducts));
        
        //Validation
        let message = '';
        if(headerMap){
            let blankFieldsHeader = [];
            let source = headerMap['SourceLocationId'];
            let destination = headerMap['DestinationLocationId']
            if(!source){
                blankFieldsHeader.push('Source Location');
            }
            if(!destination){
                blankFieldsHeader.push('Destination Location');
            }
            
            //Validation
            if(blankFieldsHeader.length > 0){
                for(let i = 0; i < blankFieldsHeader.length; i++){
                    message += 'Required field is blank: ' + blankFieldsHeader[i] + '\n';
                }
            }
            console.log('Message -> ' + message);
        }
        
        if(listOfProducts.length > 0){
            let requiredFields = [
                {label:'Product', name: 'Product2Id'},
                {label:'Quantity', name:'QuantitySent'}
            ];
            let blankFields = helper.validateInput(component,event,listOfProducts,requiredFields);
            console.log('Blank -> ' + JSON.stringify(blankFields));
            
            //Validation
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
        
        //Calling Helper for Insert
        helper.handleSave(component,event,headerMap,JSON.stringify(listOfProducts));
    },
    
    handleCancel: function(component,event,helper){
        helper.handleRedirect(component,event);
    },
    
    handleLoad: function(component,event){
        let prodTransferInput = component.find("prodTransferInput");
        for(let i = 0; i < prodTransferInput.length; i++){
            if(prodTransferInput[i].get("v.fieldName") == 'SourceLocationId'){
                prodTransferInput[i].set("v.value",component.get("v.recordId"));
            }
            if(prodTransferInput[i].get("v.fieldName") == 'FS_Stock_Transfer__c'){
                prodTransferInput[i].set("v.value",'Submitted');
            }
        }
    }
})