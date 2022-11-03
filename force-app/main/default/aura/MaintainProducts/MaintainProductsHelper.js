({
    getProductsResult : function(c,e,h){
        var paging = c.get("v.paging");
        var params = {
            opportunityId: c.get("v.opportunityId"),
            paging: paging ? JSON.stringify(paging) : null,
            lostPaging: paging ? JSON.stringify(paging) : null
        };
        var self = this;

        this.apex(c, "getProductsResult", params).then(function(result){
            self.processProductResult(c,result);
        }, function(errors){ self.exceptionHandler(c,errors); });
    },
    processProductResult: function(c, result){
        console.log("processProductResult: result:"+JSON.stringify(result)); 
        console.log("processProductResult: result.paging:"+JSON.stringify(result.paging)); 
        c.set("v.opportunity", result.opportunity);
        c.set("v.paging", result.paging);
        c.set("v.lostPaging", result.lostPaging);
        c.set("v.allLineItems", result.lineItems);
        c.set("v.allLostItems", result.lostLineItems);
        this.pageItems(c, "paging", "allLineItems", "lineItems");
        this.pageItems(c, "lostPaging", "allLostItems", "lostItems");
    },
    pageItems: function(c, pagingAttributeName, allLineItemsAttributeName, pageLineItemsAttributeName){
        var methodName = "pageItems";
        console.log(methodName, "start:"+pagingAttributeName);
        var allLineItems = c.get("v."+allLineItemsAttributeName);
        var paging = c.get("v."+pagingAttributeName);
        if(!paging){
            paging = {
                page: 1,
                pageSize: 10
            };
        }

        c.set("v."+pagingAttributeName, paging);
        
        var lowerBound = Number((paging.page-1)*paging.pageSize);
        console.log(methodName, "lowerBound:"+lowerBound);
        var upperBound = Number(paging.page*paging.pageSize);
        console.log(methodName, "upperBound:"+upperBound);
        var lineItemsPage = allLineItems.slice(lowerBound, upperBound);
        c.set("v."+pageLineItemsAttributeName, lineItemsPage);
        var count = 0;
        allLineItems.forEach(function(li){
            if(li.selected) count++;
        });
        if(pagingAttributeName=="paging") c.set("v.countWonSelected", count);
        if(pagingAttributeName=="lostPaging") c.set("v.countLostSelected", count);
        console.log(methodName, "end");
    },
    validateChangeProduct: function(c){
        var methodName = "h.validateChangeProduct";
    	var allLineItems = c.get("v.allLineItems");
        var count = 0;
        var plans = [];
        try{
            allLineItems.forEach(function(li){
                if(li.selected) {
                    count++;
                    if(plans.indexOf(li.plan) == -1) {
                        plans.push(li.plan);
                    }
                }
            });
            console.log(methodName, plans);
            if(count == 0){
                alert('No products selected');
                //this.displayError(c,"No products selected");
                return false;
            }
            if(plans.length > 1){
                alert('Only one distinct plan can be changed at a time');
                return false;
            }
            
            c.set("v.selectedPlan", plans[0]);
            
        }catch(ex){
            console.error(methodName, ex);
            alert(ex);
        }
        return true;
    },
    searchProducts: function(c){
        var methodName = "h.searchProducts";
        var self = this;
        var existingLineItemIds = [];
        var allWonItems = c.get("v.allLineItems");
        allWonItems.forEach(function(i){
           if(i.selected) existingLineItemIds.push(i.id); 
        });
        var apexParams = {
            opportunityId: c.get("v.opportunityId"), 
            existingPlan: c.get("v.selectedPlan"), 
            existingLineItemIds: existingLineItemIds,
            searchPlan: c.get("v.newPlan")
        };
        this.apex(c, "searchProducts", apexParams).then(function(result){
            console.log(methodName, "result="+JSON.stringify(result));
            var anyMatches = false;
            var count_all = 0;
            var count_matched = 0;
            if(result && result.forEach){
                result.forEach(function(r){
                    count_all++;
                    if(r.match) count_matched++;    
                });
            }
            console.log(methodName, "anyMatches="+anyMatches);
            c.set("v.anyMatches", count_matched > 0);
            c.set("v.countChangeResults", count_all);
            c.set("v.countChangeResultsMatched", count_matched);
            c.set("v.changeSearchResults", result);
        }, function(errors){ self.exceptionHandler(c,errors); });
        console.log(methodName, "end");
	},
    apexNoSpinner : function( cmp, apexAction, params ) {
        console.log('apex', 'calling ' + apexAction);
        console.log('apex', 'params: ' + JSON.stringify(params));
        var self = this;
        var p = new Promise( $A.getCallback( function( resolve , reject ) { 
            var action = cmp.get("c."+apexAction+"");
            action.setParams( params );
            action.setCallback( this , function(callbackResult) {
                if(callbackResult.getState()=='SUCCESS') {
                    resolve( callbackResult.getReturnValue() );
                }
                if(callbackResult.getState()=='ERROR') {
                    console.log('ERROR', callbackResult.getError() ); 
                    reject( callbackResult.getError() );
                }
            });
            $A.enqueueAction( action );
        }));            
        return p;
	},
    apex : function( cmp, apexAction, params ) {
        console.log('apex', 'calling ' + apexAction);
        console.log('apex', 'params: ' + JSON.stringify(params));
        this.onBeforeApex(cmp);
        var self = this;
        var p = new Promise( $A.getCallback( function( resolve , reject ) { 
            var action = cmp.get("c."+apexAction+"");
            action.setParams( params );
            action.setCallback( this , function(callbackResult) {
		        self.onAfterApex(cmp);
                if(callbackResult.getState()=='SUCCESS') {
                    resolve( callbackResult.getReturnValue() );
                }
                if(callbackResult.getState()=='ERROR') {
                    console.log('ERROR', callbackResult.getError() ); 
                    reject( callbackResult.getError() );
                }
            });
            $A.enqueueAction( action );
        }));            
        return p;
	},
    onBeforeApex: function(c){
		console.log('onBeforeApex','start');  
		var spinner = c.find('spinner');
        spinner.showIt(c);
        console.log('onBeforeApex','end');  
    },
    onAfterApex: function(c){
        console.log('onAfterApex','start');  
		var spinner = c.find('spinner');
        spinner.hideIt(c);
        console.log('onAfterApex','end');  
    },
    exceptionHandler: function(c, errors){
        console.error(JSON.stringify(errors));
        if(errors && errors.length > 0 && errors[0].message) alert(errors[0].message);
    },
    displayError: function(c, msg){
        c.set("v.messageText", msg);
        var cmp = c.find("messages");
        cmp.set("v.messageType", "error");
        cmp.set("v.dismissTimeout", 3000);
        cmp.showIt(c);
    }
})