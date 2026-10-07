const u = requireAuth(true);

if (u) {

    const users = getUsers();
    const groups = getGroups();
    const expenses = getExpenses();

    layout(
        "admin",
        "Admin Panel",
        `
        <div class="admin-banner">
            <b>Administrator Console</b>
            <br>
            <small>
                Manage users, groups and activity.
                <span>Demo mode — data is stored locally.</span>
            </small>
        </div>

        <div class="content-grid">

            <div class="card">
                <span class="stat-label">
                    Total Users
                </span>

                <div class="stat-value">
                    ${users.length}
                </div>
            </div>

            <div class="card">
                <span class="stat-label">
                    Total Groups
                </span>

                <div class="stat-value">
                    ${groups.length}
                </div>
            </div>

            <div class="card">
                <span class="stat-label">
                    Total Expenses
                </span>

                <div class="stat-value">
                    ${expenses.length}
                </div>
            </div>

            <div class="card">
                <span class="stat-label">
                    Total Expense Value
                </span>

                <div class="stat-value">
                    ${money(
                        expenses.reduce(
                            (a, e) => a + e.amount,
                            0
                        )
                    )}
                </div>
            </div>

        </div>

        <div class="section">

            <div class="section-head">
                <h2>User Management</h2>
            </div>

            <div class="table-wrap">

                <table class="table">

                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Username</th>
                            <th>Role</th>
                            <th>Created</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>

                        ${
                            users
                                .map(x => `
                                    <tr>

                                        <td>
                                            ${x.name}
                                        </td>

                                        <td>
                                            ${x.username}
                                        </td>

                                        <td>
                                            <span class="pill">
                                                ${x.role}
                                            </span>
                                        </td>

                                        <td>
                                            ${new Date(
                                                x.createdAt
                                            ).toLocaleDateString()}
                                        </td>

                                        <td>
                                            ${
                                                x.id === "admin"
                                                    ? `
                                                        <span class="muted">
                                                            Protected
                                                        </span>
                                                    `
                                                    : `
                                                        <button
                                                            class="btn danger btn-sm"
                                                            onclick="deleteUser('${x.id}')"
                                                        >
                                                            Delete
                                                        </button>
                                                    `
                                            }
                                        </td>

                                    </tr>
                                `)
                                .join("")
                        }

                    </tbody>

                </table>

            </div>

        </div>

        <div class="section">

            <div class="section-head">
                <h2>Activity Log</h2>
            </div>

            <div class="table-wrap">

                <table class="table">

                    <thead>
                        <tr>
                            <th>Action</th>
                            <th>User</th>
                            <th>Time</th>
                        </tr>
                    </thead>

                    <tbody>

                        ${
                            read(KEYS.logs)
                                .slice(0, 15)
                                .map(l => `
                                    <tr>

                                        <td>
                                            ${l.action}
                                        </td>

                                        <td>
                                            ${l.user}
                                        </td>

                                        <td>
                                            ${new Date(
                                                l.time
                                            ).toLocaleString()}
                                        </td>

                                    </tr>
                                `)
                                .join("")
                            ||
                            `
                                <tr>
                                    <td
                                        colspan="3"
                                        class="empty"
                                    >
                                        No activity.
                                    </td>
                                </tr>
                            `
                        }

                    </tbody>

                </table>

            </div>

        </div>
        `
    );

    window.deleteUser = id => {

        if (id === u.id) {
            return toast(
                "You cannot delete your own account."
            );
        }

        if (!confirm("Delete this user?")) {
            return;
        }

        saveUsers(
            getUsers().filter(
                x => x.id !== id
            )
        );

        saveGroups(
            getGroups().map(g => ({
                ...g,
                members: g.members.filter(
                    m => m !== id
                )
            }))
        );

        saveExpenses(
            getExpenses().filter(
                e => e.paidBy !== id
            )
        );

        logActivity("Deleted user");

        location.reload();
    };
}