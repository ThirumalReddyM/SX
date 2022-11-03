({
	getOptions : function(c) {
        var methodName = "inputPicklistHelper.getOptions";
        try{
            var sobjectType = c.get("v.sobjectType");
            var fieldName = c.get("v.fieldName");
            var includeBlankOption = c.get("v.includeBlankOption");
			var controllingValue = c.get("v.controllingValue");  
            var value = c.get("v.value");
            
            console.log('inputPicklistHelper.getOptions','START:'+fieldName);
            if(!sobjectType) {
                c.set("v.optionsLoaded",true);
                return;
            }

            var apexParams = {
                "sobjectType" : sobjectType,
                "fieldName" : fieldName,
                "includeBlankOption" : includeBlankOption,
                "value":value,
                "controllingValue":controllingValue
            };
                           
            this.apex(c, "getOptions", apexParams).then(function(result){
                console.log('inputPicklistHelper.getOptions', 'sobjectType='+sobjectType+'; fieldName='+fieldName+'; result='+JSON.stringify(result));
                if(result) {
                	console.log(methodName,"before set options");
                    c.set("v.options", result);
                	console.log(methodName,"after set options");
                    var val = c.get("v.value");
                    console.log('inputPicklistHelper.getOptions', 'val='+val);
                    if(val==0) {
                        console.log('inputPicklistHelper.getOptions', 'unsetting val because it is zero');
                        c.set('v.value',null);
                        val = null;
                    }
                    if(result.length > 0 && !val) {
                        console.log("inputPicklistHelper.getOptions: setting value = " + result[0]);
                        c.set("v.value", result[0].value);
                    }
                }
                console.log(methodName,"before set optionsLoaded");
                var fieldName = c.get("v.fieldName");
                c.set("v.optionsLoaded",true);
                console.log(methodName,"after set optionsLoaded");
            });                         

            console.log('inputPicklistHelper.getOptions','END getOptions');
        }catch(ex){
            console.error(ex);
            console.error(ex.message);
        }
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
        console.log('onBeforeApex','end');  
    },
    onAfterApex: function(c){
        console.log('onAfterApex','start');  
        console.log('onAfterApex','end');  
    },
    exceptionHandler: function(c, errors){
        console.error(JSON.stringify(errors));
        if(errors && errors.length > 0 && errors[0].message) alert(errors[0].message);
    }
})