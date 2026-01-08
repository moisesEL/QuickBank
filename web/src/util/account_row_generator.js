import { Account } from "./model.js"; 
/**
 * 
 * Generator function that yields account table rows
 * @param {Account[]} accounts
 */
function* account_row_generator(accounts) {
    for (const account of accounts) {
    const tr = document.createElement("tr");
    ["id", "type", "description", "balance", "creditLine", "beginBalance", "beginBalanceTimestamp"].forEach(field => {
        const td = document.createElement("td");
        td.textContent = account[field];
        tr.appendChild(td);
    });
    yield tr;
    }
}

export default account_row_generator;