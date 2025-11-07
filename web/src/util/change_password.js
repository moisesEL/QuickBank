async function sendRequestAndProcessResponse(newPassword, msgBox) {
    const valueNewPassword = newPassword.value.trim();


    fetch("http://localhost:8080/CRUDBankServerSide/webresources/customer/", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: sessionStorage.getItem("customer.id"),
            firstName: sessionStorage.getItem("customer.firstName"),
            lastName: sessionStorage.getItem("customer.lastName"),
            middleInitial: sessionStorage.getItem("customer.middleInitial"),
            email: sessionStorage.getItem("customer.email"),
            password: valueNewPassword,
            phone: sessionStorage.getItem("customer.phone"),
            street: sessionStorage.getItem("customer.street"),
            city: sessionStorage.getItem("customer.city"),
            state: sessionStorage.getItem("customer.state"),
            zip: sessionStorage.getItem("customer.zip")
        })
    })
        .then(res => {
            if (res.ok) {
                msgBox.className = 'success';
                msgBox.textContent = "Password successfully changed.";
                window.location.replace("./sign_in.html");
            } else {
                msgBox.className = 'error';
                msgBox.textContent = "Error: failed to update password (HTTP " + res.status + ")";
            }
            msgBox.style.display = 'block';
        })
        .catch(err => {
            msgBox.className = 'error';
            msgBox.textContent = "Server error: " + err;
            msgBox.style.display = 'block';
        });
}

export default sendRequestAndProcessResponse;
