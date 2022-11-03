public class ProductConsumerTriggerHelper implements Comparable{
    
    public ProductConsumed pc;
    public Date startDate;
    
    public ProductConsumerTriggerHelper(ProductConsumed pc){
        this.pc = pc;   
        if(pc.FSL_Start_Date_and_Time__c != null){
            this.startDate = pc.FSL_Start_Date_and_Time__c.date();
        }
        else{
            this.startDate = System.today();
        }
    }
    
    public Integer compareTo(Object compareTo){
        ProductConsumed compareToPC = ((ProductConsumerTriggerHelper) compareTo).pc;
        if(compareToPC.FSL_Start_Date_and_Time__c != null){
            if(this.startDate == compareToPC.FSL_Start_Date_and_Time__c.date()){
                return 0;
            }
            if(this.startDate < compareToPC.FSL_Start_Date_and_Time__c.date()){
                return -1;
            }
        }
        return 1;
    }
}