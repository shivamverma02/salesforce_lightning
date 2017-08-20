({
    doAction : function(cmp ,event,actionName, params) {
        var btn = event.getSource();
        cmp.set('v.Spinner',true);
        btn.set("v.disabled",true);//Disable the button
        var action = cmp.get(actionName);
        action.setParams(params);
        action.setCallback(this, function(response) {
            cmp.set('v.Spinner',false);
             btn.set("v.disabled",false);
            var state = response.getState();
            if (state === "SUCCESS") {
                this.showMessage(response.getReturnValue(),"Result" );
            }
            else if (state === "ERROR") {
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        alert.log("Error message: " + 
                                  errors[0].message);
                    }
                } else {
                    alert.log("Unknown error");
                }
            }         
        });
        $A.enqueueAction(action);
    },
    showMessage: function(message , title){
        var resultsToast = $A.get("e.force:showToast");
        resultsToast.setParams({
            "title": title ,
            "message": message
        });
        resultsToast.fire();
        
        var dismissActionPanel = $A.get("e.force:closeQuickAction");
        dismissActionPanel.fire();   
    },
     BCR_BlenderCreditRatingCalculator : function(component, event , censusDataResult){
        var action = component.get("c.BCR_BlenderCreditRatingCalculatorWS");
        action.setParams({accId: component.get("v.recordId")});      
        action.setCallback(this, function(response) {
            var btn = event.getSource();
            btn.set("v.disabled",false);
            var state = response.getState();
            if (state === "SUCCESS") {
                var res = response.getReturnValue();
                this.showMessage("The Credit Rating Score is : " + res+censusDataResult, "Result");
            }
            else if(state === "ERROR") {
                alert(response.getReturnValue())
            }
        });
        $A.enqueueAction(action);
    }
})