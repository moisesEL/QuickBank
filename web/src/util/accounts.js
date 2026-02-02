import { Account } from "./model.js"; 

// Save customerId for server petitions
let customerId = sessionStorage.getItem('customer.id')

window.addEventListener("DOMContentLoaded", () => {
    try {
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
        .then(() => {
            const addAccount = document.createElement("button");
            addAccount.innerText = "add account";
            // Extracting tableBody from DOM
            const tableBody = document.querySelector("#tableBody");
            tableBody.appendChild(addAccount)
        })
    } catch (error) {
        console.log(error.message);
    }
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
        if (field === "id") {
            const cell = document.createElement("a");
            cell.setAttribute("href", `/QuickBank/src/views/movements.html?account=${account[field]}`)
            cell.setAttribute("data-role", field);
            cell.innerText = account[field];
            cellContainer.appendChild(cell);
            row.appendChild(cellContainer);
        }
        else {
            const cell = document.createElement("p");
            cell.setAttribute("role", "cell");
            cell.setAttribute("data-role", field);
            cell.innerText = account[field];
            if (field !== "id" && field !== "beginBalance" && field !== "beginBalanceTimestamp") {
                cell.addEventListener("dblclick", handleCellDoubleClick)
            }
            cellContainer.appendChild(cell);
            row.appendChild(cellContainer);
        }
    });
    yield row;
    }
}

function handleCellDoubleClick(event) {
    const cell = event.currentTarget;
    // Get the original cell value
    const originalValue = cell.innerText;

    // Get parent container
    const cellContainer = cell.parentNode;

    // Create input element
    const input = document.createElement('input');
    input.setAttribute("data-role", cell.getAttribute("data-role"))
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
    // Extract new value from input
    const newValue = input.value;
    // get cell parent
    const cellContainer = input.parentNode;
    // Get parent row
    const row = cellContainer.parentNode;

    // Create new account object to store data and send on fetch body
    const account = new Account ();

    // Iterate on each column of the row
    row.childNodes.forEach((div) => {
        // Get cell element from column container
        let cellElement = div.childNodes[0];
        // If the column container is the same than the one we are editing
        // then use the value from the input
        if (div.isSameNode(cellContainer))
            account[cellElement.getAttribute("data-role")] = newValue
        // If the column container is not the same than the one we
        // are editing, then simply extract the element's innerText
        else account[cellElement.getAttribute("data-role")] = cellElement.innerText
    })

    // TODO: Call to server
    // GET /CRUDBankServerSide/webresources/account/customer/:idCustomer
    // GET /CRUDBankServerSide/webresources/account/:accountId
    // PUT /CRUDBankServerSide/webresources/account
    // DELETE /CRUDBankServerSide/webresources/account
    fetch('/CRUDBankServerSide/webresources/account', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(account)
    })
    .then(response => {
        console.log(response.status)
        // Create new p element with the updated value
        const p = document.createElement('p');
        p.setAttribute("data-role", input.getAttribute("data-role"))
        p.textContent = newValue;
        
        // Replace input with p
        cellContainer.replaceChild(p, input);
        
        // Re-attach the double-click listener
        p.addEventListener('dblclick', handleCellDoubleClick);
    })
    .catch(error => {
        console.log(error.message)
        cancelEdit(input, originalValue);
    })

}

function cancelEdit(input, originalValue) {
    const cellContainer = input.parentNode;
    
    // Create new p element with the original value
    const p = document.createElement('p');
    p.setAttribute("data-role", input.getAttribute("data-role"))
    p.innerText = originalValue;
    
    // Replace input with p
    cellContainer.replaceChild(p, input);
    
    // Re-attach the double-click listener
    p.addEventListener('dblclick', handleCellDoubleClick);
}