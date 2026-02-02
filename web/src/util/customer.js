// ...existing code...
import { Customer } from "./model.js"; 

const SERVICE_URL = "/CRUDBankServerSide/webresources/customer";

let selectedUser = null;

/* =========================
   GENERAR PASSWORD
========================= */
export function generatePassword(length = 8) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let Password = "";
    for (let i = 0; i < length; i++) {
        Password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return Password;
}


/* =========================
   CARGAR USUARIOS
========================= */
export async function loadUsers() {
    try {
        console.log("Buscando customers en:", SERVICE_URL);
        const res = await fetch(SERVICE_URL, {
            headers: { "Accept": "application/json" },
            credentials: "same-origin" // conserva cookies/sesión si aplica
        });
        console.log("Respuesta fetch customers:", res.status, res.statusText);

        if (!res.ok) {
            const txt = await res.text().catch(() => "<no body>");
            console.error("Error HTTP al solicitar customers:", res.status, txt);
            throw new Error(`HTTP ${res.status} - ${txt}`);
        }

        let users;
        try {
            users = await res.json();
        } catch (parseErr) {
            console.error("No se pudo parsear JSON de customers:", parseErr);
            throw new Error("Respuesta del servidor no es JSON válido.");
        }

        if (!Array.isArray(users)) {
            console.warn("Se esperaba un array de usuarios, se recibió:", users);
            users = users ? [users] : [];
        }

        const tbody = document.getElementById("usersTabletbody");
        if (!tbody) {
            console.error("No se encontró el elemento #usersTabletbody en el DOM.");
            return;
        }

        tbody.innerHTML = "";

        (users || []).forEach(user => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${user.id}</td>
                <td>${user.firstName}</td>
                <td>${user.lastName}</td>
                <td>${user.middleInitial || ""}</td>
                <td>${user.street}</td>
                <td>${user.city}</td>
                <td>${user.state}</td>
                <td>${user.zip}</td>
                <td>${user.phone}</td>
                <td>${user.email}</td>
                <td>******</td>
            `;
            tr.onclick = () => {
                document.querySelectorAll("#usersTabletbody tr").forEach(r => r.classList.remove("selected"));
                tr.classList.add("selected");
                selectedUser = user;
            };
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error("Error cargando usuarios:", err);
        // Mensaje visible al usuario
        alert("Error cargando usuarios: " + (err.message || err));
    }
}
// ...existing code...
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
        alert("Selecciona un usuario para editar");
        return;
    }
    title.textContent = "Editar usuario";
    Object.keys(selectedUser).forEach(key => {
        if (form.elements[key]) form.elements[key].value = selectedUser[key];
    });
    formSection.style.display = "block";
};

/* CANCEL */
document.getElementById("btnCancel").onclick = () => {
    formSection.style.display = "none";
    selectedUser = null;
};

/* SAVE (POST / PUT) */
form.onsubmit = async e => {
    e.preventDefault();
    if (!confirm("¿Seguro que quieres guardar los cambios?")) return;

    const formData = new FormData(form);
    const password = generatePassword(); // password aleatoria

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

    const method = selectedUser ? "PUT" : "POST";

    try {
        const res = await fetch(SERVICE_URL, {
            method,
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify(customer)
        });
        if (!res.ok) throw new Error("Error al guardar el usuario");

        alert("Usuario guardado correctamente");
        formSection.style.display = "none";
        selectedUser = null;
        loadUsers();
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
};

/* DELETE */
document.getElementById("btnDelete").onclick = async () => {
    if (!selectedUser) {
        alert("Selecciona un usuario para eliminar");
        return;
    }
    if (selectedUser.email === sessionStorage.getItem("customer.email")) {
        alert("No puedes eliminar tu propio usuario");
        return;
    }
    if (!confirm(`¿Seguro que quieres eliminar a ${selectedUser.email}?`)) return;

    try {
        const res = await fetch(`${SERVICE_URL}/${selectedUser.id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Error al eliminar usuario");

        alert("Usuario eliminado correctamente");
        selectedUser = null;
        loadUsers();
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
};

/* CARGAR INICIALMENTE */
loadUsers();