/**
** @author Reid Beckett, Cloudware Connections
** @created Nov 1/2016
**
** Test coverage for AssetTreeSectionController
**/
@isTest
public class AssetTreeSectionControllerTests 
{
    @isTest
    public static void test_fromRoot() {
        Asset assetObj = [select Id from Asset where Name = 'Root Asset'];
        AssetTreeSectionController c = new AssetTreeSectionController(new ApexPages.StandardController(assetObj));
        c.initAction();
        c.nid = assetObj.Id;
        c.onClickNodeAction();
    }

    @isTest
    public static void test_fromChild() {
        Asset assetObj = [select Id from Asset where Name = 'L1 Asset'];
        AssetTreeSectionController c = new AssetTreeSectionController(new ApexPages.StandardController(assetObj));
        c.initAction();
        c.nid = assetObj.Id;
        c.onClickNodeAction();
    }

    @isTest
    public static void test_fromGrandChild() {
        Asset assetObj = [select Id from Asset where Name = 'L2 Asset'];
        AssetTreeSectionController c = new AssetTreeSectionController(new ApexPages.StandardController(assetObj));
        c.initAction();
        c.nid = assetObj.Id;
        c.onClickNodeAction();
        system.debug(c.theTree.root.hasChildren);
        system.debug(c.theTree.root.getChild(0));
        system.debug(c.theTree.root.buttonCss);
        system.debug(c.theTree.root.titleCss);

        assetObj = [select Id from Asset where Name = 'L3 Asset'];
        c = new AssetTreeSectionController(new ApexPages.StandardController(assetObj));
        c.initAction();
        c.nid = assetObj.Id;
        c.onClickNodeAction();

        assetObj = [select Id from Asset where Name = 'L4 Asset'];
        c = new AssetTreeSectionController(new ApexPages.StandardController(assetObj));
        c.initAction();
        c.nid = assetObj.Id;
        c.onClickNodeAction();

        assetObj = [select Id from Asset where Name = 'L5 Asset'];
        c = new AssetTreeSectionController(new ApexPages.StandardController(assetObj));
        c.initAction();
        c.nid = assetObj.Id;
        c.onClickNodeAction();

        assetObj = [select Id from Asset where Name = 'L6 Asset'];
        c = new AssetTreeSectionController(new ApexPages.StandardController(assetObj));
        c.initAction();
        c.nid = assetObj.Id;
        c.onClickNodeAction();
    }
    
    @testSetup
    static void setUp(){
        Account acct = new Account(Name = 'Test Account', BillingCountry = 'Canada');
        insert acct;
        
        Asset[] assets = new Asset[]{
        	new Asset(AccountId = acct.Id, Name = 'Root Asset'),
        	new Asset(AccountId = acct.Id, Name = 'L1 Asset'),
        	new Asset(AccountId = acct.Id, Name = 'L2 Asset'),
        	new Asset(AccountId = acct.Id, Name = 'L3 Asset'),
        	new Asset(AccountId = acct.Id, Name = 'L4 Asset'),
        	new Asset(AccountId = acct.Id, Name = 'L5 Asset'),
        	new Asset(AccountId = acct.Id, Name = 'L6 Asset')
        };
		insert assets;

        assets[1].ParentId = assets[0].Id;
        assets[2].ParentId = assets[1].Id;
        assets[3].ParentId = assets[2].Id;
        assets[4].ParentId = assets[3].Id;
        assets[5].ParentId = assets[4].Id;
        assets[6].ParentId = assets[5].Id;
        update assets;
	}
}