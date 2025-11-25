async function changePassword(newPassword) {
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

 export default changePassword;


 
// async function changePassword(newPassword) {
//     const valueNewPassword = newPassword.value.trim();
//     const xml = {
//             <customer>
//                 <id>${id}</id>
//                 <firstName>${firstName}</firstName>
//                 <lastName>${lastName}</lastName>
//                 <middleInitial>${middleInitial}</middleInitial>
//                 <email>${email}</email>
//                 <password>${password}</password>
//                 <phone></phone>
//                 <street>${street}</street>
//                 <city>${city}</city>
//                 <state>${state}</state>
//                 <zip><${zip}/zip>            
//             </customer>

//     }

//     return fetch("/CRUDBankServerSide/webresources/customer/", {
//         method: "PUT",
//         headers: {
//             "Content-Type": "application/xml"
//         },
//         body: xml
//     })
// }

// export default changePassword;
