class movement {
    constructor(id, balance, amount, description, timestamp) {
        this.id = id;
        this.balance = balance;
        this.amount = amount;
        this.description = description;
        this.timestamp = timestamp;
        

    }


}
class Account {
    constructor(id, type, description, balance, creditLine, beginBalance, beginBalanceTimestamp) {
        this.id = id;
        this.type = type;
        this.description = description;
        this.balance = balance;
        this.creditLine = creditLine;
        this.beginBalance = beginBalance;
        this.beginBalanceTimestamp = beginBalanceTimestamp;
    }

    toJSON() {
        return {
            id: this.id,
            type: this.type,
            description: this.description,
            balance: this.balance,
            creditLine: this.creditLine,
            beginBalance: this.beginBalance,
            beginBalanceTimestamp: this.beginBalanceTimestamp
        }
    }
}

export {
    Account
};
