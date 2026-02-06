import { Customer } from "./model.js";

const SERVICE_URL = "/CRUDBankServerSide/webresources/customer";
const tableBody = document.getElementById("tableBody");
const forSection = document.getElementById("forSection"); 
const form = document.getElementById("form"); 
const title = document.getElementById("formTitle");
const main = document.getElementById("mainWrapper");

let selectedUser = null;

/* =========================
   ****** MENSAJES ******
========================= */
function displayError(message) {
    document.querySelectorAll('.error').forEach(element => element.remove());
    const error = document.createElement("span");
    error.setAttribute("class", "error");
    error.setAttribute("role", "alert");
    error.setAttribute("aria-live", "assertive");
    error.innerText = message;
    alertContainer.appendChild(error);
}

function displaySuccess(message) {
    document.querySelectorAll('.success').forEach(element => element.remove());
    const success = document.createElement("span");
    success.setAttribute("class", "success");
    success.setAttribute("role", "alert");
    success.setAttribute("aria-live", "assertive");
    success.innerText = message;
    alertContainer.appendChild(success);
}

function clearMessage() {
    document.querySelectorAll('.error, .success').forEach(element => element.remove());
}

/* =========================
   GENERAR PASSWORD
========================= */
function generatePassword(length = 8) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let pwd = "";
    for (let i = 0; i < length; i++) {
        pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pwd;
}

/* =========================
   CARGAR USUARIOS 
========================= */
export async function loadUsers() {
    tableBody.innerHTML = "";
    clearMessage();
    try {
        const res = await fetch(SERVICE_URL, { headers: { "Accept": "application/json" } });
        if (!res.ok) throw new Error("Error loading users. Try again."); 
        const users = await res.json();

        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            const row = document.createElement("div");
            row.className = "row";
            row.setAttribute("role", "row");

            row.innerHTML = `
                <div role="cell">${user.id}</div>
                <div role="cell">${user.firstName}</div>
                <div role="cell">${user.lastName}</div>
                <div role="cell">${user.middleInitial || ""}</div>
                <div role="cell">${user.street}</div>
                <div role="cell">${user.city}</div>
                <div role="cell">${user.state}</div>
                <div role="cell">${user.zip}</div>
                <div role="cell">${user.phone}</div>
                <div role="cell">${user.email}</div>
                <div role="cell">******</div>
                <div role="cell" class="actionsContainer">
                    <button class="editButton" aria-label="Edit user">Edit</button>
                    <button class="deleteButton" aria-label="Delete user">Delete</button>
                </div>
            `;

            row.onclick = () => {
                // Limpiamos selección anterior
                const allRows = document.querySelectorAll(".row");
                for (let j = 0; j < allRows.length; j++) {
                    allRows[j].classList.remove("selected");
                }
                row.classList.add("selected");
                selectedUser = user;
            };

            row.querySelector(".editButton").addEventListener("click", (e) => {
                e.stopPropagation();
                editUser(user);
            });

            row.querySelector(".deleteButton").addEventListener("click", (e) => {
                e.stopPropagation();
                deleteUser(user);
            });

            tableBody.appendChild(row);
        }

        // Fila vacía para create
        const createRow = document.createElement("div");
        createRow.className = "row";
        createRow.setAttribute("role", "row");
        createRow.innerHTML = `
            <div role="cell"></div>
            <div role="cell"></div>
            <div role="cell"></div>
            <div role="cell"></div>
            <div role="cell"></div>
            <div role="cell"></div>
            <div role="cell"></div>
            <div role="cell"></div>
            <div role="cell"></div>
            <div role="cell"></div>
            <div role="cell"></div>
            <div role="cell" class="actionsContainer">
                <button class="createButton" aria-label="Create user">Create</button>
            </div>
        `;
        createRow.querySelector(".createButton").addEventListener("click", handleCreateButton);
        tableBody.appendChild(createRow);

    } catch (err) {
        console.error(err);
        displayError("Error loading users. Try again.");
    }
}

/* =========================
   FUNCIONES DE LOS  BOTONES
========================= */
function handleCreateButton() {
    selectedUser = null;
    form.reset();
    title.textContent = "Create user";
    forSection.style.display = "block";
    form.elements["firstName"].focus();
}

function editUser(user) {
    selectedUser = user;
    title.textContent = "Edit user";
    const keys = Object.keys(user);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (form.elements[key]) {
            form.elements[key].value = user[key];
        }
    }
    forSection.style.display = "block";
    form.elements["firstName"].focus(); 
}

function deleteUser(user) {
    if (!user) {
        displayError("Select a user to delete."); 
        return;
    }
    if (user.email === sessionStorage.getItem("customer.email")) {
        displayError("You cannot delete your own user.");
        return;
    }
    // ¿Seguro que quieres eliminar a " + user.email + "?"
    if (!confirm("Are you sure you want to delete " + user.email + "?")) return;
 
    fetch(`${SERVICE_URL}/${user.id}`, { method: "DELETE" })
        .then(response => {
            if (!response.ok) throw new Error("Error deleting user"); 
            displaySuccess("User deleted successfully.");
            selectedUser = null;
            loadUsers();
        })
        .catch(err => {
            console.error(err);
            displayError("Error deleting user. Try again."); 
        });
}

/* =========================
   MANEJO DEL FORMULARIO
========================= */
document.getElementById("btnCancel").addEventListener("click", () => {
    forSection.style.display = "none"; 
    selectedUser = null;
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearMessage();
    //  "¿Seguro que quieres guardar los cambios?"
    if (!confirm("Are you sure you want to save the changes?")) return;

    const formData = new FormData(form);
    const password = generatePassword();

    const customer = new Customer(
        selectedUser ? selectedUser.id : null,
        formData.get("firstName"),
        formData.get("lastName"),
        formData.get("middleInitial"),
        formData.get("street"),
        formData.get("city"),
        formData.get("state"),
        formData.get("zip"),
        formData.get("phone"),
        formData.get("email"),
        password
    );

    // Validaciones simples
    if (!customer.firstName || !customer.lastName || !customer.street || !customer.city || !customer.state || !customer.zip || !customer.phone || !customer.email) {
        displayError("All fields are required."); 
        return;
    }

    try {
        const method = selectedUser ? "PUT" : "POST";
        const res = await fetch(SERVICE_URL, {
            method,
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify(customer)
        });
        if (!res.ok) throw new Error("Error saving user");
        displaySuccess("User saved successfully."); 
        forSection.style.display = "none"; 
        selectedUser = null;
        loadUsers();
    } catch (err) {
        console.error(err);
        displayError("Error saving user. Try again."); 
    }
});

/* CARGAR INICIALMENTE */
loadUsers();