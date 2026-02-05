import { Movements } from "./model.js";

// Capturamos los parámetros de la URL
const urlParams = new URLSearchParams(window.location.search);
// Extraemos el valor de 'account'
const accountId = urlParams.get('account');

//
const SERVICE_URL_MOV = "/CRUDBankServerSide/webresources/movement/";
const SERVICE_URL_ACC = "/CRUDBankServerSide/webresources/account/";
// const accountId = "3252214522";
const currencyFormatter = new Intl.NumberFormat('es-ES', {
   style: 'currency', currency: 'EUR', minimumFractionDigits: 2
});
const dateFormatter = new Intl.DateTimeFormat(undefined, {
   year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
});


// (GET) OBtener movimientos
async function GetMovements(id) {
   const response = await fetch(`${SERVICE_URL_MOV}account/${id}`, {
       method: 'GET',
       headers: { 'Accept': 'application/json' }
   });
   return response.ok ? await response.json() : [];
}

// (POST) crear movimiento
async function PostMovement(id, movementObj) {
   const response = await fetch(`${SERVICE_URL_MOV}${id}`, {
       method: "POST",
       headers: { "Content-Type": "application/json", "Accept": "application/json" },
       body: JSON.stringify(movementObj)
   });   
   return response.status === 204 ? {} : await response.json();}

// (PUT) actualizar cuenta
async function PutAccount(accountObj) {
    // ELIMINAMOS los movimientos del objet
    const dataToSend = { ...accountObj };
    delete dataToSend.movements; 

    const response = await fetch(SERVICE_URL_ACC, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(dataToSend)
    });
    return response.status === 204 ? {} : await response.json();}

// (DELETE) Eliminar movimiento
async function DeleteMovement(idMovement) {
   const response = await fetch(`${SERVICE_URL_MOV}${idMovement}`, {
       method: "DELETE",
       headers: { "Accept": "application/json" }
   });
   if (!response.ok) throw new Error("Error alss2 eliminar el movimiento");
   return response.status === 204 ? {} : await response.json();
}


function* movementRowGenerator(movements) {
   for (const movement of movements) {
       const tr = document.createElement("tr");
      
       ["timestamp", "description", "amount", "balance"].forEach(field => {
           const td = document.createElement("td");
           let value = movement[field];

           if (field === "timestamp" && value) {
               value = dateFormatter.format(new Date(value));
           }
           else if ((field === "amount" || field === "balance") && value !== undefined) {
               if (field === "amount" && parseFloat(value) > 0) {
                   td.style.color = "green";
               }
               value = currencyFormatter.format(value);
           }

           td.textContent = value ?? "N/A";
           tr.appendChild(td)
       });

       const tdAction = document.createElement("td");
       tdAction.textContent = "---";
       tr.appendChild(tdAction);

       yield tr;
   }
}

/**
* Construir la tabla
*/
export async function renderMovements() {
   if (!accountId) {
       alert("No se ha seleccionado ninguna cuenta.");
       window.location.href = "/QuickBank/src/views/accounts.html";
       return;
   }

   const tableBody = document.querySelector("#movementsTable tbody");

   try {
       const accountResponse = await fetch(`${SERVICE_URL_ACC}${accountId}`, {
           headers: { 'Accept': 'application/json' }
       });
       const fullAccount = await accountResponse.json();
          const disponibleTotal = fullAccount.balance + (fullAccount.creditLine || 0);

       sessionStorage.setItem("account", JSON.stringify(fullAccount));

       const movements = await GetMovements(accountId);
       tableBody.innerHTML = "";
       console.log(fullAccount.type); 

        document.getElementById("typeAccount").textContent = fullAccount.type;
        document.getElementById("balance").textContent = fullAccount.balance;


       if (fullAccount.type === "CREDIT") {
            document.getElementById("creditLine").textContent = fullAccount.creditLine;
            document.getElementById("balanceTotal").textContent = disponibleTotal;


       } else {
            document.getElementById("creditContainer").style.display = "none";
             document.getElementById("balanceContainer").style.display = "none";

       }


        movements.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

       const rowGenerator = movementRowGenerator(movements);
       for (const row of rowGenerator) {
           tableBody.appendChild(row);
       }

   } catch (error) {
       console.error("Error al cargar datos:", error.message);
   }
}


// --- Agregar movimiento en linea ---

async function saveMovementInline() {
   const amountInput = document.getElementById("newAmount");
   const amount = parseFloat(amountInput.value);
   const description = document.getElementById("newDescription").value;
   // const accountData = JSON.parse(sessionStorage.getItem("account")) || { id: accountId, balance: 100 };

   const accountData = JSON.parse(sessionStorage.getItem("account"))
   // logica para cuentas de credito
   const disponibleTotal = accountData.balance + (accountData.creditLine || 0);


   if (accountData.type === "STANDARD" && description === "Payment" && accountData.balance < amount) {
      alert("Error: Operación rechazada. Retire dinero disponible");
      return;
   }

    if (accountData.type === "CREDIT" && description === "Payment" && amount > disponibleTotal) {
       return alert("Error: Operación rechazada. Supera su límite de crédito disponible.");
   }
  

   if (amount <= 0) return alert("Valor no válido");

   if (isNaN(amount)) {
       alert("Introduce un valor numérico válido");
       return;
   }



   let newBalance;

   if (description === "Deposit") {
       newBalance = accountData.balance + amount;
   } else {
       newBalance = accountData.balance - amount;
   }

   try {
       const movObj = new Movements(null, newBalance, amount, description, new Date().toISOString());
       await PostMovement(accountData.id, movObj);
      
       accountData.balance = newBalance;
       await PutAccount(accountData);

       sessionStorage.setItem("account", JSON.stringify(accountData));
       amountInput.value = "";
       await renderMovements();
       alert("¡Transacción realizada con éxito!");
      
   } catch (e) {
       alert("Error en la transacción");
   }
}
// --- Eliminar último movimiento ---

async function deleteLastMovement() {
   try {
       const movements = await GetMovements(accountId);
       if (movements.length === 0) return alert("No hay movimientos para eliminar.");

        // Guardamos el ultimo movimiento en una constante
       const lastMov = movements[(movements.length)-1];
       const accountData = JSON.parse(sessionStorage.getItem("account"));
      
       // Calculamos si es deposito o retiro
       if (lastMov.description === "Deposit") {
           accountData.balance -= lastMov.amount;
       } else {
           accountData.balance += lastMov.amount;
       }

       // Borramos movimiento 
       await DeleteMovement(lastMov.id);

       if (!accountData.customers) {
           accountData.customers = [{ id: sessionStorage.getItem('customer.id') }];
       }


       // Actualizamos (PUT) la cuenta con el nuevo saldo
       await PutAccount(accountData);


       sessionStorage.setItem("account", JSON.stringify(accountData));
       await renderMovements();
      
       alert("Movimiento eliminado con exito");

   } catch (e) {
       console.error(e);
       alert("Error al eliminar el movimiento");
   }
}


document.addEventListener("DOMContentLoaded", () => {
   renderMovements();
   const btn = document.getElementById("btnConfirmMovement");
   if (btn) btn.addEventListener("click", saveMovementInline);
   const btnDelete = document.getElementById("btnDeleteLastMovement");
   if (btnDelete) btnDelete.addEventListener("click", deleteLastMovement);
});