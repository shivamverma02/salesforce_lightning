({
    changeEmail : function(cmp, event, helper) {
        cmp.set("v.showChangeEmail",true);
        cmp.set("v.showCheckEsign",false);
    },
	changeEmailAction : function(cmp, event, helper) {
        
		var accountId = cmp.get("v.recordId");
        var updatedEmail = cmp.get("v.newEmail");
      
        cmp.set('v.showEmptyEmailMessage',false);
        //Validation
        if($A.util.isEmpty(updatedEmail) || updatedEmail == 'null'){
            cmp.set('v.showEmptyEmailMessage',true);
            return;
        }
        cmp.set('v.Spinner',true);
        var action = cmp.get("c.changeEmailWS");
        action.setParams({
            accId  : accountId,
            newEmail : updatedEmail
        });
        
        action.setCallback(this,function(a){
            cmp.set('v.Spinner',false);
            var state = a.getState();
            if(state == "SUCCESS"){
                cmp.set('v.showSuccessMessage',true);
            } else if(state == "ERROR"){
                cmp.set('v.showErrorMessage',true);
            }
        });
        $A.enqueueAction(action);
	},
    changeEmailRegistration : function(cmp,evt,helper) {
        cmp.set("v.showChangeEmail",false);
         cmp.set("v.showCheckEsign",true);
        helper.doAction(cmp,evt,"c.changeEmailRegistrationWS",{ accId : cmp.get("v.recordId") });
    },
    checkEsign : function(cmp, event, helper) {
        cmp.set("v.showCheckEsign",true);
        cmp.set("v.showChangeEmail",false);
    },    
    checkEsignAction : function(cmp, event, helper) {
 		var accId = cmp.get("v.recordId");
        var person = cmp.get("v.person");
        //Validation
        if($A.util.isEmpty(person) || person == 'null' || person == "-------"){
            alert('Please select main person or Spouse to check eSign');
            return;
        }
        var isSpouse = false;
        if (person == "Spouse") {
            isSpouse = true;
        }
        var params = {
            accId : accId,
            spouse : isSpouse
        };
		helper.doAction(cmp,event,"c.checkEsignWS",params);
	},
    c6PersonSearch : function(cmp, event, helper) {
        cmp.set("v.showCheckEsign",false);
        cmp.set("v.showChangeEmail",false);
        var params = { 
            accId : cmp.get("v.recordId") 
        };
        helper.doAction(cmp,event,"c.fetchC6PersonSerachFile",params);
        
    },
    invest : function(cmp, event, helper) {
         cmp.set("v.showCheckEsign",false);
        cmp.set("v.showChangeEmail",false);
        var accountId = cmp.get("v.recordId");
        
        var urlEvent = $A.get("e.force:navigateToURL");
        var url; 
        
        url = "/apex/LenderManualInvest?scontrolCaching=1&id="+accountId;
        
        urlEvent.setParams({
            "url": url
        });
        urlEvent.fire();
        
    },
    whyICantValidateThisBorrower :function(cmp,evt,helper){
        cmp.set("v.showCheckEsign",false);
        cmp.set("v.showChangeEmail",false);
        var btn = evt.getSource();
        cmp.set('v.Spinner',true);
        btn.set("v.disabled",true);
        var action = cmp.get("c.getAccount");
        var params = {
            accId : cmp.get("v.recordId")
        };
        action.setCallback(this, function(response) {
            cmp.set('v.Spinner',false);
            btn.set("v.disabled",false);
            var Account = response.getReturnValue();
            if(Account.J5_CCode_4_Uncheck_me__c)
                helper.showMessage('Please uncheck Invalid CC Code','Result');
            else if(Account.No_CC_Transactions__c && Account.Geography__c=='IL'){
                helper.showMessage('No CC Transaction for user','Result');
            }
                else if(Account.Has_a_family_member_registered__c){
                    helper.showMessage('Please uncheck block','Result');
                }
                    else if(Account.Bank_Statement_ID__c == ''){
                        helper.showMessage('please confirm the bank account by editing it and saving','Result');
                    }
                        else if(Account.peer__IsActiveInvestor__c){
                            helper.showMessage('he is an active investor','Result');
                        }
                            else if(Account.Documents_Not_Verified_Count__c > 0){
                                helper.showMessage('has non-uploaded documents','Result');
                            }
                                else if(Account.peer__Verified__c && Account.Geography__c =='IL'){
                                    helper.showMessage('did not verify his email','Result');
                                }
                                    else if(Account.J5_CC_Verified__c == 0 && Account.CCode4_User__c && Account.Geography__c=='IL'){
                                        helper.showMessage('No CCTransaction with either 700 or 4 code','Result');
                                    }
            
                                        else if(Account.Borrower_SMS_Verified_Count__c <= 0){
                                            helper.showMessage('no verified sms','Result');
                                        }
            
                                            else if(Account.C6_Person_Search_Result__c != 'GOOD' && Account.C6_Person_Search_Result__c != 'EMPTY SEARCH RESULT' && Account.Geography__c=='LT'){
                                                helper.showMessage('Need C6 check','Result');
                                            }
            
                                                else if(Account.DD_Status__c != 'Received' && Account.Geography__c=='IT'){
                                                    helper.showMessage('Need SDD Mandate','Result');
                                                }
            
                                                    else {
                                                        helper.showMessage('looks ok!','Result');
                                                    }
        });
         $A.enqueueAction(action);
    },
     blenderRating : function(component, event, helper) {
        var btn = event.getSource();
        //component.set('v.Spinner',true);
        btn.set("v.disabled",true);
        component.set("v.showCheckEsign",false);
        component.set("v.showChangeEmail",false);
        var action = component.get("c.createCensusDataCRandGetAccountWS");
        action.setParams({accId: component.get("v.recordId")});      
        action.setCallback(this, function(response) {
            //component.set('v.Spinner',false);
            var state = response.getState();
            if (state === "SUCCESS") {
                var result = JSON.parse(response.getReturnValue());
                var account = result.account;
                var funds = parseInt(account.loan__Undeployed_Funds__c);
                if (account.peer__Investor_Status__c == 'Verified'|| funds > 0.00 || result.validatorResult == true) {
                    helper.BCR_BlenderCreditRatingCalculator(component,event,result.censusDataResult);
                }
                else {
                    var urlEvent = $A.get("e.force:navigateToURL");
                    urlEvent.setParams({
                        "url": '/apex/Blender_Rating_Pop_Up?id=' + component.get("v.recordId")
                    });
                    urlEvent.fire();
                }
            }
            else if(state === "ERROR") {
                alert(response.getReturnValue())
            }
        });
        $A.enqueueAction(action);
    }, 
    "BlockUser" : function(cmp,event,helper) {
         cmp.set("v.showCheckEsign",false);
        cmp.set("v.showChangeEmail",false);
         var params = { 
            accId : cmp.get("v.recordId") 
        };
        helper.doAction(cmp,event,"c.blockUserWS",params);
        
    }
})