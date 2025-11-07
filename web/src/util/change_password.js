async function sendRequestAndProcessResponse(newPassword, msgBox) {
    const valueNewPassword = newPassword.value.trim();

    return fetch("/CRUDBankServerSide/webresources/customer/", {
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

}

export default sendRequestAndProcessResponse;
