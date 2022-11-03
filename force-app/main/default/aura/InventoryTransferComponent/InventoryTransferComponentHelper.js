({
    setFields: function(component,event){
        let headerSection = [
            {'label': 'Source Location', 'fieldName': 'SourceLocationId', 'type': 'text','required':true,'editable':false},
            {'label': 'Destination Location', 'fieldName': 'DestinationLocationId', 'type': 'text','required':true,'editable':true},
            {'label': 'Stock Transfer', 'fieldName': 'FS_Stock_Transfer__c', 'type': 'text','required':false,'editable':false}
        ];
        component.set("v.headerSection",headerSection);
        
        //Hide Spinners
        component.set("v.loaded",true);
        component.set("v.showSpinner",false);
	},
    
    createProductRow: function(component,event){
        let listOfLines = component.get("v.listOfProducts");
        let productTransfer = {};
        
        if(listOfLines.length > 0){
            productTransfer.index = listOfLines[listOfLines.length - 1].index + 1;
        }
        else{
            productTransfer.index = 1;
        }
        productTransfer.Product2Id = '';
        productTransfer.QuantitySent = 1;
        productTransfer.FS_Product_Serial__c = '';
        
        listOfLines.push(productTransfer);
        component.set("v.listOfProducts", listOfLines);
    },
        
    handleSave: function(component,event,headerMap,listOfProducts){
        $A.util.removeClass(component.find("saveSpinner"),"slds-hide");
        var action = component.get("c.insertProductTransfers");
        action.setParams({
            headerData: headerMap,
            lineList: listOfProducts
        })
        action.setCallback(this, function(response){
            let state = response.getState();
            if(state === "SUCCESS"){
                let result = response.getReturnValue();
                $A.util.addClass(component.find("saveSpinner"),"slds-hide");
                this.handleRedirect(component,event);
                this.showToast(component,event,'','success','Product Transfer Created Successfully!');
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
        var navService = component.find("navService");
        var pageReference = {
            type: 'standard__recordPage',
            attributes: {
                recordId: component.get("v.recordId"),
                objectApiName: 'Location',
                actionName: 'view'
            }
        };
        navService.navigate(pageReference);
        
        //If the app is Console - Close the current Sub Tab
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
                console.log('Loop 2 -> ' + lineItemList[j][requiredFields[i].name]);
                let fieldValue = lineItemList[j][requiredFields[i].name];
                if(!fieldValue || fieldValue.length == 0){
                    blankFields.push(requiredFields[i].label);
                }
            }
        }
        return blankFields;
    }
})