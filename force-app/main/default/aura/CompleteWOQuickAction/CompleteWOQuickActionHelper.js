({
    quickActionHelper: function(component,event){
        console.log('ID -> ' + component.get("v.recordId"))
        var navService = component.find("navService"); 
        let pageReference = { 
            "type": "standard__component",
            "attributes": {
                "componentName": "c__CompleteWorkOrderComponent"
            },
            "state":{
                "c__recordId": component.get("v.recordId"),
                "c__headerName" : 'Complete Repair Work Order',
                "c__workOrderStatus" : 'Completed'
            }
        };
        
        //Navigate
        navService.navigate(pageReference);     
    }
})