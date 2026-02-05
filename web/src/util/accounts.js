import { Account } from "./model.js";
import fetch_accounts_by_user_id from "./fetch_accounts_by_user_id.js";
import sumAccountsBalances from "./sumAccountsBalances.js";

// GET all acounts /CRUDBankServerSide/webresources/account/customer/:idCustomer
// GET account /CRUDBankServerSide/webresources/account/:accountId
// PUT account /CRUDBankServerSide/webresources/account
// DELETE account /CRUDBankServerSide/webresources/account/:accountId
// POST account /CRUDBankServerSide/webresources/account

// Save customer id for server petitions
let customerId = sessionStorage.getItem('customer.id');

// Extract tableBody from DOM
const tableBody = document.querySelector("#tableBody");

// Extract main wrapper from DOM
const main = document.getElementById("mainWrapper");

window.addEventListener("DOMContentLoaded", () => {
    try {
        // Server petition to bring all user's accounts
        fetch_accounts_by_user_id(customerId)
        .then(accounts => {
            // Generating each account row using a generator function
            const rowGenerator = account_row_generator(accounts);
            // Append each row to the tableBody
            for (const row of rowGenerator) {
                tableBody.appendChild(row);
            }
        })
        .then(() => {
            // After table is populated, add an empty row for user to create new accounts
            const row = document.createElement("div");
            row.setAttribute("class", "row");
            row.setAttribute("role", "row");
            ["id", "type", "description", "balance", "creditLine", "beginBalance", "beginBalanceTimestamp", "actions"].forEach(field => {
                // Create the cell container and give it the correct role of cell
                const cellContainer = document.createElement("div");
                cellContainer.setAttribute("role", "cell");
                switch (field) {
                    case "id":
                        cellContainer.setAttribute("data-title", "Id");
                        break;
                    case "type":
                        cellContainer.setAttribute("data-title", "Type");
                        break;
                    case "description":
                        cellContainer.setAttribute("data-title", "Description");
                        break;
                    case "balance":
                        cellContainer.setAttribute("data-title", "Balance");
                        break;
                    case "creditLine":
                        cellContainer.setAttribute("data-title", "Credit line");
                        break;
                    case "beginBalance":
                        cellContainer.setAttribute("data-title", "Begin balance");
                        break;
                    case "beginBalanceTimestamp":
                        cellContainer.setAttribute("data-title", "Creation date");
                        break;
                    default:
                        break;
                }
                if (field === "actions") {
                    cellContainer.setAttribute("class", "actionsContainer");
                    // Create button
                    const createButton = document.createElement("button");
                    createButton.setAttribute("class", "createButton");
                    createButton.setAttribute("data-role", "create");
                    // Icon
                    const createIcon = document.createElement("i");
                    createIcon.setAttribute("class", "material-icons");
                    createIcon.innerText = "add";
                    // Appending everything to DOM
                    createButton.appendChild(createIcon)
                    cellContainer.appendChild(createButton);
                    // Adding the event listeners
                    createButton.addEventListener("click", handleCreateButton);
                    createButton.addEventListener("keydown", (event) => {if (event.key === "Enter") handleCreateButton(event)});
                }
                else {
                    const cell = document.createElement("p");
                    cell.setAttribute("data-role", field);
                    cellContainer.appendChild(cell);
                    cell.addEventListener("dblclick", handleCreateButton);
                }
                row.appendChild(cellContainer);
            })
            tableBody.appendChild(row);

            // Extract container after table to append the total balance to it
            const secondContainer = document.getElementById("secondContainer")
            sumAccountsBalances(secondContainer, 'before');

            /*  h5p Code  */
            const helpButton = document.getElementById('helpButton');
            let h5pInstance = null;

            // When helpButton is pressed, initialize h5p container and display video
            helpButton.addEventListener("click", () => {
                const modal = document.getElementById('h5p-container');
                
                // Initialize H5P only once
                if (!h5pInstance) {
                    const options = {
                        h5pJsonPath: '/QuickBank/src/assets/h5p/h5p-content',
                        frameJs: '/QuickBank/src/assets/h5p/h5p-player/frame.bundle.js',
                        frameCss: '/QuickBank/src/assets/h5p/h5p-player/styles/h5p.css',
                        librariesPath: '/QuickBank/src/assets/h5p/h5p-libraries'
                    };
                    h5pInstance = new H5PStandalone.H5P(modal, options);
                }
                
                // Show modal
                modal.style.display = "flex";
                document.body.style.overflow = "hidden";
            });

            // Close modal when clicking outside the video
            document.addEventListener('click', (event) => {
                const modal = document.getElementById('h5p-container');
                if (event.target === modal) {
                    modal.style.display = "none";
                    document.body.style.overflow = "auto";
                }
            });

            // Close modal with ESC key
            document.addEventListener('keydown', (event) => {
                const modal = document.getElementById('h5p-container');
                if (event.key === 'Escape' && modal.style.display === 'flex') {
                    modal.style.display = "none";
                    document.body.style.overflow = "auto";
                }
            });
        })
        .then(() => {
            // Create mini titles in case width less than 900px
            if (window.innerWidth < 900) {
                const tableBody = document.querySelectorAll("#tableBody .row");
                Array.from(tableBody).forEach(row => {
                    Array.from(row.childNodes).forEach(cellContainer => {
                        if (!cellContainer.querySelector(".title")) {
                            const dataTitle = cellContainer.getAttribute("data-title");
                            if (dataTitle) {
                                const title = document.createElement("p");
                                title.setAttribute("class", "title");
                                title.innerText = dataTitle;
                                cellContainer.insertBefore(title, cellContainer.firstElementChild);
                            }
                        }
                    })
                })
            }
        })
    } catch (error) {
        displayError(`There was an error with the server. Try again later.`);
    }
})

window.addEventListener("resize", () => {
    if (window.innerWidth >= 900) {
        const titles = document.querySelectorAll(".title");
        if (titles.length) Array.from(titles).forEach(element => element.remove());
    }
    // Create mini titles in case width less than 900px
    else {
        const tableBody = document.querySelectorAll("#tableBody .row");
        Array.from(tableBody).forEach(row => {
            Array.from(row.childNodes).forEach(cellContainer => {
                if (!cellContainer.querySelector(".title")) {
                    const dataTitle = cellContainer.getAttribute("data-title");
                    if (dataTitle) {
                        const title = document.createElement("p");
                        title.setAttribute("class", "title");
                        title.innerText = dataTitle;
                        cellContainer.insertBefore(title, cellContainer.firstElementChild);
                    }
                }
            })
        })
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
        switch (field) {
            case "id":
                cellContainer.setAttribute("data-title", "Id");
                break;
            case "type":
                cellContainer.setAttribute("data-title", "Type");
                break;
            case "description":
                cellContainer.setAttribute("data-title", "Description");
                break;
            case "balance":
                cellContainer.setAttribute("data-title", "Balance");
                break;
            case "creditLine":
                cellContainer.setAttribute("data-title", "Credit line");
                break;
            case "beginBalance":
                cellContainer.setAttribute("data-title", "Begin balance");
                break;
            case "beginBalanceTimestamp":
                cellContainer.setAttribute("data-title", "Creation date");
                break;
            default:
                break;
        }
        if (field === "actions") {
            cellContainer.setAttribute("class", "actionsContainer");

            // Edit button
            const editButton = document.createElement("button");
            editButton.setAttribute("class", "editButton");
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
            deleteButton.setAttribute("class", "deleteButton");
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
            cell.setAttribute("class", field);
            cell.setAttribute("data-role", field);
            cell.setAttribute("title", `Movements of account: ${account[field]}`);
            cell.innerText = account[field];
            cellContainer.appendChild(cell);
            row.appendChild(cellContainer);
        }
        else {
            const cell = document.createElement("p");
            cell.setAttribute("data-role", field);
            cell.setAttribute("class", field);
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
    input.setAttribute("aria-label", dataRole)
    input.setAttribute("class", cell.getAttribute("class"));
    if (dataRole === 'description') {
        input.type = 'text';
    }
    else {
        input.type = 'number';
        input.min = "0";
        input.max = "1000000";
    }
    input.placeholder = `${dataRole}...`;
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
            saveCellChanges(input, account);
        }
        // Add event listener for canceling on escape
        if (event.key === 'Escape') {
            cancelCellEdit(input, originalValue, account);
        }
    });
    // Add event listener for canceling on blur
    input.addEventListener('blur', () => {
        cancelCellEdit(input, originalValue, account);
    });
}

/**
 * 
 * @param { HTMLInputElement } input 
 * @param { Account } account
 */
function saveCellChanges(input, account) {
    // Extract new value from input
    const newValue = input.value;

    // Extract data-role from input
    const dataRole = input.getAttribute("data-role");
    
    // Validations
    try {
        // Check if description has correct length
        if (dataRole === 'description'){
            if (newValue === 0)
                throw new Error(`Your account description can't be empty`);
            if (newValue > 60)
                throw new Error(`Your account description can't have more than 60 characters`);
        }
        if (dataRole === 'creditLine') {
            if (isNaN(parseFloat(newValue)))
                throw new Error(`Your account's credit line has to be a number`);
            // Check if credit line is not empty
            if (newValue === 0)
                throw new Error(`Your account's credit line can't be empty`);
            // Check if credit line is not higher than balance.
            if (newValue > account.balance)
                throw new Error(`Your credit line can't be higher than your balance`);
        }
        
        // If everything is correct. Overwrite old value with new value from input
        account[dataRole] = newValue;
        
        // Petition to update an account on the server
        fetch('/CRUDBankServerSide/webresources/account', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(account)
        })
        .then(response => {
            if (!response.ok) throw new Error(`There was an error editing your account. Try again later`);
            else location.reload();
        })
        .catch(error => {
            displayError(error.message);
        })
    } catch (error) {
        displayError(error.message);
    }
}

/**
 * 
 * @param { HTMLInputElement } input 
 * @param { string } originalValue 
 * @param { Account } account
 */
function cancelCellEdit(input, originalValue, account) {
    const cellContainer = input.parentNode;
    
    // Create new p element with the original value
    const p = document.createElement('p');
    p.setAttribute("data-role", input.getAttribute("data-role"));
    p.setAttribute("class", input.getAttribute("class"));
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
    // Get target element
    const eventButton = event.currentTarget;

    // On escape press, refresh webpage to close form and go back to starting point
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') location.reload();
    })

    // Cancel button
    const cancelButton = document.createElement("button");
    cancelButton.setAttribute("class", "cancelButton");
    cancelButton.setAttribute("data-role", "cancel");
    // Cancel icon
    const cancelIcon = document.createElement("i");
    cancelIcon.setAttribute("class", "material-icons");
    cancelIcon.innerText = "close";
    cancelButton.appendChild(cancelIcon);

    // Confirm button
    const confirmButton = document.createElement("button");
    confirmButton.setAttribute("class", "confirmButton");
    confirmButton.setAttribute("data-role", "confirm");
    // Confirm icon
    const confirmIcon = document.createElement("i");
    confirmIcon.setAttribute("class", "material-icons");
    confirmIcon.innerText = "check";
    confirmButton.appendChild(confirmIcon);

    // Get the entire row
    const row = eventButton.closest(".row");

    // Replace row with a form
    const form = document.createElement("form");
    form.className = row.className;
    form.setAttribute("role", "row");
    form.setAttribute("id", "addAccountForm");

    // Get all data-role elements and convert to inputs
    const dataElements = row.querySelectorAll("[data-role]");
    Array.from(dataElements).slice(0, -2).forEach(element => {
        const container = document.createElement("div");
        container.setAttribute("role", "cell");
        container.setAttribute("data-title", element.parentNode.getAttribute("data-title"));
        
        if (element.getAttribute("data-role") === "description") {
            const input = document.createElement("input");
            input.setAttribute("name", "description");
            input.setAttribute("aria-label", "Description")
            input.setAttribute("data-role", "Description")
            input.setAttribute("class", element.getAttribute("class"))
            input.type = "text";
            input.placeholder = "description...";
            input.value = element.innerText;
            container.appendChild(input);
        }
        else if (element.getAttribute("data-role") === "creditLine" && account.type === "CREDIT") {
            const input = document.createElement("input");
            input.setAttribute("name", "creditLine");
            input.setAttribute("aria-label", "Credit line")
            input.setAttribute("data-role", "Credit line")
            input.setAttribute("class", element.getAttribute("class"))
            input.placeholder = "credit line...";
            input.min = "0";
            input.max = "1000000";
            input.type = "number";
            input.value = element.innerText;
            container.appendChild(input);
        }
        else {
            container.appendChild(element);
        }
        form.appendChild(container);
    });

    const container = document.createElement("div");
    container.setAttribute("role", "cell");
    container.setAttribute("class", "actionsContainer");
    container.appendChild(confirmButton);
    container.appendChild(cancelButton);
    form.appendChild(container);

    // Replace row with form
    row.parentNode.replaceChild(form, row);

    // Remove submit from cancelButton
    cancelButton.type = 'button';
    // Cancel button refreshes the page to avoid unnecesary coding
    cancelButton.addEventListener("click", () => location.reload());

    // Submit account edition form
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        account.description = formData.get('description');
        account.creditLine = formData.get('creditLine') || 0;
        try {
            // Check if description has correct length
            if (account.description.length === 0)
                throw new Error(`Your account description can't be empty`);
            if (account.description.length > 60)
                throw new Error(`Your account description can't have more than 60 characters`);

            // Check if credit line is not empty
            if (account.type === "CREDIT" && account.creditLine === 0)
                throw new Error(`Your account's credit line can't be empty`);

            // Check if credit line is not higher than balance.
            if (account.type === "CREDIT" && account.creditLine > account.balance)
                throw new Error(`Your credit line can't be higher than your balance`);

            // If every validation goes through, update account.
            fetch('/CRUDBankServerSide/webresources/account', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(account)
            })
            .then(response => {
                if(!response.ok) throw new Error(`There was an error editing your account. Try again later`);
                else location.reload();
            })
        } catch (error) {
            displayError(error.message);
        }
    });
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
            if (!response.ok) throw new Error(`There was an error deleting your account`)
            else return response.json()
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
            if (response.ok) location.reload();
        })
        .catch(error => displayError(error.message));
    }
}

/**
 * 
 * @param { Event } event 
 */
function handleCreateButton(event) {
    // Get target element
    const eventButton = event.currentTarget;

    // On escape press, refresh webpage to close form and go back to starting point
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') location.reload();
    })

    // Cancel button
    const cancelButton = document.createElement("button");
    cancelButton.setAttribute("class", "cancelButton");
    cancelButton.setAttribute("data-role", "cancel");
    // Cancel icon
    const cancelIcon = document.createElement("i");
    cancelIcon.setAttribute("class", "material-icons");
    cancelIcon.innerText = "close";
    cancelButton.appendChild(cancelIcon);

    // Confirm button
    const confirmButton = document.createElement("button");
    confirmButton.setAttribute("class", "confirmButton");
    confirmButton.setAttribute("data-role", "confirm");
    // Confirm icon
    const confirmIcon = document.createElement("i");
    confirmIcon.setAttribute("class", "material-icons");
    confirmIcon.innerText = "check";
    confirmButton.appendChild(confirmIcon);

    // Get the entire row
    const row = eventButton.closest(".row");

    // Replace row with a form
    const form = document.createElement("form");
    form.className = row.className;
    form.setAttribute("role", "row");
    form.setAttribute("id", "addAccountForm");

    // Get all data-role elements and convert to inputs
    const dataElements = row.querySelectorAll("[data-role]");
    Array.from(dataElements).slice(0, -1).forEach(element => {
        const container = document.createElement("div");
        container.setAttribute("role", "cell");
        container.setAttribute("data-title", element.parentNode.getAttribute("data-title"));
        // If we are in a mobile view, also bring the cell titles.
        if (window.innerWidth < 900) {
            const leftSibling = element.previousSibling;
            container.appendChild(leftSibling);
        }
        if (element.getAttribute("data-role") === "id") {
            const input = document.createElement("input");
            input.setAttribute("name", "id")
            input.setAttribute("aria-label", "Id");
            input.setAttribute("class", "id");
            input.type = "hidden";
            input.value = Math.floor(Math.random() * 10000000000);
            const p = document.createElement("p");
            p.innerText = input.value;
            container.appendChild(input);
            container.appendChild(p);
        }
        else if (element.getAttribute("data-role") === "type") {
            const select = document.createElement("select");
            select.setAttribute("aria-label", "type");
            select.setAttribute("class", "type");
            select.innerText = "type";
            select.setAttribute("name", "type")
            const optionStandard = document.createElement("option");
            optionStandard.setAttribute("value", "STANDARD");
            optionStandard.innerText = "STANDARD";
            const optionCredit = document.createElement("option");
            optionCredit.setAttribute("value", "CREDIT");
            optionCredit.innerText = "CREDIT";
            if (element.innerText === "CREDIT") select.tabIndex = 1;

            // Appending to DOM
            select.appendChild(optionStandard);
            select.appendChild(optionCredit);
            container.appendChild(select);
        }
        else if (element.getAttribute("data-role") === "beginBalanceTimestamp"){
            const input = document.createElement("input");
            input.setAttribute("name", "beginBalanceTimestamp");
            input.setAttribute("aria-label", "Begin balance timestamp");
            input.setAttribute("class", "beginBalanceTimestamp");
            input.type = "hidden";
            const date = new Date();
            input.value = date.toISOString();

            const display = document.createElement("span");
            display.innerText = `${formatAMPM(date)} - ${date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}`;
            container.appendChild(input);
            container.appendChild(display);
        }
        else if (element.getAttribute("data-role") === "description") {
            const input = document.createElement("input");
            input.setAttribute("name", "description");
            input.setAttribute("aria-label", "Description");
            input.setAttribute("class", "description");
            input.type = "text";
            input.placeholder = "description...";
            container.appendChild(input);
        }
        else if (element.getAttribute("data-role") === "balance") {
            const input = document.createElement("input");
            input.setAttribute("name", "balance");
            input.setAttribute("aria-label", "Balance");
            input.setAttribute("class", "balance");
            input.placeholder = "balance...";
            input.min = "0";
            input.max = "1000000";
            input.type = "number";
            input.value = "0";
            container.appendChild(input);
        }
        else if (element.getAttribute("data-role") === "creditLine") {
            const select = form.querySelector("[name='type']");
            if (select.value === 'CREDIT') {
                const input = document.createElement("input");
                input.setAttribute("name", "creditLine");
                input.setAttribute("aria-label", "Credit line");
                input.setAttribute("class", "creditLine");
                input.placeholder = "credit line...";
                input.min = "0";
                input.max = "1000000";
                input.type = "number";
                input.value = "0";
                container.appendChild(input);
            }
            else {
                const p = document.createElement("p");
                p.setAttribute("name", "creditLine")
                p.setAttribute("class", "creditLine");
                p.innerText = '0';
                container.appendChild(p)
            }
            select.addEventListener("change", (event) => {
                const selection = event.target.value;
                const toReplace = form.querySelector("[name='creditLine']");
                if (selection === 'CREDIT') {
                    const input = document.createElement("input");
                    input.setAttribute("name", "creditLine");
                    input.setAttribute("aria-label", "Credit line");
                    input.setAttribute("class", "creditLine");
                    input.placeholder = "credit line...";
                    input.min = "0";
                    input.max = "1000000";
                    input.type = "number";
                    input.value = "0";
                    toReplace.parentNode.replaceChild(input, toReplace);
                }
                else {
                    const p = document.createElement("p");
                    p.setAttribute("name", "creditLine")
                    p.setAttribute("class", "creditLine");
                    p.innerText = '0';
                    toReplace.parentNode.replaceChild(p, toReplace);
                }
            })
        }
        else if (element.getAttribute("data-role") === "beginBalance") {
            const p = document.createElement("p");
            p.setAttribute("class", "beginBalance");
            p.innerText = "0";
            const balance = form.querySelector("[name='balance']");
            balance.addEventListener("input", (event) => {
                const balance = event.target.value;
                if (balance == 0) p.innerText = '0';
                else p.innerText = balance;
            })
            container.appendChild(p);
        }
        form.appendChild(container);
    });

    const container = document.createElement("div");
    container.setAttribute("role", "cell");
    container.setAttribute("class", "actionsContainer");
    container.appendChild(confirmButton);
    container.appendChild(cancelButton);
    form.appendChild(container);

    // Replace row with form
    row.parentNode.replaceChild(form, row);

    // Remove submit from button
    cancelButton.type = 'button';
    // Cancel button refreshes the page to avoid unnecesary coding
    cancelButton.addEventListener("click", () => location.reload());

    // Submit form
    form.addEventListener("submit", handleCreateSubmit);
}

/**
 * 
 * @param { Event } event
*/
function handleCreateSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const account = new Account();

    // Map form fields to account
    account.id = formData.get('id');
    account.type = formData.get('type');
    account.description = formData.get('description');
    account.balance = parseFloat(formData.get('balance') || 0);
    account.creditLine = parseFloat(formData.get('creditLine') || 0);
    account.beginBalance = account.balance;
    account.beginBalanceTimestamp = formData.get('beginBalanceTimestamp');

    // Validations
    try {
        // Check if description has correct length
        if (account.description.length === 0)
            throw new Error(`Your account description can't be empty`);
        if (account.description.length > 60)
            throw new Error(`Your account description can't have more than 60 characters`);

        // Check if balance is not empty
        if (account.balance === 0)
            throw new Error(`Your account balance can't be empty`);

        // Check if credit line is not empty when account's type is CREDIT
        if (account.type === "CREDIT" && account.creditLine === 0)
            throw new Error(`Your account credit can't be empty if the account type is CREDIT`);

        // Check if credit line is not higher than balance.
        if (account.type === "CREDIT" && account.creditLine > account.balance)
            throw new Error(`Your credit line can't be higher than your balance`);

        fetch('/CRUDBankServerSide/webresources/account', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(account)
        })
        .then(response => {
            if (!response.ok) throw new Error (`There was an error creating your account`);
            else location.reload();
        })
        .catch(error => displayError(error.message))
    } catch (error) {
        displayError(error.message);
    }
}

/**
 * 
 * @param { string } message
 */
function displayError(message) {
    // Clear all errors
    document.querySelectorAll('.error').forEach(element => element.remove());
    if (window.innerWidth < 900) {
        alert(message);
    }
    else {
        const error = document.createElement("span");
        error.setAttribute("class", "error");
        error.innerText = message;
        main.insertBefore(error, main.firstElementChild);
    }
}