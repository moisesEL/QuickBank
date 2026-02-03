import { Account } from "./model.js";
import fetch_accounts_by_user_id from "./fetch_accounts_by_user_id.js";

// GET /CRUDBankServerSide/webresources/account/customer/:idCustomer
// GET /CRUDBankServerSide/webresources/account/:accountId
// PUT /CRUDBankServerSide/webresources/account
// DELETE /CRUDBankServerSide/webresources/account/:accountId

// Save customer id for server petitions
let customerId = sessionStorage.getItem('customer.id');

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
            
        })
    } catch (error) {
        console.log(error.message);
    }
})

/**
 * 
 * Generator function that yields account table rows
 * @param { Account[] } accounts
 */
function* account_row_generator(accounts) {
    for (const account of accounts) {
    const row = document.createElement("div");
    row.setAttribute("class", "row");
    row.setAttribute("role", "row");
    ["id", "type", "description", "balance", "creditLine", "beginBalance", "beginBalanceTimestamp", "actions"].forEach(field => {
        // Create the cell container and give it the correct role of cell
        const cellContainer = document.createElement("div");
        cellContainer.setAttribute("role", "cell");
        if (field === "actions") {
            cellContainer.setAttribute("class", "actionsContainer");

            // Edit button
            const editButton = document.createElement("button");
            editButton.setAttribute("class", "editButtons");
            editButton.setAttribute("data-role", "edit");
            const editIcon = document.createElement("i");
            editIcon.setAttribute("class", "material-icons");
            editIcon.innerText = "edit";
            editButton.appendChild(editIcon)
            cellContainer.appendChild(editButton);
            editButton.addEventListener("click", (event) => {handleEditButton(event, account)});
            editButton.addEventListener("keydown", (event) => {if (event.key === "Enter") handleEditButton(event, account)});

            // Delete button
            const deleteButton = document.createElement("button");
            deleteButton.setAttribute("class", "deleteButtons");
            deleteButton.setAttribute("data-role", "delete");
            const deleteIcon = document.createElement("i");
            deleteIcon.setAttribute("class", "material-icons");
            deleteIcon.innerText = "delete";
            deleteButton.appendChild(deleteIcon)
            cellContainer.appendChild(deleteButton);
            deleteButton.addEventListener("click", (event) => {handleDeleteButton(event, account)});
            deleteButton.addEventListener("keydown", (event) => {if (event.key === "Enter") handleDeleteButton(event, account)});

            row.appendChild(cellContainer);
        }
        else if (field === "id") {
            const cell = document.createElement("a");
            cell.setAttribute("href", `/QuickBank/src/views/movements.html?account=${account[field]}`)
            cell.setAttribute("data-role", field);
            cell.setAttribute("title", `Movements of account: ${account[field]}`);
            cell.innerText = account[field];
            cellContainer.appendChild(cell);
            row.appendChild(cellContainer);
        }
        else {
            const cell = document.createElement("p");
            cell.setAttribute("data-role", field);
            if (field === "beginBalanceTimestamp") {
                const date = new Date(account[field]);
                cell.innerText = `${formatAMPM(date)} - ${date.toLocaleDateString('en-US',
                { month: '2-digit', day: '2-digit', year: 'numeric' })}`;
            }
            else
                cell.innerText = account[field];
            if (field === "description")
                cell.addEventListener("dblclick", (event) => {handleCellEdition(event, account)})
            else if (field === "creditLine" && account.type === "CREDIT")
                cell.addEventListener("dblclick", (event) => {handleCellEdition(event, account)})
            cellContainer.appendChild(cell);
            row.appendChild(cellContainer);
        }
    });
    yield row;
    }
}

/**
 * 
 * @param { Event } event 
 * @param { Account } account
 */
function handleCellEdition(event, account) {
    const cell = event.currentTarget;
    // Get the original cell value
    const originalValue = cell.innerText;

    // Get parent container
    const cellContainer = cell.parentNode;

    // Get data-role from cell
    const dataRole = cell.getAttribute("data-role");

    // Create input element
    const input = document.createElement('input');
    input.setAttribute("data-role", dataRole)
    if (dataRole === 'description') {
        input.type = 'text';
    }
    else {
        input.type = 'number';
    }
    input.value = originalValue;
    input.className = 'edit-input';
    
    // Replace the <p> with the <input>
    cellContainer.replaceChild(input, cell);
    
    // Focus the input
    input.focus();
    input.select();
    
    input.addEventListener('keydown', (event) => {
        // Add event listener for saving on Enter
        if (event.key === 'Enter') {
            saveCellChanges(input, originalValue, account);
        }
        // Add event listener for canceling on escape
        if (event.key === 'Escape') {
            cancelEdit(input, originalValue);
        }
    });
    // Add event listener for canceling on blur
    input.addEventListener('blur', () => {
        cancelEdit(input, originalValue);
    });
}

/**
 * 
 * @param { HTMLInputElement } input 
 * @param { string } originalValue 
 * @param { Account } account
 */
function saveCellChanges(input, originalValue, account) {
    // Extract new value from input
    const newValue = input.value;
    // Get cell parent
    const cellContainer = input.parentNode;

    // Overwrite old value with new value from input
    account[input.getAttribute("data-role")] = newValue;

    // Petition to update an account on the server
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
        p.addEventListener('dblclick', (event) => {handleCellEdition(event, account)});
    })
    .catch(error => {
        console.log(error.message)
        cancelEdit(input, originalValue);
    })

}

/**
 * 
 * @param { HTMLInputElement } input 
 * @param { string } originalValue 
 * @param { Account } account
 */
function cancelEdit(input, originalValue, account) {
    const cellContainer = input.parentNode;
    
    // Create new p element with the original value
    const p = document.createElement('p');
    p.setAttribute("data-role", input.getAttribute("data-role"));
    p.innerText = originalValue;
    
    // Replace input with p
    cellContainer.replaceChild(p, input);
    
    // Re-attach the double-click listener
    p.addEventListener('dblclick', (event) => {handleCellEdition(event, account)});
}

/**
 * 
 * @param { Date } date
 */
function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}

/**
 * This function handles the activation of the edit button
 * @param { Event } event HTML Event
 * @param { Account } account
 */
function handleEditButton(event, account) {
    const editButton = event.currentTarget;
    const row = editButton.closest(".row");

    console.log(row);
}

/**
 * This function handles the activation of the delete button
 * @param { Event } event
 * @param { Account } account
 */
function handleDeleteButton(event, account) {
    const deleteButton = event.currentTarget;
    if (confirm(`Are you sure you want to delete your account: ${account.description}(${account.id})`)) {
        fetch(`/CRUDBankServerSide/webresources/movement/account/${account.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) return response.json()
            else throw new Error(response.status)
        })
        .then(data => {
            // Extract all the movements Ids into a simple array
            let movementsIds = data.map(movement => movement.id);
            
            // If no movements, delete the account
            if (movementsIds.length === 0) return Promise.resolve([]);
            
            // Create DELETE promises for each movement
            const deletePromises = movementsIds.map(movementId => 
                fetch(`/CRUDBankServerSide/webresources/movement/${movementId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(response => {
                    if (response.ok) {
                        return { movementId, success: true };
                    } else {
                        return { movementId, success: false, status: response.status };
                    }
                }).catch(error => {
                    return { movementId, success: false, error: error.message };
                })
            );
            return Promise.all(deletePromises);
        })
        .then(deleteResults => {
            // Check if all deletions were successful
            const failedDeletions = deleteResults.filter(result => !result.success);
            
            if (failedDeletions.length > 0) {
                alert("There was an error deleting the account's movements. Try again Later");
                throw new Error("There was an error deleting the account's movements. Try again Later");
            }
            
            // If there were no errors, delete the account
            return fetch(`/CRUDBankServerSide/webresources/account/${account.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
        })
        .then(response => {
            if (response.ok) deleteButton.closest(".row").remove();
        })
        .catch(error => console.log(error));
    }
}