({
    onSearchTermChange : function(component,event,helper){
        var delayMillis = 500;
        var timeoutId = component.get("v.searchTimeoutId");
        clearTimeout(timeoutId);
        timeoutId = setTimeout($A.getCallback(function(){
            var event = component.getEvent("SearchEvent");
            event.setParams({
                "searchedParam": component.get("v.searchTerm")
            }).fire();
        }), delayMillis);
        component.set("v.searchTimeoutId",timeoutId);
    },
    
    handleSort :function(component,event,helper){
        var sortBy = event.getParam("fieldName");
        var sortDirection = event.getParam("sortDirection");
        component.set("v.sortBy",sortBy);
        component.set("v.sortDirection",sortDirection);
        helper.sortData(component,sortBy,sortDirection);
    },
    
    handleRowSelection: function(component,event){
        var selectedRows = event.getParam('selectedRows');
        let obj = [];
        let objName = [];
        let stockProdName = [];
        let stockProdId = [];
        for(var i = 0; i < selectedRows.length; i++){
            obj.push(selectedRows[i].Id);
            objName.push(selectedRows[i].Name);
            if(component.get("v.objectName") === "Search Stocked Serial"){   
                stockProdName.push(selectedRows[i].FS_ProductName);
                stockProdId.push(selectedRows[i].FS_Product__c);
            }
        }
        component.set("v.selectedId",obj.toString());
        component.set("v.selectedRowName",objName.toString());
        if(component.get("v.objectName") === "Search Stocked Serial"){
            component.set("v.selectedStockProdId",stockProdId.toString());
            component.set("v.selectedStockProdName",stockProdName.toString());
        }
        console.log('rowSelection::', selectedRows);
        component.set("v.selectedRecord",selectedRows);
    },
    
    handleSelect: function(component,event){
        var evt = component.getEvent("SelectRow");
        console.log('obj name::', component.get("v.objectName"));
        if(component.get("v.objectName") === "Search Products"){
            evt.setParams({
                "selectedId": component.get("v.selectedId"),
                "selectedRowName": component.get("v.selectedRowName"),
                "headerName": component.get("v.objectName"),
                "index":component.get("v.indexProd")
            }).fire(); 
        }
        else if(component.get("v.objectName") === "Search Stocked Serial"){
            evt.setParams({
                "selectedId": component.get("v.selectedId"),
                "selectedRowName": component.get("v.selectedRowName"),
                "headerName": component.get("v.objectName"),
                "index": component.get("v.indexProd"),
                "selectedStockProdRowName": component.get("v.selectedStockProdName"),
                "selectedStockProdId": component.get("v.selectedStockProdId")
            }).fire();
        }
       else if(component.get("v.objectName") === "Search Location"){
            evt.setParams({
                "selectedId": component.get("v.selectedId"),
                "selectedRowName": component.get("v.selectedRowName"),
                "headerName": component.get("v.objectName"),
                "selectedRecord": component.get("v.selectedRecord") 
            }).fire();
        }
        else{
            evt.setParams({
                "selectedId": component.get("v.selectedId"),
                "selectedLocationName": component.get("v.selectedRowName"),
                "headerName": component.get("v.headerName"),
                "selectedRecord": component.get("v.selectedRecord") 
            }).fire();
        }
    },
    
    closeModal: function(component,event){
        var evt = component.getEvent("CloseModal");
        evt.fire();
    }
})