({
    init : function(component, event, helperr) {
        var navService = component.find("navService");
        var pageReference = {
           "type": "standard__component",
            "attributes": {
                "componentName": "c__ReturnOrderParentLocation"    
            },    
            "state": {
                "c__Locationid":  component.get('v.recordId')
            }
        };
          navService.navigate(pageReference);
    }
})