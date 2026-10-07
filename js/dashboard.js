const u = requireAuth();

if (u) {
    const groups = getGroups().filter(g => g.members.includes(u.id));

    const ex = getExpenses().filter(e =>
        groups.some(g => g.id === e.groupId)
    );

    let owed = 0;
    let owes = 0;

    groups.forEach(g => {
        const es = ex.filter(e => e.groupId === g.id);

        es.forEach(e => {
            const share = e.amount / e.participants.length;

            if (e.paidBy === u.id) {
                owed += e.amount - share;
            } else if (e.participants.includes(u.id)) {
                owes += share;
            }
        });
    });

    layout(
        "dashboard",
        `Welcome back, ${u.name.split(" ")[0]}`,
        `
        <div class="content-grid">

            <div class="card">
                <span class="stat-label">Total Groups</span>
                <div class="stat-value">
                    ${groups.length}
                </div>
            </div>

            <div class="card">
                <span class="stat-label">Total Expenses</span>
                <div class="stat-value">
                    ${ex.length}
                </div>
            </div>

            <div class="card">
                <span class="stat-label">You Owe</span>
                <div class="stat-value negative">
                    ${money(owes)}
                </div>
            </div>

            <div class="card">
                <span class="stat-label">You Are Owed</span>
                <div class="stat-value positive">
                    ${money(owed)}
                </div>
            </div>

        </div>

        <div class="section">
            <div class="section-head">
                <h2>Quick Actions</h2>
            </div>

            <div class="grid">

                <a class="card" href="groups.html">
                    <b>Create / manage groups</b>
                    <p class="muted">
                        Organize your shared expenses.
                    </p>
                </a>

                <a class="card" href="expenses.html">
                    <b>Add an expense</b>
                    <p class="muted">
                        Record a bill and split it automatically.
                    </p>
                </a>

            </div>
        </div>

        <div class="section">

            <div class="section-head">
                <h2>Recent Expenses</h2>

                <a href="expenses.html" class="btn btn-ghost btn-sm">
                    View all
                </a>
            </div>

            <div class="table-wrap">

                <table class="table">

                    <thead>
                        <tr>
                            <th>Expense</th>
                            <th>Group</th>
                            <th>Amount</th>
                            <th>Paid by</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${
                            ex.slice(0, 6)
                                .map(e => {
                                    const p = getUsers().find(
                                        x => x.id === e.paidBy
                                    );

                                    const g = groups.find(
                                        x => x.id === e.groupId
                                    );

                                    return `
                                        <tr>
                                            <td>${e.description}</td>
                                            <td>${g?.name || "-"}</td>
                                            <td>${money(e.amount)}</td>
                                            <td>${p?.name || "-"}</td>
                                        </tr>
                                    `;
                                })
                                .join("")
                            ||
                            `
                                <tr>
                                    <td colspan="4" class="empty">
                                        No expenses yet.
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
}