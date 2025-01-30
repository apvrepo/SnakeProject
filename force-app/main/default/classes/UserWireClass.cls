/**********************************************************************************
* Name             UserWireClass.js
* Author          Andres Pereyra
* Date            26/08/24
* Description     This is an Apex Class which is used by two LWC components via wire service 
                   (Parent: 'LWCArcade' and Child: 'LWCArcadeChild').
   					
                   *** Credits: 
                   Original Game: Snake II™ - ©1998 NOKIA CORPORATION - Developer: Taneli Armanto.
                   Game Sounds Source: PAC-MAN™ & ©1980 BANDAI NAMCO Entertainment Inc.
                   Cellphone Image: NOKIA 1100 - NOKIA CORPORATION.
***********************************************************************************
* MODIFICATION LOG
* Version            Developer          Date               Description
* ------------------------------------------------------------------------------
* 1.0                Andres Pereyra     26 August 2024           Initial Creation 
* *********************************************************************************/

public with sharing  class UserWireClass {
    @AuraEnabled(cacheable=true)
    public static List<User> getUsers() {
        return [
            SELECT Id, GameScore__c, Name, FullPhotoUrl
            FROM User
            WHERE GameScore__c != NULL
            ORDER BY GameScore__c DESC LIMIT 4
        ];
    }
    @AuraEnabled
    public static void updateUsers(String id, String gameScore) {
        List<User> uList =[SELECT Id, Name, GameScore__c
                           FROM User
                           WHERE Id = :id
                           LIMIT 1];
        System.debug('FLAG01 - UserWireClass.updateUsers() - id: ' + id);
        System.debug('FLAG02 - UserWireClass.updateUsers() - gameScore: ' + gameScore);
        if(uList.size() > 0){
            uList[0].GameScore__c = Integer.valueOf(gameScore);
            Database.SaveResult sR = Database.update(uList[0], false);
            if (sR.isSuccess()) {
                // Operation was successful, so get the ID of the record that was processed
                System.debug('FLAG03 - UserWireClass.updateUsers() - Successfully updated User ID: ' + sR.getId());
                //   return u;
            }
            else {
                // Operation failed, so get all errors                
                for(Database.Error err : sR.getErrors()) {
                    System.debug('FLAG04 - UserWireClass.updateUsers() - The following error has occurred.');                    
                    System.debug(err.getStatusCode() + ': ' + err.getMessage());
                    System.debug('User fields that affected this error: ' + err.getFields());
                    //  return err;
                }
            }
        }
    }
      @AuraEnabled
    public static List<User> getUsersImperatively() {
             System.debug('FLAG05 - UserWireClass.getUsersImperatively()');
        return [
            SELECT Id, GameScore__c, Name, FullPhotoUrl
            FROM User
            WHERE GameScore__c != NULL
            ORDER BY GameScore__c DESC LIMIT 4
        ];
    }
}