/**
 * 
 * @param { string } formatedNumber
 * @returns 
 */
function unformatString(formatedNumber) {
    var unformatted = formatedNumber;
    unformatted = unformatted.split(".").join("");
    unformatted = unformatted.split(",").join(".");
    return parseFloat(unformatted);
}

export default unformatString;