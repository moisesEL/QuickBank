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
let usersCache = []; // ⭐ AÑADIDO: cache para validar emails duplicados

/* =========================
   MENSAJES GENERALES
========================= */
function displayError(message) {
    clearMessage(); // ⭐ AÑADIDO: limpiar mensajes generales antes
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
========================= */
export async function loadUsers() {
    tableBody.innerHTML = "";
    clearMessage();
    try {
        const res = await fetch(SERVICE_URL, { headers: { "Accept": "application/json" } });
        if (!res.ok) throw new Error("Error loading users. Try again.");
        const users = await res.json();
        usersCache = users; // ⭐ AÑADIDO: cache para validaciones

        users.forEach(user => {
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

            row.onclick = () => selectRow(row, user);

            row.querySelector(".editButton").onclick = e => { e.stopPropagation(); editUser(user); };
            row.querySelector(".deleteButton").onclick = e => { e.stopPropagation(); deleteUser(user); };

            tableBody.appendChild(row);
        });

        // Fila para crear
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
        createRow.querySelector(".createButton").onclick = handleCreateButton;
        tableBody.appendChild(createRow);

    } catch (err) {
        console.error(err);
        displayError("Error loading users. Try again.");
    }
}

function selectRow(row, user) {
    document.querySelectorAll(".row").forEach(r => r.classList.remove("selected"));
    row.classList.add("selected");
    selectedUser = user;
}

/* =========================
   BOTONES
========================= */
function handleCreateButton() {
    selectedUser = null;
    form.reset();
    title.textContent = "Create user";
    forSection.style.display = "block";
    form.firstName.focus();
}

function editUser(user) {
    selectedUser = user;
    clearMessage();
    title.textContent = "Edit user";

    Object.keys(user).forEach(k => {
        if (form.elements[k]) form.elements[k].value = user[k];
    });

    forSection.style.display = "block";
    form.firstName.focus();
}

async function deleteUser(user) {
    if (!user) return;

    if (user.email === sessionStorage.getItem("customer.email")) {
        displayError("Action denied: You cannot delete your own admin account.");
        return;
    }

    // ⭐ AÑADIDO: validar si usuario tiene cuentas bancarias
    if (user.accountList && user.accountList.length > 0) {
        displayError("Cannot delete: This user still has active bank accounts.");
        return;
    }

    if (!confirm(`Confirm deletion of ${user.email}?`)) return;

    try {
        const res = await fetch(`${SERVICE_URL}/${user.id}`, { method: "DELETE" });
        if (!res.ok) throw new Error();
        displaySuccess("User deleted successfully.");
        loadUsers();
    } catch {
        displayError("Error: User could not be deleted. Check dependencies.");
    }
}

/* =========================
   MANEJO DEL FORMULARIO
========================= */
document.getElementById("btnCancel").onclick = () => {
    forSection.style.display = "none";
    selectedUser = null;
    clearMessage();
};

/* =========================
   FUNCIONES AUXILIARES VALIDACION mensajes debajo porsi acaso
========================= */

// ⭐ AÑADIDO: mostrar errores debajo del input y con focus por si acaso
function pintarErrorEspecifico(inputName, mensaje) {
    const inputField = form.elements[inputName];
    if (!inputField) return;
    clearErrorField(inputField);
    inputField.classList.add("input_error");
    inputField.setAttribute("aria-invalid", "true"); // ⭐ accesibilidad
    inputField.focus();
    const span = document.createElement("span");
    span.className = "field-error-msg";
    span.style.color = 'red';
    span.style.fontSize = '12px';
    span.innerText = mensaje;
    inputField.insertAdjacentElement('afterend', span);
}

// ⭐ Limpiar errores de un input
function clearErrorField(inputField){
    const next = inputField.nextElementSibling;
    if(next && next.classList.contains("field-error-msg")) next.remove();
    inputField.classList.remove("input_error");
    inputField.removeAttribute("aria-invalid");
}

/* =========================
   SUBMIT CON VALIDACIONES
========================= */
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

        if(res.status === 403) throw {input:"email", message:"Ecorreo ya en uso."};
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
========================= */
function validarCampos(customer){
    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{2,50}$/;
    const middleRegex = /^[A-Za-z]$/;
    const zipRegex = /^\d{1,6}$/;
    const phoneRegex = /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!nameRegex.test(customer.firstName)) throw {input:"firstName", message:"First name must contain only letters and spaces (2-50 chars)."};
    if(!nameRegex.test(customer.lastName)) throw {input:"lastName", message:"Last name must contain only letters and spaces (2-50 chars)."};
    if(customer.middleInitial && !middleRegex.test(customer.middleInitial)) throw {input:"middleInitial", message:"Middle initial must be 1 letter."};
    if(customer.street.length<1) throw {input:"street", message:"Street is required."};
    if(customer.city.length<1) throw {input:"city", message:"City is required."};
    if(customer.state.length<1) throw {input:"state", message:"State is required."};
    if(!zipRegex.test(customer.zip)) throw {input:"zip", message:"Zip must be a number (1-6 digits)."};
    if(!phoneRegex.test(customer.phone)) throw {input:"phone", message:"Phone format invalid."};
    if(!emailRegex.test(customer.email)) throw {input:"email", message:"Enter a valid email (example@domain.com)."};
}

/* =========================
   H5P actualizado
========================= */
document.addEventListener("DOMContentLoaded",()=>{ /*el DOMContentLoaded se asegura de que el código se ejecute después de que el DOM esté completamente cargado
 eso me evita que se vea doble el video   */
/* h5p Code  */
   const helpButton = document.getElementById('helpButton');

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

/* =========================
   CARGAR INICIALMENTE
========================= */
loadUsers();
