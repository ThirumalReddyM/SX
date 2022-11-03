@IsTest
public class AssetHierarchyControllerTest {
    
    @testSetup static void setup() {
        Account accntRec = new Account(Name='Test Accnt', BillingCountry = 'India');
        insert accntRec;
        
        Schema.Location locationRec1=new Schema.Location();
        locationRec1.Name='Hyderabad';
        locationRec1.LocationType='Warehouse';
        insert locationRec1;
        
        Schema.Location locationRec2=new Schema.Location();
        locationRec2.Name='Bangalore';
        locationRec2.LocationType='Warehouse';
        insert locationRec2;
        
        Asset assetRec= new Asset(AccountId=accntRec.Id,Name='Parent 1',SerialNumber='1222',LocationId=locationRec2.Id);
        insert assetRec;
        
        List<Asset> childAssLs=new List<Asset>();
        Asset childAssetRec= new Asset(AccountId=accntRec.Id,Name='Child 1',SerialNumber='122112'
                                       ,ParentId=assetRec.Id,LocationId=locationRec1.Id);
        Asset childAssetRec2= new Asset(AccountId=accntRec.Id,Name='Child 2',SerialNumber='122112'
                                        ,ParentId=childAssetRec.Id,LocationId=locationRec1.Id);
        childAssLs.add(childAssetRec);
        childAssLs.add(childAssetRec2);
        insert childAssLs;
        
    }
    
    @IsTest
    public static void getAllParentAssetsTest(){
        Asset parAssetRec =[SELECT Name FROM Asset Where Name ='Parent 1'];
        Test.startTest();
        List<Asset> parAssetRes = AssetHierarchyController.getAllParentAssets(parAssetRec.Id);
        Test.stopTest();
        System.assertEquals(parAssetRes.size()>0,true);
        
    }
    
    @IsTest
    public static void getChildAssetsTest(){
        Asset parAssetRec =[SELECT Name FROM Asset Where Name ='Parent 1'];
        Test.startTest();
        List<Asset> childAssetRes = AssetHierarchyController.getChildAssets(parAssetRec.Id);
        Test.stopTest();
        System.assertEquals(childAssetRes.size()>0,true);
        
    }
    @IsTest
    public static void search(){
        Asset parAssetRec =[SELECT Name FROM Asset Where Name ='Parent 1'];
        Test.startTest();
        List<Asset> childAssetRes = AssetHierarchyController.search(parAssetRec.Id);
        Test.stopTest();
        System.assertEquals(childAssetRes.size()>0,true);
        
    }
    @IsTest
    public static void updateAsset(){
        Asset parAssetRec =[SELECT Name FROM Asset Where Name ='Parent 1'];
        Asset childAssetRec =[SELECT Name FROM Asset Where Name ='Child 1'];
        Asset childAssetRec2 =[SELECT Name FROM Asset Where Name ='Child 2'];
        Id childAssetId = childAssetRec2.Id;
        Id parentAssetId = parAssetRec.Id;
        AssetHierarchyController.updateAsset(childAssetId, parentAssetId);
        Asset A = [Select Id, ParentId from Asset where id =: childAssetId  LIMIT 1];
        System.assertEquals(A.ParentId, parentAssetId);
        test.startTest();
        try{
            String returnvalue = AssetHierarchyController.updateAsset(childAssetId, childAssetId);
        } catch (DmlException ex) {
            System.assertEquals('expected text', ex.getMessage());
        }  
        test.stopTest();    
    }
}