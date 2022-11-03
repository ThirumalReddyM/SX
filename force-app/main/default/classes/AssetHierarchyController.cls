public class AssetHierarchyController {
    
    @AuraEnabled(cacheable=true)
    public static List<Asset> getAllParentAssets(Id parentRecId){
        return [SELECT Id,Name,SerialNumber,Product2.Name,Parent.Name,Location.Name, ParentId FROM Asset WHERE Id = :parentRecId LIMIT 1];
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Asset> search(Id recordId){
        Asset selectedAsset = [SELECT Id,Name,LocationId FROM Asset WHERE Id = :recordId LIMIT 1];
        String locationId = selectedAsset.LocationId;
        String myQuery = null;
        if(recordId != null && !String.isEmpty(locationId)){
            myQuery = 'SELECT Id, Name FROM Asset WHERE LocationId = :locationId AND Id != :recordId';
        }
        List<Asset> lookUpList = Database.query(myQuery);
        return lookUpList;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Asset> findAssetHierarchyData(string recId){
        List<Asset> assetList = new List<Asset>();
        string queryString = 'select id,name, parentId,Product2.Name,Parent.Name,Location.Name from Asset ';
        //Section to get all child account details from ultimate parent starts-------------------------
        List<String> currentParent      = new List<String>{};
        Integer level               = 0;
        Boolean endOfStructure      = false;
        //method to find ultimate parent of account
        string topMostparent = GetUltimateAssetParentId(recId );
        system.debug('*******topMostparent:'+topMostparent);
        currentParent.add(topMostparent);
        system.debug('**********topMostparent:'+ currentParent);
        //Loop though all children
        string finalQueryString = '';
        List<Asset>  queryOutput = new List<Asset> ();
        while ( !endOfStructure ){  
            if( level == 0 ){
                finalQueryString = queryString + ' where id IN : CurrentParent ORDER BY ParentId  Limit 1000';
            } 
            else {
                finalQueryString = queryString + ' where ParentID IN : CurrentParent ORDER BY ParentId Limit 1000';
            }
            system.debug('********finalQueryString:'+finalQueryString);
            if(finalQueryString != null && finalQueryString !=''){
                try{
                    if(Limits.getLimitQueries()-Limits.getQueries()>0){
                        queryOutput = database.query(finalQueryString);
                        system.debug('***hierarchy level:'+level);
                    }else{
                        system.debug('****endOfStructure is true as SOQL limit reaches:');
                        endOfStructure = true;
                    }
                }catch(exception ex){ 
                    endOfStructure = true;
                }
            }
            system.debug('**queryOutput size:'+queryOutput);
            if( queryOutput.size() == 0 ){
                endOfStructure = true;
            }
            else{
                currentParent.clear();
                //iterating through query output
                for ( Integer i = 0 ; i < queryOutput.size(); i++ ){
                    currentParent.add(queryOutput[i].Id);
                    assetList.add(queryOutput[i]);
                 }
            }
            level++;
        }
        system.debug('**********assetList:'+assetList);
        return assetList;
    }
    
    // Find the tom most element in Heirarchy  
    // @return objId
    @AuraEnabled(cacheable=true)
    public static String GetUltimateAssetParentId( string recId ){
        Boolean top = false;
        while ( !top ) {
            string queryString = 'select id ,name, ParentId from Asset where Id =:recId LIMIT 1';
            Asset assetRec = database.query(queryString);
            if ( assetRec.parentId != null ) {
                recId = assetRec.parentId;
            }else {
                top = true;
            }
        }
        return recId;
    }
    
   
     @AuraEnabled(cacheable=true)
    public static List<Asset> searchAsset(String searchParam, Id recordId) {
        System.debug('searchParam:::'+searchParam);
        String likeParam = '%' + searchParam + '%';
        Asset selectedAsset =  [SELECT Id,Name,LocationId FROM Asset where Id=:recordId LIMIT 1];
        String locationId=selectedAsset.LocationId;
        String myQuery = null;
        if(recordId != null && locationId!=null){
            myQuery = 'Select Id, Name from Asset Where LocationId=:locationId';
            myQuery += String.isNotEmpty(searchParam) ? ' AND Name Like :likeParam' : '';
        }
        List<Asset> lookUpList = Database.query(myQuery);
        return lookUpList;
    }
}