({
    doInit: function(component, event, helper){
        var myPageRef = component.get("v.pageReference");
        if(myPageRef) {
            var currentObjectName = myPageRef.state.c__currentObjectName;
            console.log('currentObjectName -> ' + currentObjectName);
            component.set("v.currentObjectName", currentObjectName);
            if(currentObjectName) {
                if(currentObjectName == 'WorkOrder') {
                    let workOrderId = myPageRef.state.c__id;
                    helper.getWorkOrder(component, workOrderId);
                } else {
                    let locationId = myPageRef.state.c__id;
                    helper.getLocation(component, locationId);
                }
            }
        }
    },

    removeRow: function(component, event, helper) {
        component.getEvent("RemoveEvent").setParams({
            "indexVar":component.get("v.rec.index"),
        }).fire();
    },

    handleSearch: function(component, event, helper) {
        var searchedParam = event.getParam("searchedParam");
        component.set("v.searchedParam", searchedParam);
        var action = component.get("c.fetchProducts");
        action.setParams({
            "searchParam" : component.get("v.searchedParam"),
            "itemStatusType" : component.get("v.itemStatusType") 
        });
        action.setCallback(this, function(response){
            let state = response.getState();
            if (state === "SUCCESS"){
                let result = response.getReturnValue();
                component.set("v.productrows",result);
                component.set("v.productoriginalData",result);
            }
        });
        $A.enqueueAction(action);
    },

    openProduct: function(component,event,helper){
        component.set("v.objectName", "Search Products");
        component.set("v.productloaded",true);
        component.set("v.productcurrentIndex",parseInt(event.getSource().get("v.title")));
    },
    
    removeAllRows: function(component, event, helper) {
        let listOfRequestLines = [];
        helper.createRow(component, listOfRequestLines);
    },

    handleSelect: function(component,event, helper){
        console.log('Data Coming -> ' + event.getParam("selectedId"));
        if(event.getParam("headerName") === "Search Products"){
            component.set("v.rec.Product2Id", event.getParam("selectedId"));
            component.set("v.rec.Product2Name", event.getParam("selectedRowName"));
            component.set("v.productloaded",false);   
        }           
    },

    handleCloseModal: function(component,event){
        component.set("v.productloaded",false);
    }
})