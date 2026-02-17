import unformatString from "./unformatString.js";
/**
 * @param { HTMLElement } toAppendOn The HTML element you want to append the total account's balances
 * @param { string } order The order in which you want to append the total balance. 'before' or 'after'
 */
function sumAccountsBalances(toAppendOn, order) {
    // Get all balance cells
    const arrBalances = document.querySelectorAll("[data-role='balance']");
    // Sum each account's balance
    const sum = Array.from(arrBalances).reduce((acc, element) => acc + (parseFloat(unformatString(element.innerText)) || 0), 0);
    // Create p element to attach to DOM
    const total = document.createElement("p");
    total.setAttribute("id", "total")
    total.setAttribute("class", "totalBalance");
    total.style.fontSize = '1.2rem';
    total.innerHTML = `Your total account's balance is <strong>${sum.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</strong>`;
    if (order === 'before') {
        toAppendOn.insertBefore(total, toAppendOn.firstElementChild);
    }
    else {
        toAppendOn.appendChild(total);
    }
}

export default sumAccountsBalances;