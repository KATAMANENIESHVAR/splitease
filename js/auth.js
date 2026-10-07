const msg = t =>
    document.getElementById("message").innerHTML = `
        <div class="${t[0] === "S" ? "success" : "error"}">
            ${t.slice(1)}
        </div>
    `;

if (document.getElementById("loginForm")) {

    document.getElementById("loginForm").onsubmit = e => {

        e.preventDefault();

        const id = document
            .getElementById("identifier")
            .value
            .trim()
            .toLowerCase();

        const p = document
            .getElementById("password")
            .value;

        const u = getUsers().find(
            x =>
                (
                    x.username.toLowerCase() === id ||
                    x.email.toLowerCase() === id
                ) &&
                x.password === p
        );

        if (!u) {
            msg(
                "EInvalid username/email or password."
            );
            return;
        }

        setCurrentUser(u.id);

        logActivity("Logged in");

        location.href =
            u.role === "admin"
                ? "admin.html"
                : "dashboard.html";
    };
}


if (document.getElementById("registerForm")) {

    document.getElementById("registerForm").onsubmit = e => {

        e.preventDefault();

        const name = document
            .getElementById("name")
            .value
            .trim();

        const username = document
            .getElementById("username")
            .value
            .trim();

        const email = document
            .getElementById("email")
            .value
            .trim()
            .toLowerCase();

        const password = document
            .getElementById("password")
            .value;

        const confirm = document
            .getElementById("confirmPassword")
            .value;

        const users = getUsers();

        if (password !== confirm) {
            return msg(
                "EPasswords do not match."
            );
        }

        if (
            users.some(
                u =>
                    u.username.toLowerCase() ===
                    username.toLowerCase()
            )
        ) {
            return msg(
                "EUsername already exists."
            );
        }

        if (
            users.some(
                u => u.email === email
            )
        ) {
            return msg(
                "EEmail already registered."
            );
        }

        users.push({
            id: uid(),
            name,
            username,
            email,
            password,
            role: "user",
            createdAt: new Date().toISOString()
        });

        saveUsers(users);

        msg(
            "SAccount created successfully. Redirecting..."
        );

        setTimeout(
            () => location.href = "login.html",
            900
        );
    };
}