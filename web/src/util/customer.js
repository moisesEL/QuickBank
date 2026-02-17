/**
 * @fixme Controlar que no se puedan borrar los Customer que tengan cuentas e informar al usuario de tal situación.
 * Para lo anterior tendrá que hacer una petición GET /CRUDBankServerSide/webresources/account/customer/{id}. 
 */

import { Customer } from "./model.js";

const SERVICE_URL = "/CRUDBankServerSide/webresources/customer";
const tableBody = document.getElementById("tableBody");
const forSection = document.getElementById("forSection");
const form = document.getElementById("form");
const title = document.getElementById("formTitle");
const main = document.getElementById("mainWrapper");
const alertContainer = document.getElementById("alertContainer");

let selectedUser = null;
let h5pInstance = null;
let usersCache = [];

/* =========================
   ****** MENSAJES ******
========================= */
function displayError(message) {
    clearMessage(); 
    const error = document.createElement("span");
    error.className = "error";
    error.setAttribute("role", "alert");
    error.setAttribute("aria-live", "assertive");
    error.innerText = message;
    alertContainer.appendChild(error);
}

function displaySuccess(message) {
    clearMessage();
    const success = document.createElement("span");
    success.className = "success";
    success.setAttribute("role", "alert");
    success.setAttribute("aria-live", "polite");
    success.innerText = message;
    alertContainer.appendChild(success);
}

function clearMessage() {
    document.querySelectorAll('.error, .success').forEach(el => el.remove());
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
========================== */   
function* userGenerator(users) {
    for (const user of users) {
        yield user;
    } 
}


export async function loadUsers() {
    tableBody.innerHTML = "";
    clearMessage();
    try {
        const res = await fetch(SERVICE_URL, { headers: { "Accept": "application/json" } });
        if (!res.ok) throw new Error("Error loading users. Try again."); 
        const users = await res.json();
        //FIXME Sustituir esta iteración por el uso de una función generadora // lo meti en una funcion aparte y hago el llamado  */
          
        for (const user of userGenerator(users)) {  
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


/* =========================
   FUNCIONES DE BORRADO comprobar si el usuario tiene cuentas bancarias antes de eliminarlo, 
   si tiene cuentas mostrar un mensaje de error indicando que no se puede eliminar al usuario hasta que se eliminen sus cuentas bancarias.
========================= */
async function checkUserHasAccounts(userId) {
    try {
        const res = await fetch(`/CRUDBankServerSide/webresources/account/customer/${userId}`, { headers: { "Accept": "application/json" } });
        if (!res.ok) throw new Error("Error checking accounts. Try again.");
        const accounts = await res.json();
        return accounts.length > 0; 
    } catch (err) {
        console.error(err);
        displayError("Error checking user accounts. Try again.");
        return true;
    }
}               
    
async function deleteUser(user) {
    if (!user) return;

    if (user.email.endsWith("@admin.com") || user.email.endsWith("@admin.com")) {
        displayError("Access denied: Administrator users cannot be removed from the system.");
        selectedUser = null; 
        return; 
    }

    if (user.email === sessionStorage.getItem("customer.email")) {
        displayError("Action denied: You cannot delete your own admin account.");
        return;
    }

    // Validar si usuario tiene cuentas bancarias
    if (await checkUserHasAccounts(user.id)) {
        displayError("Cannot be deleted: this user has active accounts.");
        return;
    }

    if (!confirm(`Confirm deletion of ${user.email}?`)) return;

    try {
        const deleteRes = await fetch(`${SERVICE_URL}/${user.id}`, { method: "DELETE" });
        if (!deleteRes.ok) throw new Error("Error deleting user. Try again.");
        displaySuccess("User deleted successfully.");
        selectedUser = null;
        loadUsers();                    
    } catch {
        displayError("Error: User could not be deleted. Check dependencies.");
    }
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
    if (!customer.firstName  || !customer.lastName || !customer.street || !customer.city || !customer.state || !customer.zip || !customer.phone || !customer.email) {
        displayError("All fields are required."); 
        return;
    }
    

    //FIXME Validar el formato del email usando una expresión regular 
    //use la exprecion regular del sign_up
        const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
        if (!emailRegex.test(customer.email)) { 
         displayError("Invalid email format.");
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
 

/* esta es una vercion donde se valida los campos del formulario y verificaciones de los duplicados del email */
/* =========================
   FUNCIONES DE VALIDACION mensajes debajo de los inputs
========================= */

/*
function pintarErrorEspecifico(inputName, mensaje) {
    const inputField = form.elements[inputName];
    if (!inputField) return;
    clearErrorField(inputField);
    inputField.classList.add("input_error");
    inputField.setAttribute("aria-invalid", "true"); 
    inputField.focus();
    const span = document.createElement("span");
    span.className = "field-error-msg";
    span.style.color = 'red';
    span.style.fontSize = '15px';
    span.innerText = mensaje;
    inputField.insertAdjacentElement('afterend', span);
}

//  Limpiar errores de un input
function clearErrorField(inputField){
    const next = inputField.nextElementSibling;
    if(next && next.classList.contains("field-error-msg")) next.remove();
    inputField.classList.remove("input_error");
    inputField.removeAttribute("aria-invalid");
}

/* =========================
   SUBMIT CON VALIDACIONES
========================= *//*
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearMessage();
    form.querySelectorAll(".input_error").forEach(i=>clearErrorField(i));

    if (!confirm("Are you sure you want to save the changes?")) return;

    const formData = new FormData(form);
    const password = selectedUser ? selectedUser.password : generatePassword();

    const customer = new Customer(
        selectedUser ? selectedUser.id : null,
        formData.get("firstName").trim(),
        formData.get("lastName").trim(),
        formData.get("middleInitial").trim(),
        formData.get("street").trim(),
        formData.get("city").trim(),
        formData.get("state").trim(),
        formData.get("zip").trim(),
        formData.get("phone").trim(),
        formData.get("email").trim(),
        password
    );

    try {
        // ⭐ AÑADIDO: validación de cada campo con mensajes debajo
        validarCampos(customer);

        // ⭐ AÑADIDO: email duplicado antes del fetch
        const duplicate = usersCache.find(u=>u.email===customer.email && (!selectedUser || u.id!==selectedUser.id));
        if(duplicate) throw {input:"email", message:"This email is already registered."};

        const method = selectedUser ? "PUT" : "POST";
        const res = await fetch(SERVICE_URL,{
            method,
            headers:{"Content-Type":"application/json", "Accept":"application/json"},
            body:JSON.stringify(customer)
        });

        if(res.status === 403) throw {input:"email", message:"Error, this email address already exists."};
        if(!res.ok) throw new Error("Error saving user");

        displaySuccess("User saved successfully.");
        forSection.style.display="none";
        selectedUser = null;
        loadUsers();

    } catch(err){
        if(err.input) pintarErrorEspecifico(err.input, err.message);
        else displayError(err.message || "Error saving user");
    }
});

/* =========================
   FUNCION VALIDACION DE CAMPOS
========================= *//*
function validarCampos(customer){
    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{2,50}$/;
    const middleRegex = /^[A-Za-z]$/;
    const zipRegex = /^\d{1,6}$/;
    const phoneRegex = /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
    const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

    if(!nameRegex.test(customer.firstName)) throw {input:"firstName", message:"First name must contain only letters and spaces (2-50 chars)."};
    if(!nameRegex.test(customer.lastName)) throw {input:"lastName", message:"Last name must contain only letters and spaces (2-50 chars)."};
    if(customer.middleInitial && !middleRegex.test(customer.middleInitial)) throw {input:"middleInitial", message:"Middle initial must be 1 letter."};
    if(customer.street.length<1) throw {input:"street", message:"Street is required."};
    if(customer.city.length<1) throw {input:"city", message:"City is required."};
    if(customer.state.length<1) throw {input:"state", message:"State is required."};
    if(!zipRegex.test(customer.zip)) throw {input:"zip", message:"Zip must be a number (1-6 digits)."};
    if(!phoneRegex.test(customer.phone)) throw {input:"phone", message:"Phone format invalid."};
    if(!emailRegex.test(customer.email)) throw {input:"email", message:"Error to valid email (example@domain.com).
}
*/
/* =========================
   H5P VIDEO HELP
========================= */
document.addEventListener("DOMContentLoaded", () => {

if (!sessionStorage.getItem('customer.id')) window.location.replace("/QuickBank");

    /*  h5p Code  */
    const helpButton = document.getElementById('helpButton');
    let h5pInstance = null;

    // When helpButton is pressed, initialize h5p container and display video
    helpButton.addEventListener("click", () => {
        const modal = document.getElementById('h5p-container');
        
        // Initialize H5P only once
        if (!h5pInstance) {
            const options = {
                h5pJsonPath: '/QuickBank/src/assets/h5p/h5p-customer',
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
});
/* CARGAR INICIALMENTE */
loadUsers();