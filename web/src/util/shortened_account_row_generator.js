import { Account } from "./model.js"; 
/**
 * Generator function that yields account table rows as a shortened version 
 * @param {Account[]} accounts
 */
function* shortened_account_row_generator(accounts) {
    for (const account of accounts) {
    const tr = document.createElement("tr");
    ["type", "description", "balance"].forEach(field => {
        const td = document.createElement("td");
        const input = document.createElement("input");
        input.disabled = true;
        input.value = account[field];
        td.appendChild(input)
        tr.appendChild(td);
    });
    const td = document.createElement("td");
    const input = document.createElement("input");
    input.disabled = true;
    input.style.display = "none";
    input.value = account['id'];
    td.appendChild(input)
    tr.appendChild(td);
    td.appendChild
    yield tr;
    }
}

export default shortened_account_row_generator;