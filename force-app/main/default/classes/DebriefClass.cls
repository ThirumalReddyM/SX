public class DebriefClass{
    
    @AuraEnabled
    public static Map<String,Object> getWorkOrderData(String recordId){
        WorkOrder woData = [SELECT Id,WorkOrderNumber,AssetId,FS_Order_Type__c,Account.Name,FS_Billing_Type__c,CaseId,SVC_PO_Number__c,CurrencyIsoCode,
                            SVC_FSE_Internal_Note__c,SVC_Serv_Request_Type__c,SVC_Division_Products__c,SVC_Cost_Center__c,FS_Group_Member__c,Service_Guide__c,
                            FS_Group_Member__r.Name,FS_Group_Member__r.Location.Name,Pricebook2Id,SVC_PO_Value__c,Complaint__c,Software_Version__c
                            FROM WorkOrder
                            WHERE Id = :recordId LIMIT 1];
        
        String woString = JSON.serialize(woData);
        Map<String,Object> workOrderMap = (Map<String,Object>)JSON.deserializeUntyped(woString);
        workOrderMap.remove('attributes');
        return workOrderMap;
    }
    
    @AuraEnabled
    public static List<ProductConsumed> getProductsConsumedData(String workOrderId){
        List<ProductConsumed> pcList = new List<ProductConsumed>();
        pcList = [SELECT Id,WorkOrderId,SVC_Case__c,QuantityConsumed,Product2Id,ProductItemId,Product2.Name,Product2.ProductCode,FS_Consumed_From_Location__c,FS_Consumed_From_Location__r.Name,
                  FSL_Start_Date_and_Time__c,FSL_End_Date_and_Time__c,Service_Resource__c,Service_Resource__r.Name,FS_Line_Type__c,FS_Activity_Type__c,
                  SER_Decon_Required__c,SER_Refurbishable__c,SVC_SER_Returnable__c,SVC_WDLotNumber__c,Lot_Controlled_Part__c,Stocked_Serial__c,
                  Lot_Controlled_Part__r.Name,Stocked_Serial__r.Name,Application_Workflow_Problem__c,PricebookEntryId,SVC_Division_Products__c,Line_Sub_Type__c
                  FROM ProductConsumed WHERE WorkOrderId = :workOrderId];
        return pcList;
    }
    
    @AuraEnabled
    public static List<SVC_WO_Note__c> getWorkOrderNotes(String workOrderId){
        List<SVC_WO_Note__c> woNoteList = new List<SVC_WO_Note__c>();
        woNoteList = [SELECT Id,SVC_Note_Description__c,SVC_Note_Type__c FROM SVC_WO_Note__c WHERE FS_Work_Order__c = :workOrderId];
        return woNoteList;
    }
    
    @AuraEnabled
    public static List<SObject> getTechnicianLocation(String technicianId){
        List<SObject> locationData = new List<SObject>();
        if(!String.isEmpty(technicianId)){
            locationData = [SELECT Id,Name,FS_City__c,FS_State__c,FS_Country__c,Service_Resource__c,Service_Resource__r.Name FROM Location WHERE Service_Resource__c = :technicianId AND Active__c = true];
        }
        return locationData;
    }
    
    @AuraEnabled
    public static List<SObject> getProductItems(String locationId){
        return [SELECT Id,ProductItemNumber,LocationId,Product2Id,Product2.Name,Location.Name,SVC_Product_Code__c,QuantityOnHand,
                SVC_SER_Decon_Required__c,SVC_SER_Refurbishable__c,SVC_SER_Returnable__c
                FROM ProductItem WHERE LocationId = :locationId AND QuantityOnHand > 0];
    }
    
    @AuraEnabled
    public static List<SObject> getLaborProducts(String pricebookId,String divisionProduct,String taskType,String currencyCode){
        String taskTypeString = '%' + taskType + '%';
        List<PricebookEntry> pbes = new List<PricebookEntry>();
        pbes = [SELECT Id,Product2Id,Product2.Name,Product2.ProductCode,Product2.SVC_Activity_Code__c FROM PricebookEntry WHERE IsActive = true AND Pricebook2Id = :pricebookId AND
                Product2.Labor_Line__c = true AND (NOT Product2.SVC_Activity_Code__c LIKE '%Travel%') AND
                Product2.SVC_Division_Products__c = :divisionProduct AND CurrencyIsoCode = :currencyCode AND
                Product2.SVC_Allowable_Service_Request_Types__c LIKE :taskTypeString];
        return pbes;
    }
    
    @AuraEnabled
    public static List<SObject> getTravelProducts(String pricebookId,String divisionProduct,String currencyCode){
        List<PricebookEntry> pbes = new List<PricebookEntry>();
        pbes = [SELECT Id,Product2Id,Product2.Name,Product2.ProductCode,Product2.SVC_Division_Products__c,Product2.SVC_Activity_Code__c FROM PricebookEntry WHERE IsActive = true AND Pricebook2Id = :pricebookId AND 
                Product2.Name LIKE '%Travel%' AND (NOT Product2.Name LIKE '%Standard%') AND CurrencyIsoCode = :currencyCode AND
                ProductCode NOT IN ('SV000029','SV000076') AND Product2.FS_Product_Line__c = 'Labor' AND
                Product2.SVC_Division_Products__c = :divisionProduct];
        
        return pbes;
    }
    
    @AuraEnabled
    public static List<SObject> getStockedSerialRecords(){
        List<FS_Product_Serial__c> stockedSerialList = new List<FS_Product_Serial__c>();
        stockedSerialList = [SELECT Id,SVC_OrclLotNumber__c,FS_Product_Item__c,FS_Product__c,FS_Product__r.Name,Name FROM FS_Product_Serial__c WHERE SM_My_Product_Stock__c = 1];
        return stockedSerialList;
    }
    
    @AuraEnabled
    public static String insertDebrief(Map<String,Object> workOrderData,String debriefLines,String workOrderNotes,List<String> toBeDeletedIds){
        
        System.debug('Work Order Data -> ' + workOrderData);
        System.debug('Debriefs -> ' + debriefLines);
        System.debug('WO Notes -> ' + workOrderNotes);
        
        List<SObject> listOfRecordsToInsert = new List<SObject>();
        List<Object> debriefList = (List<Object>)JSON.deserializeUntyped(debriefLines);
        List<Object> woNoteList = (List<Object>)JSON.deserializeUntyped(workOrderNotes);
        List<Id> listToBeDeleted = (List<Id>)toBeDeletedIds;
        
        //Upsert Work Order
        if(!workOrderData.isEmpty()){
            WorkOrder wo = new WorkOrder(); 
            for(String key : workOrderData.keySet()){
                wo.put(key,String.valueOf(workOrderData.get(key)));
            }
            listOfRecordsToInsert.add(wo);
        }
        
        //Inserting Products Consumed
        if(!debriefList.isEmpty()){
            for(Object debriefInfo : debriefList){
                ProductConsumed pc = new ProductConsumed();
                Map<String,Object> debriefMap = (Map<String,Object>)(debriefInfo);
                debriefMap.remove('index');
                debriefMap.remove('TechnicianName');
                debriefMap.remove('ProductStockName');
                debriefMap.remove('ProductName');
                debriefMap.remove('LocationName');
                debriefMap.remove('LotControlledName');
                debriefMap.remove('StockedSerialName');
                debriefMap.remove('ConsumedFromLocationName');
                
                if(debriefMap.containsKey('Id') && String.isEmpty(String.valueOf(debriefMap.get('Id')))){
                   debriefMap.remove('Id');
                }
                if(debriefMap.containsKey('Id') && !String.isEmpty(String.valueOf(debriefMap.get('Id')))){
                   debriefMap.remove('WorkOrderId');
                }
                if(debriefMap.containsKey('Id') && !String.isEmpty(String.valueOf(debriefMap.get('Id'))) && !String.isEmpty(String.valueOf(debriefMap.get('ProductItemId')))){
                   debriefMap.remove('ProductItemId'); 
                }
                
                for(String key : debriefMap.keySet()){
                    if(debriefMap.get(key) != null && debriefMap.get(key) != ''){
                        if(key == 'QuantityConsumed'){
                            pc.put(key,Decimal.valueOf(String.valueOf(debriefMap.get(key))));
                        }
                        else if(key == 'FSL_Start_Date_and_Time__c'){
                            String startTime = String.valueOf(debriefMap.get(key));
                            startTime = startTime.replace('T',' ').subStringBefore('.');
                            DateTime startDateTime = DateTime.valueOf(startTime);
                            pc.put(key,startDateTime);
                        }
                        else{
                            pc.put(key,String.valueOf(debriefMap.get(key))); 
                        }
                    }
                }
                pc.RecordTypeId = Schema.SObjectType.ProductConsumed.getRecordTypeInfosByDeveloperName().get('Usage_Consumption').getRecordTypeId();
                listOfRecordsToInsert.add(pc);
            }
        }
        
        //Inserting Work Order Notes
        if(!woNoteList.isEmpty()){
            for(Object woNoteInfo : woNoteList){
                SVC_WO_Note__c woNote = new SVC_WO_Note__c();
                Map<String,Object> woNoteMap = (Map<String,Object>)(woNoteInfo);
                woNoteMap.remove('index');
                for(String key : woNoteMap.keySet()){
                    if(woNoteMap.get(key) != null && woNoteMap.get(key) != ''){
                        woNote.put(key,String.valueOf(woNoteMap.get(key)));
                    }
                }
                listOfRecordsToInsert.add(woNote);
            }
        }
        
        System.debug('List -> ' + listOfRecordsToInsert);
        
        try{
            if(listOfRecordsToInsert.size() > 0){
                upsert listOfRecordsToInsert;
            }
            
            //Deletion
            if(listToBeDeleted.size() > 0){
               Database.delete(listToBeDeleted,true); 
            }
            
        }
        catch(DMLException e){
            String msg = '';
            for(Integer i = 0; i < e.getNumDml(); i++){
                msg =+ e.getDmlMessage(i) + '\n' ;
            }
            throw new AuraHandledException(msg);
        }
        
        return 'Success';    
    }
}