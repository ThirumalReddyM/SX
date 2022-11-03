({
    quickActionHelper: function(component,event){
        console.log('ID -> ' + component.get("v.recordId"))
        var navService = component.find("navService"); 
        let pageReference = { 
            "type": "standard__component",
            "attributes": {
                "componentName": "c__DebriefComponent"
            },
            "state":{
                "c__recordId": component.get("v.recordId")
            }
        };
        
        //Navigate
        navService.navigate(pageReference);     
    }
})