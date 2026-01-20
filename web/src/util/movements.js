import { Movements } from "./model.js";

async function movements_by_account_id() {
    const accountId = "2654785441";
    const response = await fetch(`/CRUDBankServerSide/webresources/movement/account/${encodeURIComponent(accountId)}`, {
        method: 'GET',
        headers: { 
            'Accept': 'application/json'
        }
    });
    const data = await response.json();
    const movements = data.map(movement => new Movements(movement.id, movement.balance, movement.amount, movement.description, movement.timestamp));
    return movements;

}




export default movements_by_account_id;