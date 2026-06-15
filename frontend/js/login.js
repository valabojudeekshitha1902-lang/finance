const form =
document.getElementById("loginForm");

form.addEventListener(
"submit",
async (e)=>{

    e.preventDefault();

    const email =
    document.getElementById("email").value;

    const password =
    document.getElementById("password").value;

    if(!email || !password){
        document.getElementById("error").innerText =
        "Email and password are required";
        return;
    }

    try{

        const response =
        await fetch(
        "http://localhost:5000/api/auth/login",
        {
            method:"POST",

            headers:{
                "Content-Type":
                "application/json"
            },

            body:JSON.stringify({
                email,
                password
            })
        });

        const data =
        await response.json();

        if(response.ok){

    console.log(data);

    localStorage.setItem(
        "token",
        data.token
    );

    localStorage.setItem(
        "role",
        data.user.role
    );

    window.location.href =
    "dashboard.html";

}
        else{

            document.getElementById(
            "error"
            ).innerText =
            data.message;

        }

    }
    catch(error){

        console.log(error);
        document.getElementById("error").innerText =
        "Backend not reachable";

    }

});
