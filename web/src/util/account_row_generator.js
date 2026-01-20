import { Account } from "./model.js"; 
/**
 * 
 * Generator function that yields account table rows
 * @param {Account[]} accounts
 */
function* account_row_generator(accounts) {
    for (const account of accounts) {
    const tr = document.createElement("tr");
    ["id", "type", "description", "balance", "creditLine", "beginBalance", "beginBalanceTimestamp"].forEach(field => {
        const td = document.createElement("td");
        const div = document.createElement("div");
        const input = document.createElement("input");
        input.disabled = true;
        input.value = account[field];

        td.style.position = "relative";
        div.style.position = "absolute";
        div.style.top = "0px";
        div.style.left = "0px";
        div.style.minWidth = window.getComputedStyle(input).getPropertyValue("width");
        div.style.minHeight = window.getComputedStyle(input).getPropertyValue("height");

        // 
        // console.log("Height: ", window.getComputedStyle(input).getPropertyValue("height"))
        
        // console.log("Width: ", window.getComputedStyle(input).getPropertyValue("width").toString())
        // 

        td.appendChild(div)
        td.appendChild(input);
        tr.appendChild(td);
        div.addEventListener("click", () => {
            alert("PORFAVOR HACE ALGO");
        })
    });
    yield tr;
    }
}

export default account_row_generator;