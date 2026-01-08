import { Account } from "./model.js";

/**
 * 
 * @param { number } userId 
 * @returns { Account[] }
 */
async function fetch_accounts_by_user_id(userId) {
    const response = await fetch(`/CRUDBankServerSide/webresources/account/customer/${encodeURIComponent(userId)}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    });
    const data = await response.json();
    const accounts = data.map(account => new Account(account.id, account.type, account.description, account.balance, account.creditLine, account.beginBalance, account.beginBalanceTimestamp));
    console.log("accounts: ", accounts);
    console.log("type of accounts: ", typeof(accounts));
    return accounts;
}

export default fetch_accounts_by_user_id;