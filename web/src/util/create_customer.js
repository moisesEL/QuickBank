let url = `/CRUDBankServerSide/webresources/customer`;
async function create_customer (data) {
    return await fetch(url, {
        method: 'POST',
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
}
window.addEventListener("DOMContentLoaded", () => {
document.getElementById('form').addEventListener('submit', (event) => {
    event.preventDefault(); // prevent form submit
    const form = event.target;
    let customer = {
        email: form.email.value.trim(),
        firstName: form.firstName.value.trim(),
        middleInitial: form.middleInitial.value.trim(),                    
        lastName: form.lastName.value.trim(),
        password: form.password.value.trim(),
        street: form.street.value.trim(),
        city: form.city.value.trim(),
        state: form.state.value.trim(),
        zip: form.zip.value.trim(),
        phone: form.phone.value.trim()
    };
    try {
        document.querySelectorAll('.input_error').forEach(input => input.className = '');
        document.querySelectorAll('#server_error').forEach(span => span.remove());
        document.getElementById('form').querySelectorAll('span').forEach(span => span.remove());
        let emailRegex = new RegExp(/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/ );
        let passwordRegex = new RegExp(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{0,20}$/);
        let phoneRegex = new RegExp(/^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/);
        let zipRegex = new RegExp(/^\d{1,6}$/);
        if (customer.firstName > 255 || customer.firstName == '' || customer.firstName.includes('\''))
            throw {input: "firstName", message: "Your first name is not valid."}
        if (customer.middleInitial.length > 0 && !customer.middleInitial.match(/[a-z]|[A-Z]/))
            throw {input: "middleInitial", message: "Your middle initial is not valid.\nIt should be 1 alphabetic character."}
        if (customer.lastName > 255 || customer.lastName == '' || customer.lastName.includes('\''))
            throw {input: "lastName", message: "Your last name is not valid."}

        if (!emailRegex.test(customer.email))
            throw {input: "email", message: "Email not valid."}

        if (!passwordRegex.test(customer.password))
            throw {input: "password", message: "Your password has to be between 5 and 20 characters.\nIt should have at least 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character."}

        if (!phoneRegex.test(customer.phone))
            throw {input: "phone", message: "Your phone is not valid."}

        if (customer.street > 255 || customer.street == '' || customer.street.includes('\''))
            throw {input: "street", message: "Your street is not valid."}

        if (customer.city > 255 || customer.city == '' || customer.city.includes('\''))
            throw {input: "city", message: "Your city is not valid."}

        if (customer.state > 255 || customer.state == '' || customer.state.includes('\''))
            throw {input: "state", message: "Your state is not valid."}

        if (!zipRegex.test(customer.zip))
            throw {input: "zip", message: "Your zip is not valid.\nIt should be a number"}

        create_customer(customer)
        .then(response => {
            switch (response.status) {
                case response.status >= 500:
                    throw {status: 500, message: "The server is not working, try again later."}
                case 404:
                    throw {status: 404, message: "The server is not working, try again later."}
                    break;
                case 403:
                    throw {status: 403, message: "The email is already taken, wanna try to log in?"}
                case response.status > 400 && response.status < 500:
                    throw {status: response.status, message: "Something was wrong"}
                default:
                    break;
            }
            sessionStorage.setItem("customer.email", customer.email)
            window.location.replace("/QuickBank/src/views/sign_in.html");
        })
        .catch(err => {
            const error_message = document.createElement('span');
            error_message.id = "server_error";
            error_message.style = 'padding:5px; background-color:rgb(255, 255, 255); border: 2px solid red; margin-bottom: 5px';
            error_message.innerText = err.message;
            if (!document.getElementById(`${err.input}`)) {
                form.parentNode.insertBefore(error_message, form);
            }
        })
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