({
	onClose : function(c, e, h) {
		c.set("v.rendered", false);
        var modalClosedEvent = c.getEvent("modalClosedEvent");
        console.log("modalClosedEvent="+modalClosedEvent );
        modalClosedEvent.setParams({
        }).fire();
	}
})