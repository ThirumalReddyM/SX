public class ProductConsumedRecursiveSaveHelper {
    //TODO: This class will stop allowing triggers to fire-in twice 

  // initialize a variable to hold state  
  private static boolean alreadyRunPreWorkDetails = false;
  private static boolean alreadyRunPostWorkDetails = false;
  
  // get the state
    public static boolean isAlreadyRunPreWorkDetails() {
        return alreadyRunPreWorkDetails;
    }
    
    public static boolean isAlreadyRunPostWorkDetails() {
        return alreadyRunPostWorkDetails;
    }
    

    // set this to true to keep track of and avoid recursive updates.  Generally set after first time through
    // a trigger.  We can access this in the trigger and avoid recursive updates...
   
    public static void setAlreadyRunPreWorkDetails() {
        alreadyRunPreWorkDetails = true;
    }
    
    public static void setAlreadyRunPostWorkDetails() {
        alreadyRunPostWorkDetails = true;
    }
}