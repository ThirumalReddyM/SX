({
	doInit: function(component,event,helper){
        helper.getCurrentObjectName(component,event);
	},
        
    handleCancel: function(component,event){
        $A.get("e.force:closeQuickAction").fire();
    },
    
    handleSave: function(component,event,helper){
        let caseData = component.find("caseInput");
        let blankFields = [];
        let requiredFields = [
            {label:'Service Request Type',name:'SVC_Service_Request_Type__c'},
            {label:'Origin',name:'Origin'},
            {label:'Subject',name:'Subject'},
            {label:'Severity',name:'SVC_Severity__c'},
            {label:'Status',name:'Status'},
            {label:'Primary FSE',name:'FS_Primary_FSE__c'},
            {label:'Operating Unit',name:'SVC_Operating_Unit__c'}
        ];
        
        //Data Map
        let caseMap = {};
        for(let i = 0; i < caseData.length; i++){
            let value = caseData[i].get("v.value");
            if(value){
                caseMap[caseData[i].get("v.fieldName")] = value;
            }
        }
        
        //Field Validation
        let message = '';
        blankFields = helper.validateInput(component,event,requiredFields,caseMap);
        if(blankFields.length > 0){
            for(let i = 0; i < blankFields.length; i++){
                message += 'Required field is blank: ' + blankFields[i] + '\n';
            }
        }
        
        if(message){
            helper.showToast(component,event,'','error',message);
            return;
        }
        
        //Create Case
        helper.createCase(component,event,caseMap);
    }
})