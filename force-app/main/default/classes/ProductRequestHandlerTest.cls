@isTest
public class ProductRequestHandlerTest{
    
    @testSetup static void setup(){   
        Schema.Location sourceLocation = new Schema.Location();
        sourceLocation.Name='Test Source Location';
        sourceLocation.LocationType='Warehouse';
        sourceLocation.IsInventoryLocation=true;
        insert sourceLocation;
        
        Schema.Location destinationLocation = new Schema.Location();
        destinationLocation.Name='Test Destination Location';
        destinationLocation.LocationType='Warehouse';
        destinationLocation.IsInventoryLocation=true;
        insert destinationLocation;        
      
        Product2 product = new Product2();
        product.Name = 'Test Product';
        product.Family = 'Hardware';
        product.ProductCode = '123';
        insert product;
        
        Case caseInstance = new Case();
        caseInstance.Status ='New';
        caseInstance.Priority = 'Medium';
        caseInstance.Origin = 'Email';
        insert caseInstance;
        
        WorkOrder workOrder = new WorkOrder();
        workOrder.subject ='title';
        workOrder.CaseId = caseInstance.Id;
        workOrder.LocationId= destinationLocation.Id;
        insert workOrder;
        
        ProductRequest prodRequest = new ProductRequest();
        prodRequest.NeedbyDate= System.today()+1;
        prodRequest.CaseId = caseInstance.Id;
        prodRequest.SourceLocationId = sourceLocation.Id;
        prodRequest.DestinationLocationId = destinationLocation.Id;
        insert prodRequest;
    }
    
    @isTest
    public static void fetchProducts(){
        Product2 prod2 = [Select Id, Name, ProductCode, Family, FS_Product_Line__c, SVC_OrclEHSDocofDeconReq__c,Manufacturer__c, FS_Unit_Of_Measure__c FROM Product2 
                          WHERE Name ='Test Product'];
                          
        Schema.Location loc = new Schema.Location();
        loc.Name = 'Test Location 12';
        loc.IsInventoryLocation = true;
        loc.FS_State__c = 'NY';
        loc.FS_Country__c = 'United States';
        loc.FS_Zip__c = '12345';
        insert loc;
        
        ProductItem prodItem = TestClassFactory.createProductItem(loc.Id,prod2.Id);
        insert prodItem;
        
        Test.startTest();
        List<SObject> ProductRecparams = ProductRequestHandler.fetchProducts('Test Product', 'DAL');
        Test.stopTest();
    }
    
    @isTest
    public static void fetchWorkOrder(){
        WorkOrder workOrder = [Select Id from WorkOrder];
        Test.startTest();
        workOrder = ProductRequestHandler.fetchWorkOrder(workOrder.Id);
        System.assertEquals(workOrder != NULL,true);
        Test.stopTest();
    }
    
    @isTest
    public static void fetchLocation(){
        Schema.Location location = [Select Id from Location WHERE Name = 'Test Source Location'];
        Test.startTest();
        location  = ProductRequestHandler.fetchLocation(location.Id);
        System.assertEquals(location != NULL,true);
        Test.stopTest();
    }
    
    @isTest
    public static void insertReturnLines(){
        ProductRequest productRequest = [SELECT Id, Needbydate, WorkOrderId, SourceLocationId, DestinationLocationId FROM ProductRequest];
        Product2 prod2 =[Select Id, Name, ProductCode, Family, FS_Product_Line__c, SVC_OrclEHSDocofDeconReq__c,Manufacturer__c, FS_Unit_Of_Measure__c from Product2 
                         ];
        List<ProductRequestLineItem> productRequestLineItemList = new List<ProductRequestLineItem> {
            new ProductRequestLineItem(
                QuantityRequested = 1,
                Product2Id = prod2.Id,
                ParentId = productRequest.Id,
                NeedByDate = productRequest.Needbydate,
                WorkOrderId = productRequest.WorkOrderId,
                SourceLocationId  = productRequest.SourceLocationId,
                DestinationLocationId  = productRequest.DestinationLocationId
            )
        };
        ProductRequestHandler.insertReturnLines(JSON.serialize(productRequestLineItemList));
        productRequestLineItemList = [SELECT Id FROM ProductRequestLineItem];
        System.assertEquals(productRequestLineItemList != NULL,true);
        System.assertEquals(productRequestLineItemList.size() > 0,true);

    }
    
    @isTest
    public static void getObjectNameTest(){
        Test.startTest();
        String response  = ProductRequestHandler.getObjectName('005X884848');
        System.assertEquals(response,'User');
        Test.stopTest();
    }
    
    @isTest
    public static void fetchLocationListTest(){
        Test.startTest();
        List<Schema.Location> locationList  = ProductRequestHandler.fetchLocationList('');
        System.assertEquals(locationList != NULL,true);
        Test.stopTest();
    }
}