import fetch_accounts_by_user_id from "./fetch_accounts_by_user_id.js";
import { Account } from "./model.js"; 

class Customer {
    constructor(id, email, firstName, middleInitial, lastName, password, street, city, state, zip, phone) {
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.middleInitial = middleInitial;
        this.lastName = lastName;
        this.password = password;
        this.street = street;
        this.city = city;
        this.state = state;
        this.zip = zip;
        this.phone = phone;
    }
}

window.addEventListener("DOMContentLoaded", () => {
    let customer = new Customer (
        sessionStorage.getItem('customer.id'),
        sessionStorage.getItem('customer.email'),
        sessionStorage.getItem('customer.firstName'),
        sessionStorage.getItem('customer.middleInitial'),
        sessionStorage.getItem('customer.lastName'),
        sessionStorage.getItem('customer.password'),
        sessionStorage.getItem('customer.street'),
        sessionStorage.getItem('customer.city'),
        sessionStorage.getItem('customer.state'),
        sessionStorage.getItem('customer.zip'),
        sessionStorage.getItem('customer.phone'),
    )
    build_accounts_table(customer.id);
})

/**
 * 
 * @param { number } userId
 * @returns { void }
 */
async function build_accounts_table(userId) {
    const accounts = await fetch_accounts_by_user_id(userId);
    const tableBody = document.querySelector("#tableBody");
    const rowGenerator = account_row_generator(accounts);
    for (const row of rowGenerator) {
        tableBody.appendChild(row);
    }
}

/**
 * 
 * Generator function that yields account table rows
 * @param {Account[]} accounts
 */
function* account_row_generator(accounts) {
    for (const account of accounts) {
    const row = document.createElement("div");
    row.setAttribute("role", "row");
    row.setAttribute("class", "row");
    ["id", "type", "description", "balance", "creditLine", "beginBalance", "beginBalanceTimestamp"].forEach(field => {
        const cell = document.createElement("p");
        cell.innerText = account[field];
        row.appendChild(cell);
    });
    yield row;
    }
}