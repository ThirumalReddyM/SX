({
	doInit: function(component,event){
        let pageReference = component.get("v.pageReference");
        if(pageReference.state.c__recordId != undefined){
            component.set("v.recordId",pageReference.state.c__recordId); 
            console.log('Record Id -> ' + component.get("v.recordId"));
        }
        if(pageReference.state.c__headerName != undefined){
            component.set("v.headerName",pageReference.state.c__headerName); 
            console.log('Record headerName -> ' + component.get("v.headerName"));
        }
        if(pageReference.state.c__workOrderStatus != undefined){
            component.set("v.workOrderStatus",pageReference.state.c__workOrderStatus); 
            console.log('Record workOrderStatus -> ' + component.get("v.workOrderStatus"));
        }
	},
    
    handleLoad: function(component,event){
        let spinner = component.find("loadSpinner");
        $A.util.addClass(spinner,"slds-hide");
    },
    
    handleCancel: function(component,event,helper){
        helper.handleRedirect(component,event);
    },
    
    handleSuccess: function(component,event,helper){
        $A.util.addClass(component.find("saveSpinner"),"slds-hide");
         console.log('Handlesuccess');
        helper.showToast(component,event,'Success','success','Work Order Updated Successfully');
        helper.handleRedirect(component,event);
    },
    
    handleSubmit: function(component,event,helper){
        event.preventDefault();
        var fields = component.find("fields");
        
        //Add Required Fields to this Map
        const requiredFieldsMap = new Map([
            ['Service_Guide__c', 'Service Guide'],
            ['Software_Version__c', 'Software Version'],
            ['Complaint__c','Complaint'],
            ['End_User_contact__c','End User'],
            ['Resolution_FIX_2__c','Resolution FIX 2'],
            ['Resolution_FIX_1__c','Resolution FIX 1'],
            ['Why_1__c','Why 1'],
            ['What_1__c','What 1'],
            ['Why_2__c','Why 2'],
            ['What_2__c','What 2'],
            ['What_0__c','What 0'],
            ['What_3__c','What 3']
        ]);
        
        //Identify Blank Fields
        let blankFields = helper.validateInput(component,event,fields,requiredFieldsMap);
        
        //Validation
        let message = '';
        if(blankFields.length > 0){
            for(let i = 0; i < blankFields.length; i++){
                message += 'Required field is blank: ' + blankFields[i] + '\n';
            }
            
            //Toast Message
            const toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                message: message,
                type: "error"
            });
            toastEvent.fire();
        }
        else{
            $A.util.removeClass(component.find("saveSpinner"),"slds-hide");
            component.find("WorkOrderCreateForm").submit();
        }
        
    },
    
    handleError: function(component,event,helper){
        $A.util.addClass(component.find("saveSpinner"),"slds-hide");
        console.log('Errors -> ' + JSON.stringify(errors));
    },
})