import { Account } from "./model.js";
/**
 * @param { string } customerId the user's Id
 * @returns { Account[] } Returns all user's accounts as an Account array.
 */
async function fetch_accounts_by_user_id(customerId) {
    const response = await fetch(`/CRUDBankServerSide/webresources/account/customer/${encodeURIComponent(customerId)}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    });
    const data = await response.json();
    const accounts = data.map(account => new Account(account.id, account.type, account.description, account.balance, account.creditLine, account.beginBalance, account.beginBalanceTimestamp));
    return accounts;
}

export default fetch_accounts_by_user_id;