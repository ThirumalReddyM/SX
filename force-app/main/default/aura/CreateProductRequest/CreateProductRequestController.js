({
    init : function(component, event, helper) {
        var action = component.get("c.getObjectName");
        action.setParams({
            "recordId" : component.get('v.recordId')    
        });
        action.setCallback(this, function(response) {
            let state = response.getState();
            if (state === "SUCCESS"){
                let objectName = response.getReturnValue(); 
                console.log('Response -> ', JSON.stringify(objectName)); 
                var navService = component.find("navService");
                var pageReference = {
                   "type": "standard__component",
                    "attributes": {
                        "componentName": "c__ProductRequestParentComponent"    
                    },    
                    "state": {
                        "c__id":  component.get('v.recordId'),
                        "c__currentObjectName":  objectName
                    }
                };
                navService.navigate(pageReference);                        
            }
        });
        $A.enqueueAction(action);        
    }
})