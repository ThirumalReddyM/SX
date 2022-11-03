({
    handleRedirect: function(component,event){
        var navService = component.find("navService");
        var pageReference = {
            type: 'standard__recordPage',
            attributes: {
                recordId: component.get("v.locationid"),
                objectApiName: 'Location',
                actionName: 'view'
            }
        };
        navService.navigate(pageReference);
        
        //If the app is Console - close the current sub tab
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
    }
})