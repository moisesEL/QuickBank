import fetch_accounts_by_user_id from "./fetch_accounts_by_user_id.js";
import account_row_generator from "./account_row_generator.js";

/**
 * 
 * @param {number} userId 
 * @returns {void}
 */
async function build_accounts_table(userId) {
    const accounts = await fetch_accounts_by_user_id(userId);
    const tbody = document.querySelector("#accountsTable tbody");
    const rowGenerator = account_row_generator(accounts);
    for (const row of rowGenerator) {
        tbody.appendChild(row);
    }
}

export default build_accounts_table;