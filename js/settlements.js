const u = requireAuth();

if (u) {

    // Get groups that the logged-in user belongs to
    const groups = getGroups().filter(
        g => g.members.includes(u.id)
    );

    // Get expenses belonging to those groups
    const es = getExpenses().filter(
        e => groups.some(g => g.id === e.groupId)
    );

    // Get settlement history
    const settled = getSettlements();

    // Calculate balances for a group
    function balances(g) {

        const b = {};

        // Initialize every member's balance to 0
        g.members.forEach(id => {
            b[id] = 0;
        });

        // Process every expense in the group
        es
            .filter(e => e.groupId === g.id)
            .forEach(e => {

                const share =
                    e.amount / e.participants.length;

                // Person who paid gets credited
                b[e.paidBy] += e.amount;

                // Each participant gets charged their share
                e.participants.forEach(id => {
                    b[id] -= share;
                });
            });

        return b;
    }

    // Generate balance table rows
    function rows() {

        let out = "";

        groups.forEach(g => {

            const b = balances(g);
            const names = getUsers();

            Object
                .entries(b)
                .filter(([id, v]) => Math.abs(v) > 0.01)
                .forEach(([id, v]) => {

                    out += `
                        <tr>
                            <td>
                                ${g.name}
                            </td>

                            <td>
                                ${names.find(
                                    x => x.id === id
                                )?.name || id}
                            </td>

                            <td class="${
                                v < 0
                                    ? "negative"
                                    : "positive"
                            }">
                                ${
                                    v < 0
                                        ? "Owes "
                                        : "Gets back "
                                }

                                ${money(Math.abs(v))}
                            </td>
                        </tr>
                    `;
                });
        });

        return out;
    }

    // Render Settlements page
    layout(
        "settlements",
        "Settlements",
        `
        <!-- Current Balances -->
        <div class="card">

            <h2>Current balances</h2>

            <p class="muted">
                Positive balances mean the person should receive
                money; negative balances mean they owe money.
            </p>

        </div>

        <!-- Balance Table -->
        <div class="section">

            <div class="table-wrap">

                <table class="table">

                    <thead>
                        <tr>
                            <th>Group</th>
                            <th>Person</th>
                            <th>Balance</th>
                        </tr>
                    </thead>

                    <tbody>

                        ${
                            rows()
                            ||
                            `
                                <tr>
                                    <td
                                        colspan="3"
                                        class="empty"
                                    >
                                        Everyone is settled.
                                    </td>
                                </tr>
                            `
                        }

                    </tbody>

                </table>

            </div>

        </div>

        <!-- Settlement History -->
        <div class="section">

            <h2>Settlement History</h2>

            <div class="table-wrap">

                <table class="table">

                    <thead>
                        <tr>
                            <th>From</th>
                            <th>To</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>

                    <tbody>

                        ${
                            settled
                                .map(s => `
                                    <tr>

                                        <td>
                                            ${
                                                getUsers().find(
                                                    x => x.id === s.from
                                                )?.name || "-"
                                            }
                                        </td>

                                        <td>
                                            ${
                                                getUsers().find(
                                                    x => x.id === s.to
                                                )?.name || "-"
                                            }
                                        </td>

                                        <td>
                                            ${money(s.amount)}
                                        </td>

                                        <td>
                                            <span class="pill">
                                                ${s.status}
                                            </span>
                                        </td>

                                    </tr>
                                `)
                                .join("")
                            ||
                            `
                                <tr>
                                    <td
                                        colspan="4"
                                        class="empty"
                                    >
                                        No settlement history.
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