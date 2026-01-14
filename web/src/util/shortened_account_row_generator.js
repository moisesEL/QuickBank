import { Account } from "./model.js"; 
/**
 * Generator function that yields account table rows
 * @param {Account[]} accounts
 */
function* shortened_account_row_generator(accounts) {
    for (const account of accounts) {
    const tr = document.createElement("tr");
    ["type", "description", "balance"].forEach(field => {
        const td = document.createElement("td");
        const input = document.createElement("input");
        td.appendChild
        td.textContent = account[field];
        tr.appendChild(td);
    });
    yield tr;
    }
}

export default shortened_account_row_generator;