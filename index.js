const { describe } = require('node:test');
const { arrayBuffer } = require('stream/consumers');

class BankAccount {
    constructor(accountNumber, owner){
        this.accountNumber = accountNumber;
        this.owner = owner;
        this.transactions = []
    }

    balance(){
        let sum = 0;
        for (let i = 0; i < this.transactions.length; i++){
            sum += this.transactions[i].amount;
        }
        return sum;
    }

    charge(payee, amt){
        let currentBalance = this.balance();
        if (amt <= currentBalance){
            let chargeTransaction =  new Transaction(-amt, payee);
            this.transactions.push(chargeTransaction);
        }
    }

    deposit(amt){
        if(amt > 0 ){
            let depositTransaction = new Transaction(amt, 'Deposit'); // could do this.owner instead of deposit
            this.transactions.push(depositTransaction);
        }
    }
}

class Transaction {
    constructor(amount, payee){
        this.amount = amount;
        this.payee = payee;
        this.date = new Date();
    }
}

class SavingsAccount extends BankAccount{
    constructor(accountNumber, owner, interestRate){
        super(accountNumber, owner);
        this.interestRate = interestRate;
    }
    accrueInterest(){
        let currentBalance = this.balance();
        let interestAmt = currentBalance * this.interestRate;
        let interestTransaction = new Transaction(interestAmt, "Interest");
        this.transactions.push(interestTransaction);
    }
}


//tests 
if (typeof describe === 'function') {
    const assert = require('assert');

  describe("#testing account creation", function(){
    it('should create a new account correctly', function(){
        let acct1 = new BankAccount('xx4432', "James Doe");
        assert.equal(acct1.owner, 'James Doe');
        assert.equal(acct1.accountNumber, 'xx4432');
        assert.equal(acct1.transactions.length, 0);
        assert.equal(acct1.balance(), 0);
    });
  });

  describe("#testing account balance", function(){
    it('should create a new account correctly', function(){
        let acct1 = new BankAccount('xx4432', "James Doe");
        assert.equal(acct1.balance(), 0); // checking account balance should be 0
        acct1.deposit(100); //deposit of 100
        assert.equal(acct1.balance(), 100); //checking test if deposited 100
        acct1.charge( "Target", 10); // charge of 10
        assert.equal(acct1.balance(), 90); //checking if subtracted 10
    });
    it('should not allow negative deposit', function(){
        let acct1 = new BankAccount('xx4432', "James Doe");
        assert.equal(acct1.balance(), 0); // checking account balance should be 0
        acct1.deposit(100); //deposit of 100
        assert.equal(acct1.balance(), 100); //checking test if deposited 100
        acct1.deposit(-30);
        assert.equal(acct1.balance(), 100);
     });
    it('should not allow charging to overdraft', function(){
        let acct1 = new BankAccount('xx4432', "James Doe");
        assert.equal(acct1.balance(), 0); // checking account balance should be 0
        acct1.charge("target", 30);
        assert.equal(acct1.balance(), 0);
    });
    it('should allow a refund', function(){
        let acct1 = new BankAccount('xx4432', "James Doe");
        assert.equal(acct1.balance(), 0); // checking account balance should be 0
        acct1.charge("target", -30);
        assert.equal(acct1.balance(), 30);
    });
  });
  describe("#Testing transaction creation", function(){
    it('Should create a transaction correctly for deposit', function(){
        let t1 = new Transaction(30, "Deposit");
        assert.equal(t1.amount, 30);
        assert.equal(t1.payee, "Deposit");
        assert.notEqual(t1.date, undefined);
        assert.notEqual(t1.date, null);
    });
    it('Should create a transaction correctly for a charge', function(){
        let t1 = new Transaction(-34.45, "Target");
        assert.equal(t1.amount, -34.45);
        assert.equal(t1.payee, "Target");
        assert.notEqual(t1.date, undefined);
        assert.notEqual(t1.date, null);
    });
  });

  describe("Bunch of transactions and tests", function(){
    let bigAccount = new BankAccount("11223344", "Maggie Smith");
    it("test account created correctly", function(){
        assert.equal("11223344", bigAccount.accountNumber);
        assert.equal("Maggie Smith", bigAccount.owner);
        assert.equal(bigAccount.balance(), 0);
    });
    it("test deposits", function(){
        bigAccount.deposit(30); //30
        assert.equal('Deposit', bigAccount.transactions[0].payee);
        assert.equal(30, bigAccount.transactions[0].amount);
        bigAccount.deposit(20); //50
        bigAccount.deposit(-3); //50
        bigAccount.deposit(34.25); //84.25
        bigAccount.deposit(10000.45); //100084.70
        assert.equal(100084.70, bigAccount.balance());
        bigAccount.charge("Clearout", 100084.70);
        assert.equal(0, bigAccount.balance());
    });
    it("test charges", function(){
        bigAccount.deposit(1000); //1000
        bigAccount.charge("target", 40); //9960
        bigAccount.charge("freebirds", 10.32); //9949.68
        bigAccount.charge("texaco", 40); //9909.68
        bigAccount.charge("bob's", -20); //9929.68
        assert.equal(9929.68, bigAccount.balance());
        assert.equal(10, bigAccount.transactions.length);
    });
    it("test overdraft", function(){
        bigAccount.charge("target", 400000); 
        assert.equal(10, bigAccount.transactions.length);
        assert.equal(9929.68, bigAccount.balance());
    });
    it("test a zero deposit", function(){
        bigAccount.deposit(0);
        assert.equal(10, bigAccount.transactions.length);
        assert.equal(9929.68, bigAccount.balance());
    });
  });

  describe("Savings Account creation", function(){
    it("Create account correctly", function(){
        let saving = new SavingsAccount("xxx1234", "Maddie Mortis", .10);
        assert.equal("xxx1234", saving.accountNumber);
        assert.equal("Maddie Mortis", saving.owner);
        assert.equal(.10, saving.interestRate);
        assert.equal(0, saving.balance());
    })
    it("Accrue interest correctly with charges", function(){
        let saving = new SavingsAccount("xxx1234", "Maddie Mortis", .10);
        assert.equal("xxx1234", saving.accountNumber);
        assert.equal("Maddie Mortis", saving.owner);
        assert.equal(.10, saving.interestRate);
        assert.equal(0, saving.balance());
        saving.deposit(100);
        saving.accrueInterest();
        assert.equal(110, saving.balance());
    })
    it("Accrue interest for negative interest", function(){
        let saving = new SavingsAccount("xxx1234", "Maddie Mortis", -.10);
        saving.deposit(100);
        saving.charge("ATM", 30);
        saving.accrueInterest();
        assert.equal(63, saving.balance());
        saving.charge("target", 62);
        assert.equal(1, saving.balance());
        saving.accrueInterest();
        assert.equal(.90, saving.balance());
    })
  })
}