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

class Movements {
    constructor(id, balance, amount, description, timestamp) {
        this.id = id;
        this.balance = balance;
        this.amount = amount;
        this.description = description;
        this.timestamp = timestamp;
        

    }

    toJSON(){
        return {
            id: this.id,
            balance: this.balance,
            amount: this.amount,
            description: this.description,
            timestamp: this.timestamp
        };
    }

}

class Customer {
    constructor (id, firstName, lastName, middleInitial, street, city, state, zip, phone, email, password){
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.middleInitial = middleInitial;
    this.street = street;
    this.city = city;
    this.state = state;
    this.zip = zip;
    this.phone = phone;
    this.email = email;
    this.password = password;
    }
    
    toJSON(){
        return {
            id: this.id,
            firstName: this.firstName,
            lastName: this.lastName,
            middleInitial: this.middleInitial,
            street: this.street,
            city: this.city,
            state: this.state,
            zip: this.zip,
            phone: this.phone,
            email: this.email,
            password: this.password
        };
    }
}

export {
    Account,
    Movements,
    Customer
};
