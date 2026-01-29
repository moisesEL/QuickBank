// Server url to create a new customer (POST)
let url = `/CRUDBankServerSide/webresources/customer`;

class Customer {
    constructor(email, firstName, middleInitial, lastName, password, street, city, state, zip, phone) {
        this.email = email;
        this.firstName = firstName;
        this.middleInitial = middleInitial;
        this.lastName = lastName;
        this.password = password;
        this.street = street;
        this.city = city;
        this.state = state;
        this.zip = zip;
        this.phone = phone;
    }
}

/**
 * 
 * @param { Customer } Customer object that encapsulates customer data 
 * @returns { Promise } Promise object that encapsulates server response
 */
async function create_customer (customer) {
    return await fetch(url, {
        method: 'POST',
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(customer)
    })
}

// When DOM is loaded, get form and add an event listener for submit to trigger a new customer creation
window.addEventListener("DOMContentLoaded", () => {
document.getElementById('form').addEventListener('submit', (event) => {
    event.preventDefault(); // prevent form submit
    const form = event.target;
    let customer = new Customer (
        form.email.value.trim(),
        form.firstName.value.trim(),
        form.middleInitial.value.trim(),                    
        form.lastName.value.trim(),
        form.password.value.trim(),
        form.street.value.trim(),
        form.city.value.trim(),
        form.state.value.trim(),
        form.zip.value.trim(),
        form.phone.value.trim()
    );
    try {
        // Clear all error messages
        document.querySelectorAll('.input_error').forEach(input => input.className = '');
        document.querySelectorAll('#server_error').forEach(span => span.remove());
        document.getElementById('form').querySelectorAll('span').forEach(span => span.remove());

        // firstName field verification to filter unempty, smaller then 255 characters, and doesn't contain ' character
        if (customer.firstName > 255 || customer.firstName == '' || customer.firstName.includes('\''))
            throw {input: "firstName", message: "Your first name is not valid."}
        
        // middleInitial field verification to filter special characters
        if (customer.middleInitial.length > 0 && !customer.middleInitial.match(/[a-z]|[A-Z]/))
            throw {input: "middleInitial", message: "Your middle initial is not valid.\nIt should be 1 alphabetic character."}
        
        // lastName field verification to filter unempty, smaller than 255 characters, and doesn't contain ' character
        if (customer.lastName > 255 || customer.lastName == '' || customer.lastName.includes('\''))
            throw {input: "lastName", message: "Your last name is not valid."}

        // Email Regular Expression to filter wrong formatted emails
        let emailRegex = new RegExp(/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/ );
        if (!emailRegex.test(customer.email))
            throw {input: "email", message: "Email not valid."}
        
        // Password Regular Expression to filter non strong passwords
        let passwordRegex = new RegExp(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{0,20}$/);
        if (!passwordRegex.test(customer.password))
            throw {input: "password", message: "Your password has to be between 5 and 20 characters.\nIt should have at least 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character."}
        
        // Phone Regular Expression to filter wrong formatted phones
        let phoneRegex = new RegExp(/^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/);
        if (!phoneRegex.test(customer.phone))
            throw {input: "phone", message: "Your phone is not valid."}
        
        // street Field verification to filter unempty, smaller than 255 characters, and doesn't contain ' character
        if (customer.street > 255 || customer.street == '' || customer.street.includes('\''))
            throw {input: "street", message: "Your street is not valid."}

        // city Field verification to filter unempty, smaller than 255 characters, and doesn't contain ' character
        if (customer.city > 255 || customer.city == '' || customer.city.includes('\''))
            throw {input: "city", message: "Your city is not valid."}

        // state Field verification to filter unempty, smaller than 255 characters, and doesn't contain ' character
        if (customer.state > 255 || customer.state == '' || customer.state.includes('\''))
            throw {input: "state", message: "Your state is not valid."}
        
        // Zip Regular Expression to filter non numbers and numbers lower than 1 digit, and higher than 6
        let zipRegex = new RegExp(/^\d{1,6}$/);
        if (!zipRegex.test(customer.zip))
            throw {input: "zip", message: "Your zip is not valid.\nIt should be a number"}

        // Once every field verification passes, we create the customer
        create_customer(customer)
        .then(response => {
            // If response status means it didn't work, we throw the message for the error 
            // handler to print it to the user in the webpage
            switch (response.status) {
                case response.status >= 500:
                    throw {status: 500, message: "The server is not working, try again later."}
                case 404:
                    throw {status: 404, message: "The server is not working, try again later."}
                case 403:
                    throw {status: 403, message: "The email is already taken, wanna try to log in?"}
                case response.status >= 400 && response.status < 500:
                    throw {status: response.status, message: "Something was wrong"}
                default:
                    break;
            }
            // Save customer email to session Storage to provide user experience in sign in page.
            sessionStorage.setItem("customer.email", customer.email)
            // Redirection to sign in page for the user to log in to his newly created account
            window.location.replace("/QuickBank/src/views/sign_in.html");
        })
        // Error handler that only comes out when the petition to the server goes wrong
        .catch(err => {
            const error_message = document.createElement('span');
            error_message.id = "server_error";
            error_message.style = 'padding:5px; background-color:rgb(255, 255, 255); border: 2px solid red; margin-bottom: 5px';
            error_message.innerText = err.message;
            if (!document.getElementById(`${err.input}`)) {
                form.parentNode.insertBefore(error_message, form);
            }
        })
    // Error handler that comes out when a field input verification doesn't pass
    } catch (err) {
        form[`${err.input}`].className = "input_error";
        const error_message = document.createElement('span');
        error_message.style = 'color:red;';
        error_message.innerText = err.message;
        error_message.id = `${err.input}_error`;
        if (err.input === 'password') {
            form[`${err.input}`].parentNode.parentNode.appendChild(error_message);
        }
        else {
            form[`${err.input}`].parentNode.appendChild(error_message);
        }
    }
    })
})