({
	doInit : function(c, e, h) {
        console.log("inputPicklistController:doInit");
        h.getOptions(c);
	},
    onChangeValue: function(c,e,h){
        var methodName = "inputPicklist.c.onChangeValue";
        console.log(methodName, "start");
        console.log(methodName, c.get("v.sobjectType")+"/"+c.get("v.fieldName"));
        console.log(methodName, "value="+c.get("v.value"));
        console.log(methodName, e.getParam("oldValue") + " -> " + e.getParam("value"));
        var changeEvent = c.getEvent("inputPicklistChangeEvent");
        console.log(methodName, "id="+c.get("v.id")+"; value="+c.get("v.value"));
        changeEvent.setParams({
            "id": c.get("v.id"),
            "oldValue": e.getParam("oldValue"),
            "value": c.get("v.value")
        }).fire();      
        console.log(methodName, "end");
	},
    onChangeControllingValue: function(c,e,h){
        console.log("inputPicklist.c.onChangeControllingValue", "start");
        h.getOptions(c);
        console.log("inputPicklist.c.onChangeControllingValue", "end");
    }
})