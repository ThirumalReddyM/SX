({
	onSelect : function(c, e, h) {
		console.log("onSelect", c.get("v.id"));
		console.log("onSelect", e.getSource().get("v.value"));
        var selectEvent = c.getEvent("checkboxSelectEvent");
        console.log("selectEvent="+selectEvent);
        selectEvent.setParams({
            "id": c.get("v.id"),
            "value": e.getSource().get("v.value")
        }).fire();
	}
})