public class ProductRequestHandler {
    
    @AuraEnabled
    public static String getObjectName(String recordId) {
        String myIdPrefix = String.valueOf(recordId).substring(0,3);
        String objectName = '';
        //Loop through all the sObject types returned by Schema
        for(Schema.SObjectType stype : Schema.getGlobalDescribe().values()){
            String prefix = stype.getDescribe().getKeyPrefix();
            //Check if the prefix matches with requested prefix
            if(prefix!=null && prefix.equals(myIdPrefix)){
                objectName = stype.getDescribe().getName();
                System.debug('Object Name! ' + objectName);
                break;
            }
        }
        return objectName;
    }
    
    @AuraEnabled
    public static Schema.Location fetchLocation(String locationId) {
        return [SELECT Id,FS_Account__c, Name, Service_Resource__c, Country_Mapping__r.Distribution_Center__c,
                Country_Mapping__r.Distribution_Center__r.Name,FS_City__c,FS_Country__c,FS_State__c,FS_Street__c,FS_Zip__c
                FROM Location 
                WHERE Id = :locationId];
    }
    
    @AuraEnabled
    public static WorkOrder fetchWorkOrder(String workOrderId) {
        return [SELECT Id, FS_Group_Member__c, WorkOrderNumber, Location.Name, Location.Country_Mapping__r.Return_Location__c,
                Location.Country_Mapping__r.Distribution_Center__c,Location.Country_Mapping__r.Distribution_Center__r.Name,
                Location.FS_City__c,Location.FS_Country__c,Location.FS_State__c,Location.FS_Street__c,Location.FS_Zip__c,
                LocationId,AccountId 
                FROM WorkOrder 
                WHERE Id = :workOrderId];
    }
    
    @AuraEnabled
    public static List<Schema.Location> fetchLocationList(String subQuery) {
        system.debug('called');
        String query = 'SELECT Id,Name, FS_City__c,FS_Country__c,FS_State__c,FS_Street__c,FS_Zip__c FROM Location '+subQuery;
        System.debug('Query -> ' + query);
        return Database.query(query);
    }
    
    @AuraEnabled
    public static List<sObject> fetchProducts(string searchParam, string itemStatusType) {
        System.debug('searchParam:::'+searchParam);
        System.debug('itemStatusType:::'+itemStatusType);
        
        String likeParam = '%' + searchParam + '%';
        String itemStatusQuery = (itemStatusType != null ? (itemStatusType == 'DAL' ? 'DAL_Item_Status__c' :(itemStatusType == 'ADC' ? 'ADC_Item_Status__c' : (itemStatusType == 'CNA' ? 'CNA_Item_Status__c' : (itemStatusType == 'JDC' ? 'JDC_Item_Status__c' : (itemStatusType == 'EDC' ? 'EDC_Item_Status__c' :'' ) ))) ) : '');
        if(String.isNotBlank(itemStatusQuery)) {
            itemStatusQuery += ' IN (\'Active\',\'ActExtSell\',\'PenObSell\',\'ActExhaust\',\'ActvSell\',\'PendInact\') ';
        }
        String query = 'SELECT Id, Name, ProductCode, Family, FS_Product_Line__c, SVC_OrclEHSDocofDeconReq__c,Manufacturer__c, ';
        query += 'FS_Unit_Of_Measure__c, SVC_OrclInstrumentModelGroup__c, SVC_OrclSerItemClassification__c, SVC_OrclSerReturnable__c, ';
        query += 'SVC_OrclItemStatus__c, SVC_OrclItemRemarks__c FROM Product2 WHERE FS_Tracking__c != \'Lot/Batch Tracked\' AND ';
        query += 'SVC_OrclLotControlled__c = false AND SVC_OrclSerItemClassification__c NOT IN ';
        query += '(\'Service Training\',\'Service Labor\',\'Fixed Price\',\'Instrument Package\',\'Instruments\') AND ';
        query += 'SVC_OrclSerItemClassification__c != null AND SVC_OrclSerialized__c = false AND ';
        query +=  itemStatusQuery;
        query +=  String.isNotBlank(itemStatusQuery) ? ' AND ' : '';
        query += 'SVC_OrclInstallBaseTrackable__c = false ';
        query += (!String.isEmpty(searchParam)) ? 'AND (Name Like :likeParam OR ProductCode like :likeParam) ' : '';
        query += 'LIMIT 50';
        
        System.debug('Query -> ' + query);
        
        List<SObject> sObjectList = Database.query(query);
        return sObjectList;
    }
    
    @AuraEnabled
    public static void insertReturnLines(String jsonOfListOfReturnLines) {    
        List<ProductRequestLineItem> listOfReturnLines = (List<ProductRequestLineItem>) JSON.deserialize(jsonOfListOfReturnLines, List<ProductRequestLineItem>.class);
        insert listOfReturnLines;
    }
}