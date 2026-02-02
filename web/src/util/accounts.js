import { Account } from "./model.js"; 

// Save customerId for server petitions
let customerId = sessionStorage.getItem('customer.id')

window.addEventListener("DOMContentLoaded", () => {

    // Server petition to bring all user's accounts
    fetch_accounts_by_user_id(customerId)
    .then(accounts => {
        // Extracting tableBody from DOM
        const tableBody = document.querySelector("#tableBody");
        // Generating each account row using a generator function
        const rowGenerator = account_row_generator(accounts);
        // Append each row to the tableBody
        for (const row of rowGenerator) {
            tableBody.appendChild(row);
        }
    })
    .catch(error => {
        console.log(error.message);
    })
})


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

/**
 * 
 * Generator function that yields account table rows
 * @param {Account[]} accounts
 */
function* account_row_generator(accounts) {
    for (const account of accounts) {
    const row = document.createElement("div");
    row.setAttribute("class", "row");
    row.setAttribute("role", "row");
    ["id", "type", "description", "balance", "creditLine", "beginBalance", "beginBalanceTimestamp"].forEach(field => {
        const cellContainer = document.createElement("div");
        cellContainer.setAttribute("role", "cell container");

        const cell = document.createElement("p");
        cell.setAttribute("role", "cell");
        cell.setAttribute("data-role", field);
        cell.innerText = account[field];
        if (field !== "id" && field !== "beginBalance" && field !== "beginBalanceTimestamp") {
            cell.addEventListener("dblclick", handleCellDoubleClick)
        }

        cellContainer.appendChild(cell);
        row.appendChild(cellContainer);
    });
    yield row;
    }
}

function handleCellDoubleClick(event) {
    const cell = event.currentTarget;
        // Get the current value
        const originalValue = cell.innerText;
        const cellContainer = cell.parentNode;
        const row = cellContainer.parentNode;

        console.log({originalValue})
        console.log({cellContainer})
        
        // Create input element
        const input = document.createElement('input');
        input.type = 'text';
        input.value = originalValue;
        input.className = 'edit-input';
        
        // Replace the <p> with the <input>
        cellContainer.replaceChild(input, cell);
        
        // Focus the input
        input.focus();
        input.select();
        
        // Add event listeners for saving on Enter or losing focus
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                saveCellChanges(input, originalValue);
            }
            if (event.key === 'Escape') {
                cancelEdit(input, originalValue);
            }
        });
        
        input.addEventListener('blur', () => {
            cancelEdit(input, originalValue);
        });
}

function saveCellChanges(input, originalValue) {
    const newValue = input.value;
    const cellContainer = input.parentNode;

    // TODO: Call to server
    fetch(`/CRUDBankServerSide/webresources/account/customer/${encodeURIComponent(customerId)}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        console.log(response.status)
    })
    .then(() => {
        // Create new p element with the updated value
        const p = document.createElement('p');
        p.textContent = newValue;
        
        // Replace input with p
        cellContainer.replaceChild(p, input);
        
        // Re-attach the double-click listener
        p.addEventListener('dblclick', handleCellDoubleClick);
    })
    .catch(error => {
        console.log(error.message)
        cancelEdit(input, originalValue)
        // Re-attach the double-click listener
        p.addEventListener('dblclick', handleCellDoubleClick);
    })

}

function cancelEdit(input, originalValue) {
    const cellContainer = input.parentNode;
    
    // Create new p element with the original value
    const p = document.createElement('p');
    p.textContent = originalValue;
    
    // Replace input with p
    cellContainer.replaceChild(p, input);
    
    // Re-attach the double-click listener
    p.addEventListener('dblclick', handleCellDoubleClick);
}