({
    getCurrentObjectName : function(component,event){
        var action = component.get("c.getObjectName");
        action.setParams({
            "recordId" : component.get('v.recordId')    
        });
        action.setCallback(this, function(response) {
            let state = response.getState();
            if (state === "SUCCESS"){
                let objectName = response.getReturnValue(); 
                console.log('Response -> ', JSON.stringify(objectName)); 
                component.set("v.currentObjectName", objectName);
                if(objectName == 'Account') {
                    this.getAccountInfo(component,event);
                } else if(objectName == 'Contact') {
                    this.getContactInfo(component,event);
                } else if(objectName == 'Asset') {
                    this.getAssetInfo(component,event);
                }
            }
        });
        $A.enqueueAction(action);        
    },
    
    getAccountInfo: function(component,event){
		var action = component.get("c.getAccountData");
        action.setParams({
            "recordId": component.get("v.recordId")
        });
        action.setCallback(this, function(response){
            let state = response.getState();
            if (state === "SUCCESS"){
                let result = response.getReturnValue();
                console.log('Account Data -> ' + JSON.stringify(result)); 
                
                let accountMap = {};
                for(let key in result){
                    accountMap[key] = result[key];
                }
                component.set("v.accountMap",accountMap);
                component.set("v.isLoaded",true);
                this.handleOnLoad(component,event);
            }
        });
        $A.enqueueAction(action);
	},
    getContactInfo: function(component,event){
		var action = component.get("c.getContactData");
        action.setParams({
            "recordId": component.get("v.recordId")
        });
        action.setCallback(this, function(response){
            let state = response.getState();
            if (state === "SUCCESS"){
                let result = response.getReturnValue();
                console.log('Contact Data -> ' + JSON.stringify(result)); 
                
                let contactMap = {};
                for(let key in result){
                    contactMap[key] = result[key];
                }
                component.set("v.contactMap",contactMap);
                component.set("v.isLoaded",true);
                this.handleOnLoad(component,event);
            }
        });
        $A.enqueueAction(action);
	},
    getAssetInfo: function(component,event){
		var action = component.get("c.getAssetData");
        action.setParams({
            "recordId": component.get("v.recordId")
        });
        action.setCallback(this, function(response){
            let state = response.getState();
            if (state === "SUCCESS"){
                let result = response.getReturnValue();
                console.log('Asset Data -> ' + JSON.stringify(result)); 
                
                let assetMap = {};
                for(let key in result){
                    assetMap[key] = result[key];
                }
                component.set("v.assetMap",assetMap);
                component.set("v.isLoaded",true);
                this.handleOnLoad(component,event);
            }
        });
        $A.enqueueAction(action);
	},
    
    createCase: function(component,event,caseMap){
        $A.util.removeClass(component.find("saveSpinner"),"slds-hide");
        var action = component.get("c.insertCase");
        action.setParams({
            caseData: caseMap
        })
        action.setCallback(this, function(response){
            let state = response.getState();
            if (state === "SUCCESS"){
                let caseId = response.getReturnValue();
                $A.util.addClass(component.find("saveSpinner"),"slds-hide");
                if(caseId){
                    this.handleRedirect(component,event,caseId);
                    this.showToast(component,event,'','success','Service Request Case Created Successfully!');
                }
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
    
    handleRedirect: function(component,event,caseId){
        var navService = component.find("navService");
        var pageReference = {
            type: 'standard__recordPage',
            attributes: {
                recordId: caseId,
                objectApiName: 'Case',
                actionName: 'view'
            }
        };
        navService.navigate(pageReference);
    },
    
    handleOnLoad: function(component,event){
        let objectName = component.get("v.currentObjectName");
        let accountMap = component.get("v.accountMap");
        let contactMap = component.get("v.contactMap");
        let assetMap = component.get("v.assetMap");
        let caseInput = component.find("caseInput");
        
        //Set Values
        for(let i = 0; i < caseInput.length; i++){
            if(caseInput[i].get("v.fieldName") == 'AccountId'){
                if(objectName == 'Account') {
                    if(accountMap['Id'] != null && accountMap['Id'] != '' && accountMap['Id'] != undefined){
                        caseInput[i].set("v.value",accountMap['Id']);
                    }
            	} else if(objectName == 'Contact') {
                    if(contactMap['AccountId'] != null && contactMap['AccountId'] != '' && contactMap['AccountId'] != undefined){
                        caseInput[i].set("v.value",contactMap['AccountId']);
                    }
                } else if(objectName == 'Asset') {
                    if(assetMap['AccountId'] != null && assetMap['AccountId'] != '' && assetMap['AccountId'] != undefined){
                        caseInput[i].set("v.value",assetMap['AccountId']);
                    }
                }
            }
            if(caseInput[i].get("v.fieldName") == 'ContactId'){
                if(objectName == 'Contact') {
                    if(contactMap['Id'] != null && contactMap['Id'] != '' && contactMap['Id'] != undefined){
                        caseInput[i].set("v.value",contactMap['Id']);
                    }
                } else if(objectName == 'Asset') {
                    if(assetMap['ContactId'] != null && assetMap['ContactId'] != '' && assetMap['ContactId'] != undefined){
                        caseInput[i].set("v.value",assetMap['ContactId']);
                    }
                }
            }
            if(caseInput[i].get("v.fieldName") == 'AssetId'){
                if(objectName == 'Asset') {
                	caseInput[i].set("v.value",component.get("v.recordId"));
                }
            }
            if(caseInput[i].get("v.fieldName") == 'Status'){
                caseInput[i].set("v.value",'Open');
            }
            if(caseInput[i].get("v.fieldName") == 'SVC_Severity__c'){
                caseInput[i].set("v.value",'Non Complaint - Maintenance');
            }
            if(caseInput[i].get("v.fieldName") == 'OwnerId'){
                caseInput[i].set("v.value",$A.get("$SObjectType.CurrentUser.Id"));
            }
            if(caseInput[i].get("v.fieldName") == 'FS_Primary_FSE__c'){
                if(assetMap['FS_Preferred_Technician__c'] != null && assetMap['FS_Preferred_Technician__c'] != '' && assetMap['FS_Preferred_Technician__c'] != undefined){
                    caseInput[i].set("v.value",assetMap['FS_Preferred_Technician__c']);
                }
            }
            if(caseInput[i].get("v.fieldName") == 'FS_Secondary_FSE__c'){
                if(assetMap['SVC_Secondary_FSE__c'] != null && assetMap['SVC_Secondary_FSE__c'] != '' && assetMap['SVC_Secondary_FSE__c'] != undefined){
                    caseInput[i].set("v.value",assetMap['SVC_Secondary_FSE__c']);
                }
            }
        }
        
        $A.util.addClass(component.find("loadSpinner"),"slds-hide");
    },

    
    showToast: function(component,event,title,type,message){
        component.find('notifLib').showToast({
            "title": title,
            "variant": type,
            "message": message
        });
    },
    
    validateInput: function(component,event,requiredFields,caseMap){
        let blankFields = [];
        for(let i = 0; i < requiredFields.length; i++){
            let fieldName = requiredFields[i].name;
            let fieldValue = caseMap[fieldName];
            if(!fieldValue){
                blankFields.push(requiredFields[i].label);
            }
        }
        return blankFields;
    }
})