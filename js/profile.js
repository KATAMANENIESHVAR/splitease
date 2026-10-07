const u = requireAuth();

if (u) {

    layout(
        "profile",
        "Profile",
        `
        <div class="form-card">

            <h2>Account Details</h2>

            <form id="profileForm">

                <label>
                    Full Name
                    <input
                        id="name"
                        value="${u.name}"
                    >
                </label>

                <label>
                    Username
                    <input
                        value="${u.username}"
                        disabled
                    >
                </label>

                <label>
                    Email
                    <input
                        value="${u.email}"
                        disabled
                    >
                </label>

                <label>
                    New Password
                    <input
                        id="password"
                        type="password"
                        placeholder="Leave blank to keep current"
                    >
                </label>

                <button class="btn btn-primary">
                    Save Changes
                </button>

            </form>

        </div>

        <div class="section">

            <div class="card">

                <b>Account created</b>

                <p class="muted">
                    ${new Date(u.createdAt).toLocaleString()}
                </p>

                <button
                    class="btn danger btn-sm"
                    onclick="logout()"
                >
                    Logout
                </button>

            </div>

        </div>
        `
    );

    // Profile Form Submission
    document.getElementById("profileForm").onsubmit = e => {

        e.preventDefault();

        const users = getUsers();

        const x = users.find(
            a => a.id === u.id
        );

        // Update user's name
        x.name = name.value.trim();

        // Update password only if a new password is entered
        if (password.value) {
            x.password = password.value;
        }

        // Save updated user data
        saveUsers(users);

        toast("Profile updated");
    };
}