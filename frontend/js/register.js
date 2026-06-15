const registerForm =
document.getElementById("registerForm");

registerForm.addEventListener("submit", async (e)=>{
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;
    const message = document.getElementById("message");
    const error = document.getElementById("error");

    message.innerText = "";
    error.innerText = "";

    if(!name || !email || !password){
        error.innerText = "All fields are required";
        return;
    }

    if(password.length < 8){
        error.innerText = "Password must be at least 8 characters";
        return;
    }

    try{
        const response = await fetch(
            "http://localhost:5000/api/auth/register",
            {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    name,
                    email,
                    password,
                    role
                })
            }
        );

        const data = await response.json();

        if(response.ok){
            message.innerText = data.message;
            registerForm.reset();
        }
        else{
            error.innerText = data.message || "Registration failed";
        }
    }
    catch(err){
        console.log(err);
        error.innerText = "Backend not reachable";
    }
});
