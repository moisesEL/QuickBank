import fetch_accounts_by_user_id from "./fetch_accounts_by_user_id.js";
import { Customer } from "./model.js";

window.addEventListener("DOMContentLoaded", () => {
    let customer = new Customer (
        sessionStorage.getItem('customer.email'),
        sessionStorage.getItem('customer.firstName'),
        sessionStorage.getItem('customer.middleInitial'),
        sessionStorage.getItem('customer.lastName'),
        sessionStorage.getItem('customer.password'),
        sessionStorage.getItem('customer.street'),
        sessionStorage.getItem('customer.city'),
        sessionStorage.getItem('custableBodytomer.state'),
        sessionStorage.getItem('customer.zip'),
        sessionStorage.getItem('customer.phone'),
        sessionStorage.getItem('customer.id')
    )
    document.getElementById("firstName").value = customer.firstName;
    document.getElementById("middleInitial").value = customer.middleInitial;
    document.getElementById("lastName").value = customer.lastName;
    document.getElementById("password").value = customer.password;
    document.getElementById("email").value = customer.email;
    document.getElementById("phone").value = customer.phone;
    document.getElementById("zip").value = customer.zip;
    document.getElementById("city").value = customer.city;

    // Shortened table population
    build_shortened_accounts_table(customer.id)
    .then(() => {
        // Get all balance cells
        const arrBalances = document.querySelectorAll("[data-role='balance']");
        // Sum each account's balance
        const sum = Array.from(arrBalances).reduce((acc, element) => acc + parseInt(element.innerText), 0);
        // Create p element to attach to DOM
        const total = document.createElement("p");
        total.setAttribute("id", "total")
        total.innerHTML = `Your total account's balance is <strong>${sum}</strong>`;
        const rightDiv = document.getElementById("rightDiv");
        rightDiv.appendChild(total);
    })

})


/**
 * 
 * @param {number} userId
 * @returns {void}
 */
async function build_shortened_accounts_table(userId) {
    const accounts = await fetch_accounts_by_user_id(userId);
    const tbody = document.querySelector("#tableBody");
    const rowGenerator = shortened_account_row_generator(accounts);
    for (const row of rowGenerator) {
        tbody.appendChild(row);
    }
}

/**
 * Generator function that yields shortened account table rows
 * @param {Account[]} accounts
 */
function* shortened_account_row_generator(accounts) {
    for (const account of accounts) {
    const row = document.createElement("div");
    row.setAttribute("class", "row");
    row.setAttribute("role", "row");
    ["type", "description", "balance", "creditLine"].forEach(field => {
        // Create the cell container and give it the correct role of cell
        const cellContainer = document.createElement("div");
        cellContainer.setAttribute("role", "cell");
        const cell = document.createElement("p");
        cell.setAttribute("data-role", field);
        cell.innerText = account[field];

        // Appending every element to the DOM
        cellContainer.appendChild(cell);
        row.appendChild(cellContainer);
        })
    yield row;
    }
}

function* account_row_generator(accounts) {
    for (const account of accounts) {
    const row = document.createElement("div");
    row.setAttribute("class", "row");
    row.setAttribute("role", "row");
    ["id", "type", "description", "balance", "creditLine", "beginBalance", "beginBalanceTimestamp", "actions"].forEach(field => {
        // Create the cell container and giving it the correct role of cell
        const cellContainer = document.createElement("div");
        cellContainer.setAttribute("role", "cell");
            const cell = document.createElement("p");
            cell.setAttribute("data-role", field);
            if (field === "beginBalanceTimestamp") {
                const date = new Date(account[field]);
                cell.innerText = `${formatAMPM(date)} - ${date.toLocaleDateString('en-US',
                { month: '2-digit', day: '2-digit', year: 'numeric' })}`;
            }
            else
                cell.innerText = account[field];
            if (field === "description")
                cell.addEventListener("dblclick", (event) => {handleCellEdition(event, account)})
            else if (field === "creditLine" && account.type === "CREDIT")
                cell.addEventListener("dblclick", (event) => {handleCellEdition(event, account)})
            cellContainer.appendChild(cell);
            row.appendChild(cellContainer);
        })
    yield row;
    }
}