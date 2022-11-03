({
    doInit : function(component,event,helper){
        var myPageRef = component.get("v.pageReference");
        var product2Id = myPageRef.state.c__Pid;
        console.log('ID -> ' + product2Id)
        component.set("v.product2Id", product2Id);
        var productItemcolumns = [
            {'label': 'Product Item Number', 'fieldName': 'ProductItemNumber', 'type': 'text', 'sortable' : true,'initialwidth':200},
            {'label': 'Location', 'fieldName': 'LocationId', 'type': 'text', 'sortable' : true,'initialwidth':200},
            {'label': 'Product Name', 'fieldName': 'Product2Id', 'type': 'text', 'sortable' : true,'initialwidth':200},
            {'label': 'Product Code', 'fieldName': 'SVC_Product_Code__c', 'type': 'text', 'sortable' : true,'initialwidth':200},
            {'label': 'Available Qty','fieldName': 'QuantityOnHand', 'type': 'text', 'sortable' : true,'initialwidth':200},
            {'label': 'Unit of Measure','fieldName': 'QuantityUnitOfMeasure', 'type': 'text', 'sortable' : true,'initialwidth':200},
            {'label': 'SER Returnable','fieldName': 'SVC_SER_Returnable__c', 'type': 'text', 'sortable' : true,'initialwidth':200}
        ]; 
        component.set("v.productItemcolumns",productItemcolumns);
    },
    onSearchTermChange : function(component,event,helper){
        var componentEvent = component.getEvent('ProductItemEvent');
        var searchText = component.find('searchInput').get('v.value');
        componentEvent.setParams({
            searchText : searchText
        });
        componentEvent.fire();
    },
    handleEvent : function(component,event,helper){
        
        component.set("v.isloading",true);
        var searchParam = event.getParam('searchText');
        console.log(searchParam) 
        var action = component.get('c.fetchProductItems');
        action.setParams({
            searchParam : searchParam,
            searchFilter : component.get("v.selectedFileter")
        });
        action.setCallback(this, function(response){
            var state = response.getState();
            console.log('State', state)
            if(state === 'SUCCESS'){
                var responseValue = response.getReturnValue();
                console.log('Response Value', responseValue)
                responseValue.forEach(element=>{
                    if (element.Location.Name){ element.LocationId = element.Location.Name;}
                                      })
                responseValue.forEach(element=>{
                    if (element.Product2.Name){ element.Product2Id = element.Product2.Name;}
                                      })
                responseValue.forEach(element=>{
                    if (element.Product2.ProductCode){ element.SVC_Product_Code__c = element.Product2.ProductCode;}
                                      })
                component.set("v.rows",responseValue);
                component.set("v.isloading",false);
            }
            else if (state === "INCOMPLETE") {
                component.set("v.isloading",false);
            }
                else if (state === "ERROR") {
                    component.set("v.isloading",false);
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            console.log("Error message: " + 
                                        errors[0].message);
                        }
                    } else {
                        console.log("Unknown error");
                    }
                }
        });
        $A.enqueueAction(action);
    },
    
    handleSort :function(component,event,helper){
        component.set("v.isloading",true);
        var sortBy = event.getParam("fieldName");
        var sortDirection = event.getParam("sortDirection");
        component.set("v.sortBy",sortBy);
        component.set("v.sortDirection",sortDirection);
        helper.sortData(component,sortBy,sortDirection);
        component.set("v.isloading",false);
    },
    
    handleFilterChange  :function(component,event,helper){
        component.set("v.isloading",true);
        component.set("v.rows",[]);
        var searchText = component.find('searchInput').get('v.value'); 
        if(searchText){
            component.find('searchInput').set('v.value',undefined)
        }
        component.set("v.isloading",false);
    },
    handleCancel  :function(component,event,helper){
        var navService = component.find("navService");
        console.log(component.get("v.product2Id"),'get id')
        var myPageRef = component.get("v.pageReference");
        var product2Id = myPageRef.state.c__Pid;
        console.log('ID -> ' + product2Id);
        if(product2Id)   
        { 
            
            var pageReference = {
                type: 'standard__recordPage',
                attributes: {
                    recordId: component.get("v.product2Id"),
                    objectApiName: 'Product2',
                    actionName: 'view'
                }
            };
          navService.navigate(pageReference);
        }
        else
        {
            
            var action = component.get("c.getListViews");
            action.setCallback(this, function(response){
                var state = response.getState();
                
                if (state === "SUCCESS") {
                    var listviews = response.getReturnValue();
                    console.log('list views',listviews[0])
                    var navEvent = $A.get("e.force:navigateToList");
                    navEvent.setParams({
                        "listViewId": listviews[0].Id,
                        "listViewName": listviews[0].Name,
                        "scope": "Product2"
                    });
                    navEvent.fire();
                }
            });
            $A.enqueueAction(action);
            
        }
       
   }
    
})