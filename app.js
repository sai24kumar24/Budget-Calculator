
//------------------------------------------------- Budget Controller ---------------------------------------

var budgetController = (function () {
    
    //Function constructors
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    //prototype method
    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };
    
    //prototype method
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };
    
    

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    //method to calculate total (incomes + Expenses)
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };    
    
    //************************************ DATA STRUCTURE (OBJECT) ****************************************
    //Data structure to store the data
    var data = {
        allItems: {
            //arrays to store the items
            exp: [],
            inc: []
        },
        totals: {
            //properties to store the total values
            exp: 0,
            inc: 0
        },
        
        budget: 0,
        percentage: -1
    };
    
    
    //************************************ PUBLIC METHODS *************************************************
    //public methods to let the other modules use these to pass the data to add an item
    return {
        
        addItem: function(type, des, val) { //type inc/exp
            
            var newItem, ID;
            // [1 2 3 4 5], next ID = 6
            //[1 2 4 6 8], next ID must be 9
            //create new ID based on array's last item value + 1 if array has elements but not empty
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1; //we now pass the ID here to create every new object/item
            } else {
                ID = 0;
            }
            
            //create new item based on type (Exp/Inc)
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            
            //push/add the item to the data structure
            data.allItems[type].push(newItem);
            
            //return the element to be used by public methods
            return newItem;
        },
        
        
        
        deleteItem: function (type, id) {
            var ids, index;
            
            //let's suppose id = 6
            //data.allItems[type][id];
            //[1 2 4 6 9]
            //[1 2 3 4 9]
            //index = 3
            
            //Map is used to loop an array which receives a callback that has access to currentobj,index, entire array
            //Map returns a new array
            ids = data.allItems[type].map(function (current) {
                return current.id;
            });
            
            index = ids.indexOf(id); 
            
            if (index !== -1) { // index will be -1 when it is non-existent
                
                data.allItems[type].splice(index, 1);       //splice(position, n);
            }   
            
        },
        
        
        
        calculateBudget: function() {
            
            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            //calculate the budget : Income - Expenses
            data.budget = data.totals.inc - data.totals.exp; //saving the inc-exp in global data structure = budget up
            
            //calculate the percentage of the income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round( (data.totals.exp / data.totals.inc) * 100);
                //EX: exp=50, inc=100 percentage = exp/inc = 50/100 = 0.5 * 100 = 50%
            } else {
                data.percentage = -1;
            }

        },
        
        
        
        calculatePercentages: function() {
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
                /*
            a=20 b=10 c=40
            income = 100
            a=20/100=20%.....c=40/100=40%
            */
            });
        },
        
        
        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },
        
        
        //method to store the 
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        
        //testing function for development purpose
        testing: function() {
            console.log(data);
        }
    };
    
    
})();


//----------------------------------------------------UI Controller-------------------------------------------------------------------

var UIController = (function() {
    
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
            var formatNumber = function(num, type) {
            var numSplit, int, dec, type;
            /* 
            + or - before number
            exactly 2 decimal points
            comma separating the thousands
            
            2310.4567 -> +2,310.46
            2000 -> +2,000
            */
            
            num = Math.abs(num);
            num = num.toFixed(2);
            
            numSplit = num.split('.');
            
            int = numSplit[0];
            if (int.length > 3) {
                int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 23510,
                //output 23,510
            }
            dec = numSplit[1];
            return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
        };
        
        var nodeListForEach = function(list, callback) {
                for (var i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
            };
    
   
    return {
        
        //property-1
        getInput: function() {
            return {
                type: document.querySelector(DOMStrings.inputType).value, //this will be either inc or dec
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };            
        },
        
        
        //another pubic method to add the listItems to the UI
        addListItem: function(obj, type) {
            var html, newHtml, element;
            //create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            //Replace the placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            //Insert the HTML into the DOM - We do this by selecting a document element and adding.
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        
        
        
        //pubic method to delete the listItems to the UI //we need a class name and ID name to delete
        deleteListItem: function(selectorID) {
            
            //we cannot directly delete an element but a child can be deleted
            var el = document.getElementById(selectorID); //we get the parent of income-0 by this line
            el.parentNode.removeChild(el);
        },
        
        
        
        
        //clearing fields method
        clearFields: function() {
            
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue); //fileds is a list not an array
            
            //converting list into array
            fieldsArr = Array.prototype.slice.call(fields); //call has first parameter of this & Array is the main prototype of all arrays & slice method returns an array as a new object *
            
            //we can pass a callback function to forEach loop which accepts 3 parameters which are currentvalue, index of element and entire array
            fieldsArr.forEach(function(current, index, array) { 
                current.value = ""; //setting all the iterated values - empty.
            });
            
            //setting the focus back to description field to enter more items.
            fieldsArr[0].focus();
        },
        
        
        displayBudget: function(obj) {
            var type;
            //Available budget default kept as -
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if(obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },
        
        
        
        displayPercentages: function(percentages) {
            
            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);            
            
            //calling the above function
            nodeListForEach(fields, function(current, index) {
                
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
            
        },
        
        displayMonth: function() {
            var now, months, month, year;
            
            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        
        
        changedType: function() {
                
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' + 
                DOMStrings.inputDescription + ',' + 
                DOMStrings.inputValue);
            
            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus'); //focus outline for 3 fields
            });
            
            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        },
        
        
        //property-2
        getDOMStrings: function() {
        return DOMStrings;
    }
    
    };
    
})();


//Global App Controller - This decides where to delegate the tasks

var controller = (function(budgetCtrl, UICtrl) {
    
    var setupEventListeners = function() {
        
           var DOM = UICtrl.getDOMStrings();
          
           document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

            document.addEventListener('keypress', function(event) {
                if(event.keyCode === 13 || event.which === 13) {
                    ctrlAddItem();
                }      
            });
            
        //here is the event listener to the DOM element css = (container) which have all the income and expenses.
            document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
            document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };
    
    
    
    var updateBudget = function() {
               
       //1.Calculate the Budget
        budgetCtrl.calculateBudget();
        
       //2.Return the Budget
        var budget = budgetCtrl.getBudget();
       
       //3. Display the budget on the UI
        UICtrl.displayBudget(budget);
        
    };
    
    
    var updatePercentages = function() {
        
        //1. Calculate the percentages
        budgetCtrl.calculatePercentages();
        
        //2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        
        //3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
        //console.log(percentages);
    };
    
    
    
    var ctrlAddItem = function() {
        
        var input, newItem;
        
       //1. Get the input data 
        input = UICtrl.getInput();
        
        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
            
            //2. Add the item to Budget Controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value); 
            //we pass this ro listaddItem to the UI to be displayed; ----> down next

           //3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            //4. Clear Input fields after adding
            UICtrl.clearFields();

            //5. Calculate and update Budget
            updateBudget();         
            
            //6. Calculate and update percentages
            updatePercentages();
            
        }
    };
    
    
    
    //event parameter below is something that every event listener method's callback function has access to the event object
    //it can be pass directly to the callback function as above (enter/button press) or like below
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        
        //getting the target element (where the event is clicked) == below returns like income-1
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id; //DOM Traversing (Hard-coded) to traverse up to parent
        //console.log(itemID); //to test the parent
        //we use parentNode 4 times as the child element is INSIDE that as 4th child (see from the bottom in html code -)
        
        if(itemID) {
            //inc-1 - of type - wiil be the parent on clicking the buton which has ID
            splitID = itemID.split('-'); //spliting based on - to get type and ID from the above to delete from data model and UI
            type = splitID[0];
            ID = parseInt(splitID[1]); // split returns a string, so we have to convert it to a number "1" -- 1
            
            //1. delete the item from the data-structure
            budgetCtrl.deleteItem(type, ID);
            
            //2. delete the item from the UI
            UICtrl.deleteListItem(itemID);
            
            //3. update and show the new budget
            updateBudget();
            
            //4. Calculate and update percentages
            updatePercentages();
        }
    };
    
    
    return {
        init: function() {
            console.log('Application has started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };
    
})(budgetController, UIController);


//initialization function
controller.init();
