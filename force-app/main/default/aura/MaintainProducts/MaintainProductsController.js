({
    init: function(c,e,h){
    	console.log("init", "start");    
        h.getProductsResult(c);
    	console.log("init", "end");    
    },
    onPaging: function(c,e,h){
        console.log("onPaging", "start");
        console.log("onPaging", "action="+e.getParam("action"));
        console.log("onPaging", "page="+e.getParam("page"));
        console.log("onPaging", "id="+e.getParam("id"));
        var id = e.getParam("id");
        
        if(id == "paging") {
            var paging = c.get("v.paging");
            if(!paging){
                paging = {};
            }
            paging.page = e.getParam("page");
	        c.set('v.paging', paging);
    
	        h.pageItems(c, "paging", "allLineItems", "lineItems");
        }else if(id == "lostPaging") {
            var paging = c.get("v.lostPaging");
            if(!paging){
                paging = {};
            }
            paging.page = e.getParam("page");
	        c.set('v.lostPaging', paging);

            h.pageItems(c, "lostPaging", "allLostItems", "lostItems");
        }
        
        console.log("onPaging", "end");
    },
    onChangeProduct: function(c,e,h){
    	var methodName = 'onChangeProduct';
        console.log(methodName, "start");
        try{
            //validate plans
            if(h.validateChangeProduct(c)){
                console.log("GO");
                var ypos = e.pageY ? e.pageY : e.clientY;
                //console.log(methodName, e.pageX);
                //console.log(methodName, e.clientX);
                //console.log(methodName, e.pageY);
                //console.log(methodName, e.clientY);
                //var ypos = e.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
                console.log(methodName, "ypos="+ypos);
    
                c.find("modal").set("v.style", "top:"+ypos+"px; height:200px; background-color: rgba(200,200,200,0.95);border-radius:5px; padding:5px");
                c.set("v.renderModal", true);
                var spinner = c.find('spinner');
                spinner.showIt(c);
            }
        }catch(ex){
            console.error(methodName, ex);
        }
        console.log(methodName, "end");
    },
    onModalCancel:function(c,e,h){
        var spinner = c.find('spinner');
        spinner.hideIt(c);
        c.set("v.renderModal", false);
    },
    onModalYes: function(c,e,h){
        c.set("v.renderModal", false);
        //TODO: select all of same plan
        c.set("v.newPlan", null);
        var selectedPlan = c.get("v.selectedPlan");
        console.log("selectedPlan="+selectedPlan);
        var lineItems = c.get("v.allLineItems");
        lineItems.forEach(function(li){
           console.log(li.plan + '==' + selectedPlan + '?');
           if(li.plan == selectedPlan) li.selected = true;
        });
        c.set("v.allLineItems", lineItems);
        h.pageItems(c, "paging", "allLineItems", "lineItems");
        c.set("v.renderChangeProducts", true);
        h.searchProducts(c);
    },
    onModalNo: function(c,e,h){
        var spinner = c.find('spinner');
        spinner.hideIt(c);
        c.set("v.renderModal", false);
        c.set("v.renderChangeProducts", true);
        h.searchProducts(c);
    },
    onLoseSelected: function(c,e,h){
        var liIds = [];
        var lineItems = c.get("v.allLineItems");
        lineItems.forEach(function(li){
           if(li.selected) liIds.push(li.id); 
        });
        console.log("onLoseSelected", liIds);
        var num_lost = liIds.length;
        if(!liIds || liIds.length==0){
            alert("No products selected");
            return;
        }
        
        var apexParams = {
            opportunityId: c.get("v.opportunityId"),
            opportunityProductIds: liIds
        };
        
        h.apex(c, "loseProducts", apexParams).then(function(result){
            console.log("loseProducts: result:"+JSON.stringify(result)); 
            c.set("v.allWonSelected", false);
            c.set("v.messageText", num_lost + " products moved to lost");
            var cmp = c.find("messages");
            cmp.set("v.messageType", "confirm");
            cmp.set("v.dismissTimeout", 3000);
            cmp.showIt(c);
            h.processProductResult(c, result);
        }, function(errors){ h.exceptionHandler(c,errors); });
    },
    onWinSelected: function(c,e,h){
        var liIds = [];
        var lineItems = c.get("v.allLostItems");
        lineItems.forEach(function(li){
           if(li.selected) liIds.push(li.id); 
        });
        console.log("onWinSelected", liIds);
        var num_won = liIds.length;
        
        var apexParams = {
            opportunityId: c.get("v.opportunityId"),
            lostOpportunityProductIds: liIds
        };
        
        h.apex(c, "winProducts", apexParams).then(function(result){
            console.log("winProducts: result:"+JSON.stringify(result)); 
            c.set("v.allLostSelected", false);
            c.set("v.messageText", num_won + " products moved to won");
            var cmp = c.find("messages");
            cmp.set("v.messageType", "confirm");
            cmp.set("v.dismissTimeout", 3000);
            cmp.showIt(c);
            h.processProductResult(c, result);
        }, function(errors){ h.exceptionHandler(c,errors); });
    },
    onSelect: function(c, e, h){
        console.log("onSelect", e.getParam("id"));
        console.log("onSelect", e.getParam("value"));
        
        var id = e.getParam("id");
        var value = e.getParam("value");
        
        if(id == 'allWonSelected'){
            var allLineItems = c.get("v.allLineItems");
            allLineItems.forEach(function(li){
                console.log("setting checked "+li.id);
                li.selected = value;
            });
            c.set("v.allLineItems", allLineItems);
            h.pageItems(c, "paging", "allLineItems", "lineItems");
        }
        
        if(id == 'allLostSelected'){
            var allLineItems = c.get("v.allLostItems");
            allLineItems.forEach(function(li){
                console.log("setting checked "+li.id);
                li.selected = value;
            });
            c.set("v.allLostItems", allLineItems);
            h.pageItems(c, "lostPaging", "allLostItems", "lostItems");
        }

        if(id.startsWith("won-")){
            var li_id = id.split('-')[1];
            var lineItems = c.get("v.allLineItems");
            lineItems.forEach(function(li){
                if(li_id == li.id){
                    li.selected = value;
                }
            });
            if(!value){
                c.set("v.allWonSelected", false);
            }
            c.set("v.allLineItems", lineItems);
            h.pageItems(c, "paging", "allLineItems", "lineItems");
        }
        
        if(id.startsWith("lost-")){
            var li_id = id.split('-')[1];
            var lineItems = c.get("v.allLostItems");
            lineItems.forEach(function(li){
                if(li_id == li.id){
                    li.selected = value;
                }
            });
            if(!value){
                c.set("v.allLostSelected", false);
            }
            c.set("v.allLostItems", lineItems);
            h.pageItems(c, "lostPaging", "allLostItems", "lostItems");
        }
    },
    onSearchProducts: function(c,e,h){
        var methodName = "c.onSearchProducts";
        console.log(methodName, "start");
        h.searchProducts(c);
        console.log(methodName, "end");
    },
    onCancelChangeProduct: function(c,e,h){
        var methodName = "c.onCancelChangeProduct";
        console.log(methodName, "start");
        c.set("v.renderChangeProducts", false);
        c.set("v.changeSearchResults", null);
        console.log(methodName, "end");
    },
    onReplaceAll: function(c,e,h){
        var methodName = "c.onReplaceAll";
        console.log(methodName, "start");
        var matches = [];
        var results = c.get("v.changeSearchResults");
        results.forEach(function(result){
        	if(result.match) matches.push(result.match);    
        });
        
        if(matches.length == 0){
            c.set("v.messageText", "No matches found");
            var cmp = c.find("messages");
            cmp.set("v.messageType", "error");
            cmp.set("v.dismissTimeout", 3000);
            cmp.showIt(c);
            //alert("No matches found");
            return;
        }
        
        if(matches.length > 0){
            var num_replaced = matches.length;
            var apexParams = {
                opportunityId: c.get("v.opportunityId"),
                matchesJSON: JSON.stringify(matches)
            };
            h.apex(c, "replaceAll", apexParams).then(function(result){
                c.set("v.messageText", num_replaced + " products replaced successfully");
                var cmp = c.find("messages");
                cmp.set("v.messageType", "confirm");
                cmp.set("v.dismissTimeout", 3000);
                cmp.showIt(c);
                h.processProductResult(c, result);
            }, function(errors){ h.exceptionHandler(c,errors); });
            c.set("v.renderChangeProducts", false);
        }
        console.log(methodName, "end");
    },
    onChangeInputPicklist:function(c,e,h){
        var methodName = "onChangeInputPicklist";
		console.log(methodName, "start");        
        console.log(methodName, e.getParam("id"));
        console.log(methodName, e.getParam("value"));
        //TODO: update the LOP in back end
        var id = e.getParam("id");
        var lop = null;
        var lops = c.get("v.lostItems");
        lops.forEach(function(item){
            if(item.id == id){
                lop = item;
            } 
        });
        if(lop){
            var params = {
                id: lop.id,
                reason : lop.reason
            };
            h.apex(c, "updateLostOpportunityProduct", params).then(function(result){
                console.log("updateLostOpportunityProduct complete successfully");            
                c.set("v.messageText", "Lost reason saved successfully");
                var cmp = c.find("messages");
                cmp.set("v.messageType", "confirm");
                cmp.set("v.dismissTimeout", 3000);
                cmp.showIt(c);
            }, function(errors){
                h.exceptionHandler(c,errors); 
            });
        }
		console.log(methodName, "end");        
    },
    onChangeAutocomplete: function(c,e,h){
        var methodName = "onChangeAutocomplete";
		console.log(methodName, "start");        
        var oppId = c.get("v.opportunityId");
      	var name = e.getParam("name");
        var value = e.getParam("value");
        console.log(methodName, "name="+name);
        console.log(methodName, "value="+value);
        var params = {
            opportunityId: oppId,
            name: name,
            value: value
        };
        h.apexNoSpinner(c, "searchAutocomplete", params).then(function(result){
            console.log("searchAutocomplete complete successfully:"+JSON.stringify(result));            
            c.set("v.newPlanSearchResults", result);
        }, function(errors){
            h.exceptionHandler(c,errors); 
        });
		console.log(methodName, "end");        
    },
    onSelectAutocomplete: function(c,e,h){
        var methodName = "onSelectAutocomplete";
        console.log(methodName, "start");
        var name = e.getParam("name");
        var id = e.getParam("id");
        var value = e.getParam("value");
        console.log(methodName,"name="+name);
        console.log(methodName,"id="+id);
        console.log(methodName,"value="+value);

        c.set("v.newPlan", value);

        console.log(methodName, "end");
    },
    onGoToAccount: function(c,e,h){
        var methodName = "onGoToAccount";
        console.log(methodName, "start");
        var opp = c.get("v.opportunity");
        location.href = '/' + opp.AccountId;
        console.log(methodName, "end");
    },
    onGoToOpportunity: function(c,e,h){
        var methodName = "onGoToOpportunity";
        console.log(methodName, "start");
        var opp = c.get("v.opportunity");
        location.href = '/' + opp.Id;
        console.log(methodName, "end");
    }
})