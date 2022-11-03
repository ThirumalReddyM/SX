public class ProductConsumedTriggerHandler{

    public static void insertDailyTravel(List<ProductConsumed> newList,Map<Id,ProductConsumed> newMap){
        
        Map<Id, ProductConsumed> woTravelZoneChargesMap = new Map<Id, ProductConsumed>();
        Map<String, ProductConsumed> woTravelDailyChargesMap = new Map<String, ProductConsumed>();
        Map<Id,Product2> productMap = new Map<Id,Product2>();
        Map<String,String> pbeMap = new Map<String,String>();
        List<ProductConsumed> insertList = new List<ProductConsumed>();
        List<ProductConsumed> records = new List<ProductConsumed>();
        Set<Id> woSet = new Set<Id>();
        Set<String> prodCodeSet = new Set<String>();
        Set<Id> productIdSet = new Set<Id>();
        Id usageConsumptionRecordTypeId = Schema.SObjectType.ProductConsumed.getRecordTypeInfosByDeveloperName().get('Usage_Consumption').getRecordTypeId();

        Map<String,SVC_Zone_Travel_Charge_Countries__c> countryMap = SVC_Zone_Travel_Charge_Countries__c.getAll();
    
        //Daily Travel Charge
        prodCodeSet.add('SV000029');
        for(SVC_Zone_Travel_Charge_Product_Map__c ztc : SVC_Zone_Travel_Charge_Product_Map__c.getAll().values()){
            prodCodeSet.add(ztc.SVC_Product_Code__c);
        }
        
        records = [SELECT Id,QuantityConsumed,FSL_Start_Date_and_Time__c,FSL_End_Date_and_Time__c,WorkOrderId,Product2Id,Product2.Name,Service_Resource__c,PricebookEntryId FROM ProductConsumed WHERE Id IN :newMap.keySet()];
        
        for(ProductConsumed wd : records){
            woSet.add(wd.WorkOrderId);
            productIdSet.add(wd.Product2Id);
        }

        productMap = new Map<Id, Product2>([SELECT Id, Name FROM Product2 WHERE Id in :productIdSet]);

        for(ProductConsumed wd : [SELECT Id, WorkOrderId, Product2Id, FSL_Start_Date_and_Time__c,Product2.Name FROM ProductConsumed WHERE WorkOrderId IN :woSet AND Line_Sub_Type__c = 'Travel']){
            if(wd.Product2Id != null && wd.Product2.Name != null && wd.Product2.Name.startsWith('ZONE')){
                woTravelZoneChargesMap.put(wd.WorkOrderId, wd);
            }
            else if(wd.Product2Id != null && wd.Product2.Name != null && wd.Product2.Name.equalsIgnoreCase('SV Daily Travel') && wd.FSL_Start_Date_and_Time__c != null){
                woTravelDailyChargesMap.put(wd.WorkOrderId + '|' + wd.FSL_Start_Date_and_Time__c.date(), wd);
            }
        }

        Map<Id,WorkOrder> woMap = new Map<Id,WorkOrder>([SELECT Id,Pricebook2Id,CurrencyIsoCode,AssetId,Asset.FS_Country__c,SVC_Serv_Request_Type__c,Asset.SVC_Service_Zone__c, Asset.Product2.SVC_Division_Products__c FROM WorkOrder WHERE Id in :woSet]);
        
        for(PricebookEntry pbe : [SELECT Id,Pricebook2Id,Product2Id,CurrencyIsoCode,Product2.ProductCode,Product2.SVC_Division_Products__c FROM PricebookEntry WHERE IsActive = true AND CurrencyIsoCode != null AND Product2.ProductCode IN :prodCodeSet]){
            if(!String.isEmpty(pbe.Product2.SVC_Division_Products__c)){
                pbeMap.put(pbe.Product2.ProductCode + '-' + pbe.Product2.SVC_Division_Products__c + '-' + pbe.Pricebook2Id + '-' + pbe.CurrencyIsoCode,pbe.Id);
            }
        }

        for(ProductConsumed wd : records){
            WorkOrder wo = woMap.get(wd.WorkOrderId);
            if (wo != null && wo.Asset.FS_Country__c != null && countryMap.containsKey(wo.Asset.FS_Country__c)){
                if (wo != null && wo.AssetId != null && productMap.get(wd.Product2Id) != null && productMap.get(wd.Product2Id).Name == 'Non Billable Travel'){
                    String travelZone = wo.Asset.SVC_Service_Zone__c;
                    if (travelZone != null){
                        SVC_Zone_Travel_Charge_Product_Map__c cs = SVC_Zone_Travel_Charge_Product_Map__c.getInstance(travelZone);
                        if (cs != null && woTravelZoneChargesMap.get(wd.WorkOrderId) == null){
                            ProductConsumed wdNew = new ProductConsumed();
                            wdNew.WorkOrderId = wo.Id;
                            wdNew.QuantityConsumed = 1;
                            wdNew.FS_Line_Type__c = 'Parts';
                            wdNew.Line_Sub_Type__c = 'Travel';
                            wdNew.FSL_Start_Date_and_Time__c = wd.FSL_Start_Date_and_Time__c;
                            wdNew.RecordTypeId = usageConsumptionRecordTypeId;
                            wdNew.QuantityConsumed = 1;
                            wdNew.Service_Resource__c = wd.Service_Resource__c;
                            wdNew.SVC_Auto_Generated_Travel_Line__c = true;
                            wdNew.FS_Work_Detail__c = wd.Id;
                            System.debug('SVC_Product_Code__c ::'+cs.SVC_Product_Code__c);
                            System.debug('wo.Asset.Product2.SVC_Division_Products__c::'+wo.Asset.Product2.SVC_Division_Products__c);
                            System.debug('wo.Pricebook2Id::'+wo.Pricebook2Id);
                            System.debug('wo.CurrencyIsoCode::'+wo.CurrencyIsoCode);
                            if(!pbeMap.isEmpty() && pbeMap.containsKey(cs.SVC_Product_Code__c + '-' + wo.Asset.Product2.SVC_Division_Products__c + '-' + wo.Pricebook2Id + '-' + wo.CurrencyIsoCode)){
                            System.debug('if');
                                wdNew.PricebookEntryId = pbeMap.get(cs.SVC_Product_Code__c + '-' + wo.Asset.Product2.SVC_Division_Products__c + '-' + wo.Pricebook2Id + '-' + wo.CurrencyIsoCode);
                            }
                            else{
                            System.debug('else');
                                wdNew.PricebookEntryId = wd.PricebookEntryId;
                            }
                            if (wo.SVC_Serv_Request_Type__c != null && (wo.SVC_Serv_Request_Type__c == 'ABSX Other' || wo.SVC_Serv_Request_Type__c == 'ABSX Install' || wo.SVC_Serv_Request_Type__c == 'ABSX Entitled')){
                                wdNew.FS_Activity_Type__c = 'Non Billable Travel';
                            }
                            else{
                                wdNew.FS_Activity_Type__c = 'Billable Travel';
                            }
                            if (wd.FSL_Start_Date_and_Time__c != null && wd.QuantityConsumed != null && wd.FSL_End_Date_and_Time__c != null){
                                Integer minutes = (wd.QuantityConsumed * 60).intValue();
                                wdNew.FSL_End_Date_and_Time__c = wd.FSL_Start_Date_and_Time__c.addMinutes(minutes);
                            }
                            insertList.add(wdNew);
                            woTravelZoneChargesMap.put(wd.WorkOrderId, wdNew);  
                        }
                        else if(cs != null && woTravelZoneChargesMap.get(wd.WorkOrderId) != null && woTravelDailyChargesMap.get(wd.WorkOrderId + '|' + wd.FSL_Start_Date_and_Time__c.date()) == null){ 
                            ProductConsumed pc = woTravelZoneChargesMap.get(wd.WorkOrderId);
                            if(pc.FSL_Start_Date_and_Time__c != null && wd.FSL_Start_Date_and_Time__c != null && pc.FSL_Start_Date_and_Time__c.date() != wd.FSL_Start_Date_and_Time__c.date()){
                                ProductConsumed wdNew = new ProductConsumed();
                                wdNew.WorkOrderId = wo.Id;
                                wdNew.QuantityConsumed = 1;
                                wdNew.FS_Line_Type__c = 'Parts';
                                wdNew.Line_Sub_Type__c = 'Travel';
                                wdNew.FSL_Start_Date_and_Time__c = wd.FSL_Start_Date_and_Time__c;
                                wdNew.QuantityConsumed = 1;
                                wdNew.Service_Resource__c = wd.Service_Resource__c;
                                wdNew.SVC_Auto_Generated_Travel_Line__c = true;
                                wdNew.FS_Work_Detail__c = wd.Id;
                                if(!pbeMap.isEmpty() && pbeMap.containsKey('SV000029' + '-' + wo.Asset.Product2.SVC_Division_Products__c + '-' + wo.Pricebook2Id + '-' + wo.CurrencyIsoCode)){
                                    wdNew.PricebookEntryId = pbeMap.get('SV000029' + '-' + wo.Asset.Product2.SVC_Division_Products__c + '-' + wo.Pricebook2Id + '-' + wo.CurrencyIsoCode);
                                }
                                else{
                                    wdNew.PricebookEntryId = wd.PricebookEntryId;
                                }
                                if (wo.SVC_Serv_Request_Type__c != null && (wo.SVC_Serv_Request_Type__c == 'ABSX Other' || wo.SVC_Serv_Request_Type__c == 'ABSX Install' || wo.SVC_Serv_Request_Type__c == 'ABSX Entitled')){
                                    wdNew.FS_Activity_Type__c = 'Non Billable Travel';
                                }
                                else{
                                    wdNew.FS_Activity_Type__c = 'Billable Travel';
                                }
                                if(wd.FSL_Start_Date_and_Time__c != null && wd.QuantityConsumed != null && wd.FSL_End_Date_and_Time__c != null){
                                    Integer minutes = (wd.QuantityConsumed * 60).intValue();
                                    wdNew.FSL_End_Date_and_Time__c = wd.FSL_End_Date_and_Time__c.addMinutes(minutes);
                                }
                                wdNew.RecordTypeId = usageConsumptionRecordTypeId;
                                insertList.add(wdNew);
                                woTravelDailyChargesMap.put(wdNew.WorkOrderId + '|' + wdNew.FSL_Start_Date_and_Time__c.date(), wdNew);
                            }
                        }
                    }
                }
            }
        }

        if(!insertList.isEmpty()){
            insert insertList;
        }
    }

    public static void checkUpdatedTravel(List<ProductConsumed> newList,Map<Id,ProductConsumed> oldMap){
        List<ProductConsumed> wdList = new List<ProductConsumed>();
        Set<Id> wdIds = new Set<Id>();
        Map<Id, ProductConsumed> autoCreatedWDMap = new Map<Id,ProductConsumed>();

        for(ProductConsumed wd : newList){
            if(wd.Line_Sub_Type__c == 'Travel' && (wd.FSL_Start_Date_and_Time__c != oldMap.get(wd.Id).FSL_Start_Date_and_Time__c || wd.QuantityConsumed != oldMap.get(wd.Id).QuantityConsumed)){
                wdIds.add(wd.Id);
            }
        }

        if (!wdIds.isEmpty()){
            List<ProductConsumed> tzList = [SELECT Id, FSL_Start_Date_and_Time__c, FSL_End_Date_and_Time__c, QuantityConsumed, FS_Work_Detail__c FROM ProductConsumed WHERE FS_Work_Detail__c in :wdIds];
            if (tzList != null){
                for (ProductConsumed wdNew : tzList){
                    autoCreatedWDMap.put(wdNew.FS_Work_Detail__c, wdNew);
                }
            }
        }

        for(ProductConsumed wd : newList){
            if (wd.Line_Sub_Type__c == 'Travel' && (wd.FSL_Start_Date_and_Time__c != oldMap.get(wd.Id).FSL_Start_Date_and_Time__c || wd.QuantityConsumed != oldMap.get(wd.Id).QuantityConsumed)){
                if (wd.FSL_Start_Date_and_Time__c != null && wd.QuantityConsumed != null){
                    Integer minutes = (wd.QuantityConsumed * 60).intValue();
                    ProductConsumed wdAuto = autoCreatedWDMap.get(wd.Id);
                    if (wdAuto != null){
                        ProductConsumed wdNew = new ProductConsumed(Id = wdAuto.Id);
                        if (wdNew != null){
                            wdNew.FSL_Start_Date_and_Time__c = wd.FSL_Start_Date_and_Time__c;
                            wdNew.FSL_End_Date_and_Time__c = wd.FSL_Start_Date_and_Time__c.addMinutes(minutes);
                            wdList.add(wdNew);
                        }
                    }
                }
            }
        }

        if(!wdList.isEmpty()){
            upsert wdList;
        }
    }

    public static void setupTravelLines(List<ProductConsumed> newList, Map<Id, ProductConsumed> oldMap,Map<Id, ProductConsumed> newMap){
        Set<Id> productIdSet = new Set<Id>();
        Set<Id> woSet = new Set<Id>();
        List<ProductConsumed> records = new List<ProductConsumed>();
        
        for(ProductConsumed wd : [SELECT Id,Line_Sub_Type__c,QuantityConsumed,FSL_Start_Date_and_Time__c,FSL_End_Date_and_Time__c,WorkOrderId,Product2Id,Product2.Name FROM ProductConsumed WHERE Id IN :newMap.keySet()]){
            woSet.add(wd.WorkOrderId);
            productIdSet.add(wd.Product2Id);
            records.add(wd);
        }
        
        Map<Id,WorkOrder> woMap = new Map<Id,WorkOrder>([SELECT Id,AssetId,SVC_Serv_Request_Type__c,Asset.SVC_Service_Zone__c, Asset.Product2.SVC_Division_Products__c FROM WorkOrder WHERE Id IN :woSet]);
        Map<Id,Product2> productMap = new Map<Id,Product2>([SELECT Id,Name FROM Product2 WHERE Id IN :productIdSet]);

        for(ProductConsumed wd : records){
            WorkOrder wo = woMap.get(wd.WorkOrderId);
            if(wo != null && wo.AssetId != null && productMap.get(wd.Product2Id) != null && productMap.get(wd.Product2Id).Name == 'Non Billable Travel'){
                wd.FS_Is_Billable__c = false;  
            }
            if(wd.Line_Sub_Type__c  == 'Travel' && wo.SVC_Serv_Request_Type__c != null && (wo.SVC_Serv_Request_Type__c == 'ABSX Other' || wo.SVC_Serv_Request_Type__c == 'ABSX Install' || wo.SVC_Serv_Request_Type__c == 'ABSX Entitled')){
                wd.FS_Activity_Type__c = 'Non Billable Travel';
            }
            else if(wd.Line_Sub_Type__c  == 'Travel'){
                wd.FS_Activity_Type__c = 'Billable Travel';
            }
            if (/*wd.Line_Sub_Type__c == 'Travel' && **/(Trigger.isInsert || (oldMap.get(wd.Id) != null && (wd.FSL_Start_Date_and_Time__c != oldMap.get(wd.Id).FSL_Start_Date_and_Time__c || wd.QuantityConsumed != oldMap.get(wd.Id).QuantityConsumed)))){
                if(wd.FSL_Start_Date_and_Time__c != null && wd.QuantityConsumed != null){
                    Integer minutes = (wd.QuantityConsumed * 60).intValue();
                    wd.FSL_End_Date_and_Time__c = wd.FSL_Start_Date_and_Time__c.addMinutes(minutes);
                }
            }
        }
    }
    
    //This method is to update the PricebookEntry field on the Product Consumed when Debriefs sync from Oracle
    /*public static void updatePricebookEntry(List<ProductConsumed> newList){
        Map<String,WorkOrder> workOrderMap = new Map<String,WorkOrder>();
        Set<String> pricebookIds = new Set<String>();
        Map<String,String> pbeMap = new Map<String,String>();
        Set<Id> woSet = new Set<Id>();
        Set<String> productIds = new Set<String>();
        
        for(ProductConsumed wd : newList){
            if(!String.isEmpty(wd.Product__c)){
                woSet.add(wd.WorkOrderId);
                productIds.add(wd.Product__c);
            }
            if(wd.FSL_Start_Date_and_Time__c != null && wd.QuantityConsumed != null){
                Integer minutes = (wd.QuantityConsumed * 60).intValue();
                wd.FSL_End_Date_and_Time__c = wd.FSL_Start_Date_and_Time__c.addMinutes(minutes);
            }            
        }
        
        if(woSet.size() > 0){
            for(WorkOrder wo : [SELECT Id,Pricebook2Id,CurrencyIsoCode FROM WorkOrder WHERE Id IN :woSet AND Pricebook2Id != null AND CurrencyIsoCode != null]){
                workOrderMap.put(wo.Id,wo);
                pricebookIds.add(wo.Pricebook2Id);
            }

            for(PricebookEntry pbe : [SELECT Id,Pricebook2Id,Product2Id,CurrencyIsoCode FROM PricebookEntry WHERE IsActive = true AND CurrencyIsoCode != null AND Pricebook2Id IN :pricebookIds AND Product2Id IN :productIds]){
                pbeMap.put(pbe.Product2Id + '-' + pbe.Pricebook2Id + '-' + pbe.CurrencyIsoCode,pbe.Id);
            }
        }
        
        //Populate PricebookEntry
        for(ProductConsumed prodConsumed : newList){
            if(!String.isEmpty(prodConsumed.Product__c) && !pbeMap.isEmpty() && workOrderMap.get(prodConsumed.WorkOrderId) != null){
                String key = prodConsumed.Product__c + '-' + workOrderMap.get(prodConsumed.WorkOrderId).Pricebook2Id + '-' + workOrderMap.get(prodConsumed.WorkOrderId).CurrencyIsoCode;
                if(!String.isEmpty(pbeMap.get(key))){
                    prodConsumed.PricebookEntryId = pbeMap.get(key);
                }
            }
        }
    }*/
}