/*******************
 * Name - ProductConsumedTriggerHandlerTest
 * Created by - Narayanan Natarajan
 */
@isTest
public class ProductConsumedTriggerHandlerTest {
    @testSetup 
    public static void method1() {

        SVC_Zone_Travel_Charge_Countries__c zoneCountry = new SVC_Zone_Travel_Charge_Countries__c(Name = 'Australia');
        insert zoneCountry; 

        SVC_Zone_Travel_Charge_Product_Map__c zoneRec = new SVC_Zone_Travel_Charge_Product_Map__c(Name ='Zone 1', SVC_Product_Code__c = 'P001');
        insert zoneRec;

        Account acc=TestClassFactory.createAccount();
        insert acc;
        
        Contact contact = TestClassFactory.createContact(acc);
        insert contact;
        
        Case caseRec = TestClassFactory.createCase(acc, contact);
        caseRec.SVC_Service_Request_Type__c = 'ABSX Other';
        insert caseRec; 
          
        List<Product2> productList = new List<Product2> {
            TestClassFactory.createProduct('Non Billable Travel'),
            TestClassFactory.createProduct('ZONE - Non Billable Travel'),
            TestClassFactory.createProduct('SV Daily Travel')
        };
        productList[1].ProductCode = 'P001';
        insert productList;
        
        Asset asset = TestClassFactory.createAsset('Test Asset 1', acc, contact);
        asset.FS_Country__c = 'Australia';
        asset.SVC_Service_Zone__c = 'Zone 1';
        asset.Product2Id = productList[0].Id;
        insert asset;
        
        WorkOrder WO = TestClassFactory.createWorkOrder(acc);
        WO.Pricebook2Id = Test.getStandardPricebookId();
        WO.CaseId = caseRec.Id;
        WO.AssetId = asset.Id;
        insert WO;
        
        List<PricebookEntry> priceBookEntryList = new List<PricebookEntry>();
        priceBookEntryList.add(TestClassFactory.createPricebookEntry(null,productList[0]));
        priceBookEntryList.add(TestClassFactory.createPricebookEntry(null,productList[1]));
        priceBookEntryList.add(TestClassFactory.createPricebookEntry(null,productList[2]));
        insert priceBookEntryList;

        ProductConsumed prodConsumed = new ProductConsumed(
            WorkOrderId = WO.Id,
            QuantityConsumed = 1,
            FS_Activity_Type__c = 'Travel',
            Line_Sub_Type__c = 'Travel',
            PricebookEntryId = pricebookEntryList[2].Id,
            FSL_Start_Date_and_Time__c = Datetime.now(),
            FSL_End_Date_and_Time__c = Datetime.now() + 1
        );
        insert prodConsumed;
        
        List<ProductConsumed> productConsumedList = new List<ProductConsumed> {
            new ProductConsumed(
                WorkOrderId = WO.Id,
                QuantityConsumed = 1,
                FS_Activity_Type__c = 'Travel',
                Line_Sub_Type__c = 'Travel',
                PricebookEntryId = pricebookEntryList[2].Id,
                FSL_Start_Date_and_Time__c = Datetime.now(),
                FSL_End_Date_and_Time__c = Datetime.now() + 1,
                FS_Work_Detail__c = prodConsumed.Id
            ),
            new ProductConsumed(
                WorkOrderId = WO.Id,
                QuantityConsumed = 1,
                FS_Activity_Type__c = 'Travel',
                Line_Sub_Type__c = 'Travel',
                PricebookEntryId = pricebookEntryList[0].Id,
                FSL_Start_Date_and_Time__c = Datetime.now(),
                FSL_End_Date_and_Time__c = Datetime.now() + 1,
                FS_Work_Detail__c = prodConsumed.Id
            )
        };
        insert productConsumedList;

        
    }   
    
    public static testMethod void insertDailyTravelTest() { 
    
        WorkOrder WO = [SELECT Id FROM WorkOrder];
        PriceBookEntry pricebookentry = [SELECT Id FROM PricebookEntry WHERE Product2.Name = 'Non Billable Travel'];
    
        List<ProductConsumed> prodConsumedList = new List<ProductConsumed> {
                new ProductConsumed(
                    WorkOrderId = WO.Id,
                    QuantityConsumed = 1,
                    FS_Activity_Type__c = 'Travel',
                    Line_Sub_Type__c = 'Travel',
                    PricebookEntryId = pricebookentry.Id,
                    FSL_Start_Date_and_Time__c = Datetime.now(),
                    FSL_End_Date_and_Time__c = Datetime.now() + 1
                ),
                new ProductConsumed(
                    WorkOrderId = WO.Id,
                    QuantityConsumed = 1,
                    FS_Activity_Type__c = 'Travel',
                    Line_Sub_Type__c = 'Travel',
                    PricebookEntryId = pricebookentry.Id,
                    FSL_Start_Date_and_Time__c = Datetime.now() + 1,
                    FSL_End_Date_and_Time__c = Datetime.now() + 2
                ),
                new ProductConsumed(
                    WorkOrderId = WO.Id,
                    QuantityConsumed = 1,
                    FS_Activity_Type__c = 'Travel',
                    Line_Sub_Type__c = 'Travel',
                    PricebookEntryId = pricebookentry.Id,
                    FSL_Start_Date_and_Time__c = Datetime.now() + 2,
                    FSL_End_Date_and_Time__c = Datetime.now() + 3
                )
            };
            insert prodConsumedList;
            
        
    }
    public static testMethod void checkUpdatedTravelTest() { 
    
        WorkOrder WO = [SELECT Id FROM WorkOrder];
        PriceBookEntry pricebookentry = [SELECT Id, Product2Id FROM PricebookEntry WHERE Product2.Name = 'Non Billable Travel'];
        List<ProductConsumed> OldProductConsumedList = [SELECT Id, QuantityConsumed,FSL_Start_Date_and_Time__c FROM ProductCOnsumed WHERE FS_Work_Detail__c = NULL];
            
        OldProductConsumedList[0].QuantityConsumed = 2;
        update OldProductConsumedList;    
        List<ProductConsumed> newProductConsumedList = [SELECT Id, QuantityConsumed,FSL_End_Date_and_Time__c FROM ProductCOnsumed WHERE FS_Work_Detail__c != NULL];
        System.debug('Assert 1'+(OldProductConsumedList[0].FSL_Start_Date_and_Time__c).addMinutes(120));
        System.debug('Assert 2'+newProductConsumedList[0].FSL_End_Date_and_Time__c);
        
    }
        
    public static testMethod void updatePricebookEntryTest() { 
    
        WorkOrder WO = [SELECT Id FROM WorkOrder LIMIT 1];
        PriceBookEntry pricebookentry = [SELECT Id, Product2Id FROM PricebookEntry WHERE Product2.Name = 'Non Billable Travel'];
    
        List<ProductConsumed> prodConsumedList = new List<ProductConsumed> {
                new ProductConsumed(
                    WorkOrderId = WO.Id,
                    QuantityConsumed = 1,
                    FS_Activity_Type__c = 'Travel',
                    Line_Sub_Type__c = 'Travel',
                    Product__c = pricebookentry.Product2Id,
                    FSL_Start_Date_and_Time__c = Datetime.now(),
                    FSL_End_Date_and_Time__c = Datetime.now() + 1
                )
            };
            insert prodConsumedList;
    }
    
    public static testMethod void setupTravelLinesTest() { 
    
        List<ProductConsumed> OldProductConsumedList = [SELECT Id, QuantityConsumed, FSL_Start_Date_and_Time__c FROM ProductCOnsumed WHERE PricebookEntry.Product2.Name = 'Non Billable Travel'];
        OldProductConsumedList[0].FSL_Start_Date_and_Time__c = OldProductConsumedList[0].FSL_Start_Date_and_Time__c + 1;
        OldProductConsumedList[0].QuantityConsumed = 20;
        update OldProductConsumedList;
    }
    
    public static testMethod void testCompare(){
        ProductConsumed pc1 = new ProductConsumed(QuantityConsumed = 1,FSL_Start_Date_and_Time__c = System.today());
        ProductConsumed pc2 = new ProductConsumed(QuantityConsumed = 1);
        ProductConsumerTriggerHelper pcth = new ProductConsumerTriggerHelper(pc1);
        ProductConsumerTriggerHelper pcth2 = new ProductConsumerTriggerHelper(pc2);
        Test.startTest();
        pcth.compareTo(pcth);
        pcth2.compareTo(pcth2);
        Test.stopTest();
    }
    
    public static testMethod void testRecursion(){
        Test.startTest();
        ProductConsumedRecursiveSaveHelper.isAlreadyRunPreWorkDetails();
        ProductConsumedRecursiveSaveHelper.setAlreadyRunPreWorkDetails();
        Test.stopTest();
    }
}