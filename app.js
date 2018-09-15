// Module pattern, we create a controller module

// first two controllers are standalone and independent and are not connected, not even know each other existence
// BUDGET CONTROLLER
var budgetController = (function(){
    //function constructor for expense type
    var Expense = function(id, description,value){
        this.id= id;
        this.description = description;
        this.value = value;
    };
    var Income = function(id, description,value){
        this.id= id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(curr){
            sum += curr.value;
            });
            data.totals[type] = sum;
        
    };
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },

        budget: 0,
        percentage: -1
    };

    return {
        addItem: function(type,des,val){
            
            var newItem, ID;
            // create new ID
            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            
            // Push it into our data structure
            data.allItems[type].push(newItem);

            // Return the new element
            return newItem;            
        },

        deleteItem: function(type, id){
            var ids, index;
            ids = data.allItems[type].map(function(current){
                return current.id;
            })

            index=ids.indexOf(id);
            if(index !== -1){
                data.allItems[type].splice(index,1);
            }
            
        },

        calculateBudget: function(){
            // calculate total income and expense
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate budget: income - expense
            data.budget = data.totals.inc - data.totals.exp;

            //calculate the percentage of income that is spent.

            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) *100);
            }
            else {
                data.percentage = -1;
            }
            
        },

        getBudget: function(){
            return {
                budget: data.budget,
                totalIncome: data.totals['inc'],
                totalExp: data.totals['exp'],
                percentage: data.percentage
            }
        },

        testing: function() {
            console.log(data);
        }
    };   
    
})();

//UI CONTROLLER
var UIController = (function(){
    // any private props and methods
    //public method, exposed to public is 'return object'
    let DOMStrings = {
        inputType:".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn",
        incomeContainer: ".income__list",
        expenseContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expenseLabel:".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container"
    }

    return {
        getInput: function(){
            return {
                type : document.querySelector(DOMStrings.inputType).value, // either 'inc' or 'exp'
                description : document.querySelector(DOMStrings.inputDescription).value,
                value : parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }   
        },       

        addListItem: function(obj, type){
            var html, newHtml, element;
            // create HTML string with some placeholder text
            if (type === 'inc'){
            element = DOMStrings.incomeContainer;
            html = `<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">+ %value%</div><div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`
            }
            else if (type === 'exp'){   
            element = DOMStrings.expenseContainer;         
            html = `<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">- %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`
            }


            // replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);
            
            // insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem(selectorID){
            document.getElementById(selectorID).parentNode.removeChild(document.getElementById(selectorID));

        },

        getDOM: function(){
            return  DOMStrings;     
        },

        clearFields: function(){
            let fields, fieldsArray; 
            fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);
            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function(curr, index, array) {
                // clear the fields - all elements
                curr.value = "";
            });

            fieldsArray[0].focus();

        },

        displayBudget: function(obj){
            document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalIncome;
            document.querySelector(DOMStrings.expenseLabel).textContent = obj.totalExp;
            

            if(obj.percentage>0){
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            }
            else
            {
                document.querySelector(DOMStrings.percentageLabel).textContent = '--';
            }
        }
    }
})();

// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl){   

    var setupEventHandler = function(){

        var DOMStr = UICtrl.getDOM();
        document.querySelector(DOMStr.inputBtn).addEventListener("click", ctrlHandler);
        document.addEventListener("keypress", function(e){
            if(e.keyCode===13 || e.which ===13){
            ctrlHandler();
         }
         });

         document.querySelector(DOMStr.container).addEventListener('click', ctrlDeleteItem);
    };

    var updateBudget = function(){        
        // 1. calculate the budget
        budgetCtrl.calculateBudget();

        // 2. return the budget
        let budget = budgetCtrl.getBudget();

        // 3. display budget 
        UICtrl.displayBudget(budget);
    }

    // setupEventHandler();
    var ctrlHandler = function(){
        console.log("handler is invoked!");
        var input,newItem;
        // steps to do:
        // get input data  
        input = UICtrl.getInput();
        console.log(input);
        if(input.description !=="" && !isNaN(input.value) && input.value > 0){

                // add item to budget controller
                newItem = budgetController.addItem(input.type, input.description, input.value);

                // add the above item to user interface also
                UICtrl.addListItem(newItem, input.type);

                // clear the input fields
                UICtrl.clearFields();

                // calc and update budget
                updateBudget();
        }        
    };

    var ctrlDeleteItem = function(event){
        var itemId, splitId, type, id;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemId){
            splitId = itemId.split('-');
            // console.log(splitId);
            type = splitId[0];
            id = splitId[1];

            // delete item from data structure
            budgetCtrl.deleteItem(type, parseInt(id));

            // delete item from user interface
            UICtrl.deleteListItem(itemId);

            // update and show the new budget
            updateBudget();

        }
    };

    return {
        init: function(){
            console.log("appl started");
            UICtrl.displayBudget(
                {
                    budget: 0,
                    totalIncome: 0,
                    totalExp: 0,
                    percentage: -1

                }
            )
            setupEventHandler();
        }
    }   
    
})(budgetController, UIController);

controller.init();

