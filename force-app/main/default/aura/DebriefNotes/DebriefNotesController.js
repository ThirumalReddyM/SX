({
    removeRow: function(component,event){
        let rec = component.get("v.rec");
        let recordId = rec.Id;
        component.getEvent("RemoveEvent").setParams({
            "indexVar":component.get("v.rowIndex"),
            "tabName": "Notes",
            "removedId": recordId ? recordId : ''
        }).fire();
    }
})