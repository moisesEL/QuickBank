import { Movements } from "./model.js";/*probando no terminado aun*/
const SERVICE_URL = "/CRUDBankServerSide/webresources/customer";

let selectedUser = null;

/* =========================
   LOAD USERS
========================= */
async function loadUsers() {
    const res = await fetch(SERVICE_URL, {
        headers: { "Accept": "application/json" }
    });

    const users = await res.json();
    const tbody = document.getElementById("usersTabletbody");
    tbody.innerHTML = "";

    users.forEach(user => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${user.id}</td>
            <td>${user.firstName}</td>
            <td>${user.lastName}</td>
            <td>${user.middleInitial}</td>
            <td>${user.street}</td>
            <td>${user.city}</td>
            <td>${user.state}</td>
            <td>${user.zip}</td>
            <td>${user.phone}</td>
            <td>${user.email}</td>
            <td>${user.password}</td>
        `;

        tr.onclick = () => {
            document.querySelectorAll("#usersTabletbody tr")
                .forEach(r => r.classList.remove("selected"));

            tr.classList.add("selected");
            selectedUser = user;
        };

        tbody.appendChild(tr);
    });
}

loadUsers();

/* =========================
   BUTTONS
========================= */
const formSection = document.getElementById("formSection");
const form = document.getElementById("userForm");
const title = document.getElementById("formTitle");

/* CREATE */
document.getElementById("btnCreate").onclick = () => {
    selectedUser = null;
    form.reset();
    title.textContent = "Crear usuario";
    formSection.style.display = "block";
};

/* EDIT */
document.getElementById("btnEdit").onclick = () => {
    if (!selectedUser) {
        alert("Selecciona un usuario");
        return;
    }

    title.textContent = "Editar usuario";

    Object.keys(selectedUser).forEach(key => {
        if (form.elements[key]) {
            form.elements[key].value = selectedUser[key];
        }
    });

    formSection.style.display = "block";
};

/* CANCEL */
document.getElementById("btnCancel").onclick = () => {
    formSection.style.display = "none";
};

/* =========================
   SAVE (POST / PUT)
========================= */
form.onsubmit = e => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(form));
    let url = SERVICE_URL;
    let method = "POST";

    if (selectedUser !== null) {
        data.id = selectedUser.id;
        method = "PUT";
    }

    fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(res => {
        if (!res.ok) alert("Error al guardar");
        else {
            alert("Usuario guardado correctamente");
            formSection.style.display = "none";
            selectedUser = null;
            loadUsers();
        }
    });
};

/* =========================
   DELETE
========================= */
document.getElementById("btnDelete").onclick = async () => {
    if (!selectedUser) {
        alert("Selecciona un usuario");
        return;
    }

    if (selectedUser.email === sessionStorage.getItem("customer.email")) {
        alert("ERROR. no se puede borrar a uno mismo");
        return;
    }

    if (!confirm(`Eliminar usuario ${selectedUser.email}?`)) return;

    const res = await fetch(`${SERVICE_URL}/${selectedUser.id}`, {
        method: "DELETE"
    });

    if (!res.ok) {
        alert("Error al eliminar usuario");
        return;
    }

    selectedUser = null;
    loadUsers();
};







