/**
 * @param { HTMLElement } toAppendOn The HTML element you want to append the total account's balances
 */
function sumAccountsBalances(toAppendOn) {
    // Get all balance cells
    const arrBalances = document.querySelectorAll("[data-role='balance']");
    // Sum each account's balance
    const sum = Array.from(arrBalances).reduce((acc, element) => acc + (parseInt(element.innerText) || 0), 0);
    // Create p element to attach to DOM
    const total = document.createElement("p");
    total.setAttribute("id", "total")
    total.setAttribute("class", "totalBalance");
    total.style.fontSize = '1.2rem';
    total.innerHTML = `Your total account's balance is <strong>${sum}</strong>`;
    toAppendOn.appendChild(total);
}

export default sumAccountsBalances;