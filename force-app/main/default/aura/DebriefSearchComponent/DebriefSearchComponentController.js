({  
    onSearchTermChange : function(component,event,helper){
        var delayMillis = 500;
        var timeoutId = component.get("v.searchTimeoutId");
        clearTimeout(timeoutId);
        timeoutId = setTimeout($A.getCallback(function(){
            helper.handleSearch(component,event);
        }), delayMillis);
        component.set("v.searchTimeoutId",timeoutId);
    },
    
    handleSort : function(component, event, helper){
        var sortBy = event.getParam("fieldName");
        var sortDirection = event.getParam("sortDirection");
        component.set("v.sortBy",sortBy);
        component.set("v.sortDirection",sortDirection);
        helper.sortData(component,sortBy,sortDirection);
    },
    
    handleRowSelection: function(component,event){
        var selectedRows = event.getParam('selectedRows');
        console.log('Selected Row -> ' + JSON.stringify(selectedRows));
        component.set("v.selectedRecord",selectedRows);
    },
    
    handleSelect: function(component,event){
        let selectedRecord = component.get("v.selectedRecord");
        if(selectedRecord.length > 0){
            var evt = $A.get("e.c:SelectedRowEvent");
            evt.setParams({
                "selectedRecord": selectedRecord,
                "headerName": component.get("v.headerName"),
                "count": component.get("v.count")
            }).fire();
            component.find("overlayLib").notifyClose();
        }
    },
    
    closeModal: function(component,event){
    	component.find("overlayLib").notifyClose();
    }
})