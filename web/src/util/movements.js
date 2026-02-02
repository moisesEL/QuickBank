import { Movements } from "./model.js";

const SERVICE_URL_MOV = "/CRUDBankServerSide/webresources/movement/";
const SERVICE_URL_ACC = "/CRUDBankServerSide/webresources/account/";

const getAccountData = () => JSON.parse(sessionStorage.getItem("account")) || { id: "3252214522", balance: 100.00, type: "STANDARD" };

/* CARGAR LA TABLA */
export async function renderMovements() {
    const tableBody = document.querySelector("#movementsTable tbody");
    const balanceDisplay = document.querySelector("#balanceDisplay");
    const accountData = getAccountData();

    try {
        const response = await fetch(`${SERVICE_URL_MOV}account/${encodeURIComponent(accountData.id)}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        const movements = await response.json();
        tableBody.innerHTML = "";

        // Ordenamos: el más reciente arriba para ver el cambio rápido
        movements.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        movements.forEach(m => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${m.timestamp ? new Date(m.timestamp).toLocaleString() : "Recent"}</td>
                <td>${m.description}</td>
                <td style="color: ${m.amount < 0 ? 'red' : 'green'}; font-weight: bold;">
                    ${m.amount.toFixed(2)} €
                </td>
                <td style="font-weight: bold;">${m.balance.toFixed(2)} €</td>
                <td>---</td>
            `;
            tableBody.appendChild(row);
        });

        if (movements.length > 0) {
            balanceDisplay.textContent = `${movements[0].balance.toFixed(2)} €`;
            // Actualizamos el balance local para que el siguiente cálculo sea correcto
            accountData.balance = movements[0].balance;
            sessionStorage.setItem("account", JSON.stringify(accountData));
        }
    } catch (error) { console.error("Error al renderizar:", error); }
}

/* 2. CREAR MOVIMIENTO Y ACTUALIZAR CUENTA */
async function saveMovementInline() {
    const amountInput = document.getElementById("newAmount");
    const descriptionSelect = document.getElementById("newDescription");
    const amount = parseFloat(amountInput.value);
    const description = descriptionSelect.value;

    if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount");
        return;
    }

    try {
        const accountData = getAccountData();
        // Calculamos el balance según el tipo de operación
        const newBalance = (description === "Deposit") 
            ? accountData.balance + amount 
            : accountData.balance - amount;

        // 1. Crear el objeto de movimiento (POST)
        const movObj = new Movements(null, newBalance, amount, description, new Date().toISOString());
        const resMov = await fetch(`${SERVICE_URL_MOV}${encodeURIComponent(accountData.id)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(movObj)
        });

        if (!resMov.ok) throw new Error("Server error creating movement");

        // 2. Actualizar el saldo global de la cuenta (PUT)
        accountData.balance = newBalance;
        const resAcc = await fetch(SERVICE_URL_ACC, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(accountData)
        });

        if (resAcc.ok) {
            sessionStorage.setItem("account", JSON.stringify(accountData));
            amountInput.value = ""; // Limpiar el input
            await renderMovements(); // Refrescar la tabla automáticamente
            alert("Transaction successful!");
        }
    } catch (err) { alert(err.message); }
}

/* 3. LISTENER DEL BOTÓN DE LA FILA */
export function setupInlineListeners() {
    const btn = document.getElementById("btnConfirmMovement");
    if (btn) {
        btn.addEventListener("click", saveMovementInline);
    }
}