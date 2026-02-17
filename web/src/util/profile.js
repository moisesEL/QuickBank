import fetch_accounts_by_user_id from "./fetch_accounts_by_user_id.js";
import { Customer } from "./model.js";
import sumAccountsBalances from "./sumAccountsBalances.js";

window.addEventListener("DOMContentLoaded", () => {
    let customer = new Customer (
        sessionStorage.getItem('customer.id'),
        sessionStorage.getItem('customer.firstName'),
        sessionStorage.getItem('customer.lastName'),
        sessionStorage.getItem('customer.middleInitial'),
        sessionStorage.getItem('customer.street'),
        sessionStorage.getItem('customer.city'),
        sessionStorage.getItem('customer.state'),
        sessionStorage.getItem('customer.zip'),
        sessionStorage.getItem('customer.phone'),
        sessionStorage.getItem('customer.email'),
        sessionStorage.getItem('customer.password'),
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
    try {
        build_shortened_accounts_table(customer.id)
        .then(() => {
            const rightDiv = document.getElementById("rightDiv")
            sumAccountsBalances(rightDiv, 'after');
        })
        .then(() => {
            // Create mini titles in case width less than 1100px
            if (window.innerWidth < 1100) {
                const tableBody = document.querySelectorAll("#tableBody .row");
                Array.from(tableBody).forEach(row => {
                    Array.from(row.childNodes).forEach(cellContainer => {
                        if (!cellContainer.querySelector(".title")) {
                            const dataTitle = cellContainer.getAttribute("data-title");
                            if (dataTitle) {
                                const title = document.createElement("p");
                                title.setAttribute("class", "title");
                                title.innerText = dataTitle;
                                cellContainer.insertBefore(title, cellContainer.firstElementChild);
                            }
                        }
                    })
                })
            }
        })
    } catch (error) {
        console.log(error);
    }
})

window.addEventListener("resize", () => {
    if (window.innerWidth >= 1100) {
        const titles = document.querySelectorAll(".title");
        if (titles.length) Array.from(titles).forEach(element => element.remove());
    }
    // Create mini titles in case width less than 1100px
    else {
        const tableBody = document.querySelectorAll("#tableBody .row");
        Array.from(tableBody).forEach(row => {
            Array.from(row.childNodes).forEach(cellContainer => {
                if (!cellContainer.querySelector(".title")) {
                    const dataTitle = cellContainer.getAttribute("data-title");
                    if (dataTitle) {
                        const title = document.createElement("p");
                        title.setAttribute("class", "title");
                        title.innerText = dataTitle;
                        cellContainer.insertBefore(title, cellContainer.firstElementChild);
                    }
                }
            })
        })
    }
})

/**
 * 
 * @param {number} userId
 * @returns {void}
 */
async function build_shortened_accounts_table(userId) {
    const accounts = await fetch_accounts_by_user_id(userId);
    const tbody = document.querySelector("#tableBody");
    if (accounts.length > 0) {
        const rowGenerator = shortened_account_row_generator(accounts);
        for (const row of rowGenerator) {
            tbody.appendChild(row);
        }
    }
    else {
        const emptyRow = document.createElement("div");
        emptyRow.setAttribute("class", "row");
        emptyRow.setAttribute("role", "row");
        ["type", "description", "balance", "creditLine"].forEach(field => {
            // Create the cell container and give it the correct role of cell
            const cellContainer = document.createElement("div");
            cellContainer.setAttribute("role", "cell");
            switch (field) {
                case "type":
                    cellContainer.setAttribute("data-title", "Type");
                    break;
                case "description":
                    cellContainer.setAttribute("data-title", "Description");
                    break;
                case "balance":
                    cellContainer.setAttribute("data-title", "Balance");
                    break;
                case "creditLine":
                    cellContainer.setAttribute("data-title", "Credit line");
                    break;
                default:
                    break;
            }
            const cell = document.createElement("p");
            cell.setAttribute("data-role", field);
            // Appending every element to the DOM
            cellContainer.appendChild(cell);
            emptyRow.appendChild(cellContainer);
        })
        tbody.appendChild(emptyRow);
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
        switch (field) {
            case "type":
                cellContainer.setAttribute("data-title", "Type");
                break;
            case "description":
                cellContainer.setAttribute("data-title", "Description");
                break;
            case "balance":
                cellContainer.setAttribute("data-title", "Balance");
                break;
            case "creditLine":
                cellContainer.setAttribute("data-title", "Credit line");
                break;
            default:
                break;
        }
        const cell = document.createElement("p");
        cell.setAttribute("data-role", field);
        cell.setAttribute("class", field);
        if (field === 'balance' || field === 'creditLine') {
            cell.innerText = account[field].toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
        }
        else {
            cell.innerText = account[field];
        }
        // Appending every element to the DOM
        cellContainer.appendChild(cell);
        row.appendChild(cellContainer);
        })
    yield row;
    }
}