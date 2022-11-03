//Test Class for DebriefClass
@isTest
public class DebriefClassTest{

    public static testmethod void testDebrief(){
    
        List<Product2> productsToInsert = new List<Product2>();
        List<PricebookEntry> pbesToInsert = new List<PricebookEntry>();
        
        //Create Account
        Account acct = TestClassFactory.createAccount();
        acct.BillingCountry = 'United States';
        insert acct;

        //Create Contact
        Contact con = TestClassFactory.createContact(acct);
        insert con;
        
        //Query to get Profile
        Profile p = [SELECT Id FROM Profile WHERE Name = 'System Administrator'];
        
        //Create User
        User u = new User();
        u.Alias = 'MSuser';
        u.Email = 'msu@testorg.com';
        u.EmailEncodingKey = 'UTF-8';
        u.LastName = 'MS USER';
        u.LanguageLocaleKey ='en_US';
        u.LocaleSidKey = 'en_US';
        u.ProfileId = p.Id;
        u.TimeZoneSidKey = 'America/Los_Angeles';
        u.UserName = 'UniqueUn@testorg.test';
        insert u;
        
        //Create Case
        Case c = TestClassFactory.createCase(acct,con);
        c.Status = 'Open';
        c.SVC_Oracle_Service_Request_ID__c = '12345';
        c.RecordTypeId = Case.SObjectType.getDescribe().getRecordTypeInfosByDeveloperName().get('SVC_Service_Request').getRecordTypeId();
        c.Complaint__c = true;
        c.SVC_Service_Request_Type__c = 'ABSX Install';
        insert c;
        
        //Create Products
        Product2 prod = TestClassFactory.createProduct('ABSX Warranty');
        prod.ProductCode = 'ABC1234';
        prod.SVC_OrclEHSDocofDeconReq__c = 'No';
        prod.SVC_OrclSerialized__c = false;
        productsToInsert.add(prod);
        
        Product2 laborProd = TestClassFactory.createProduct('Test Product 1');
        laborProd.ProductCode = 'SV000021';
        laborProd.SVC_Activity_Code__c = 'Billable';
        laborProd.Labor_Line__c = true;
        productsToInsert.add(laborProd);
        
        Product2 travelProd = TestClassFactory.createProduct('Test Travel');
        travelProd.ProductCode = '12345';
        travelProd.FS_Product_Line__c = 'Labor';
        productsToInsert.add(travelProd);
        
        insert productsToInsert;
        
        //Create Asset
        Asset newAsset = TestClassFactory.createAsset('API3000 - AF28211410',acct,con);
        newAsset.CurrencyIsoCode = 'USD';
        newAsset.Product2Id = productsToInsert[0].Id;
        newAsset.SerialNumber = 'ASSET12354'; 
        newAsset.SVC_Service_Zone__c = 'Zone 1';
        newAsset.Operating_Unit__c = 'SX US OU';
        insert newAsset;
        
        //Create Service Resource
        ServiceResource sr = new ServiceResource();
        sr.IsActive = true;
        sr.Name = 'Test Technician';
        sr.RelatedRecordId = u.Id;
        insert sr;
                                                        
        //Create Location
        Schema.Location loc = new Schema.Location();
        loc.Name = 'Test Location';
        loc.FS_Account__c = acct.Id;
        loc.IsInventoryLocation = true;
        loc.FS_State__c = 'NY';
        loc.FS_Country__c = 'United States';
        loc.FS_Zip__c = '12345';
        loc.Service_Resource__c = sr.Id;
        insert loc;
        
        //Create Pricebook
        Pricebook2 pb = new Pricebook2();
        pb.Name = 'United States Pricebook';
        pb.IsActive = true;
        pb.CurrencyIsoCode = 'USD';
        //pb.Oracle_Price_Book_Name__c = '123-ABC-SV0012';
        insert pb;
        
        //Creating Pricebook Entries
        PricebookEntry pbe1 = TestClassFactory.createPricebookEntry(null,productsToInsert[1]);
        pbesToInsert.add(pbe1);
        PricebookEntry pbe2 = TestClassFactory.createPricebookEntry(null,productsToInsert[2]);
        pbesToInsert.add(pbe2);
        PricebookEntry pbe3 = TestClassFactory.createPricebookEntry(pb,productsToInsert[1]);
        pbe3.CurrencyIsoCode = 'USD';
        pbesToInsert.add(pbe3);
        PricebookEntry pbe4 = TestClassFactory.createPricebookEntry(pb,productsToInsert[2]);
        pbe4.CurrencyIsoCode = 'USD';
        pbesToInsert.add(pbe4);
        
        insert pbesToInsert;
        
        //Create Work Order
        WorkOrder wo = TestClassFactory.createWorkOrder(acct);
        wo.CurrencyIsoCode = 'USD';
        wo.CaseId = c.Id;
        wo.SVC_Problem_Code__c = 'Electrical'; 
        wo.SVC_Resolution_Code__c = 'Replaced Part(s)';
        wo.SVC_Resolution_Summary__c = 'abc';
        wo.FS_Scheduled_Date_c__c = System.now();
        wo.SVC_Scheduled_End__c = System.now().addHours(2);
        wo.Pricebook2Id = pb.Id;
        wo.FS_Group_Member__c = sr.Id;
        insert wo;
        
        //Create Product Item
        ProductItem prodItem = TestClassFactory.createProductItem(loc.Id,productsToInsert[0].Id);
        insert prodItem;
        
        //Create Stocked Serial
        FS_Product_Serial__c stockedSerial = TestClassFactory.createStockSerial(prodItem.Id,productsToInsert[0].Id);
        insert stockedSerial;
        
        //Constructing Input for Debrief Upsert
        Map<String,Object> woData = new Map<String,Object>();
        woData.put('Id',wo.Id);
        woData.put('Complaint__c','Test Complaint');
        
        List<Object> debriefLines = new List<Object>();
        Map<String,Object> prodConsumedMap = new Map<String,Object>();
        prodConsumedMap.put('QuantityConsumed',2);
        prodConsumedMap.put('FSL_Start_Date_and_Time__c','2022-07-12T22:35:59.543Z');
        prodConsumedMap.put('PricebookEntryId',pbesToInsert[2].Id);
        prodConsumedMap.put('WorkOrderId',wo.Id);
        debriefLines.add(prodConsumedMap);
        
        List<Object> woNoteLines = new List<Object>();
        Map<String,Object> woNoteMap = new Map<String,Object>();
        woNoteMap.put('SVC_Note_Type__c','Internal');
        woNoteMap.put('SVC_Note_Description__c','Test Description');
        woNoteMap.put('FS_Work_Order__c',wo.Id);
        woNoteLines.add(woNoteMap);
        
        Test.startTest();
        Map<String,Object> workOrderData = DebriefClass.getWorkOrderData(wo.Id);
        List<ProductConsumed> prodsConsumed = DebriefClass.getProductsConsumedData(wo.Id);
        List<SVC_WO_Note__c> woNotes = DebriefClass.getWorkOrderNotes(wo.Id);
        List<SObject> technicianLocations = DebriefClass.getTechnicianLocation(sr.Id);
        List<SObject> productItems = DebriefClass.getProductItems(loc.Id);
        List<SObject> laborProducts = DebriefClass.getLaborProducts(pb.Id,'MS','ABSX Install','USD');
        List<SObject> travelProducts = DebriefClass.getTravelProducts(pb.Id,'MS','USD');
        List<SObject> stockedSerialData = new List<SObject>();
        System.runAs(u){
            stockedSerialData = DebriefClass.getStockedSerialRecords();    
        }
        String output = DebriefClass.insertDebrief(woData,JSON.serialize(debriefLines),'[]',new List<String>());
        Test.stopTest();
        
        //Asserts
        System.assertEquals(!workOrderData.isEmpty(),true);
        System.assertEquals(!technicianLocations.isEmpty(),true);
        System.assertEquals(!productItems.isEmpty(),true);
        System.assertEquals(!laborProducts.isEmpty(),true);
        System.assertEquals(!travelProducts.isEmpty(),true);
        System.assertEquals(!stockedSerialData.isEmpty(),true);
        System.assertEquals(output,'Success');
    }
}