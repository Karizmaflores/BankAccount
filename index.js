class BankAccount {
    constructor(accountNumber, owner){
        this.accountNumber = accountNumber;
        this.owner = owner;
        this.transactions = []
    }
}


//tests 
if (typeof describe === 'function') {

    const assert = require('assert');

    /*
    describe('#towersOfHanoi()', () => {
    it('should be able to move a block', () => {
      towersOfHanoi('a', 'b');
      assert.deepEqual(stacks, { a: [4, 3, 2], b: [1], c: [] });
    });
  });
    */ 
  describe("#testing account creation", function(){
    it('should create a new account correctly', function(){
        let acct1 = new BankAccount('xx4432', "James Doe");
        assert.equal(acct1.owner, 'James Doe');
        assert.equal(acct1.accountNumber, 'xx4432');
        assert.equal(acct1.transactions.length, 0);
    });
  });

}