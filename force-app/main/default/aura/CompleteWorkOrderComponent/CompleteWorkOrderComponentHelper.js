({
	showToast: function(component,event,title,type,message){
        component.find('notifLib').showToast({
            "title": title,
            "variant": type,
            "message": message
        });
    },
    
    handleRedirect: function(component,event){
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
    },
    
    validateInput: function(component,event,fields,requiredFieldsMap){
        let blankFields = [];
        for(let j = 0; j < fields.length; j++){
            let fieldName = fields[j].get("v.fieldName");
            let fieldValue = fields[j].get("v.value");
            if(!fieldValue || fieldValue.length == 0){
                if(requiredFieldsMap.has(fieldName)){
                    blankFields.push(requiredFieldsMap.get(fieldName));
                }
            }
        }
        return blankFields;
    }
})