const u = requireAuth();

if (u) {

    const q = new URLSearchParams(location.search);
    const pre = q.get("group");

    const groups = getGroups().filter(
        g => g.members.includes(u.id)
    );

    layout(
        "expenses",
        "Expenses",
        `
        <div class="form-card">

            <h2>Add Expense</h2>

            <form id="expenseForm">

                <label>
                    Group

                    <select id="groupId" required>
                        ${
                            groups.length
                                ? groups
                                    .map(
                                        g => `
                                            <option
                                                value="${g.id}"
                                                ${
                                                    g.id === pre
                                                        ? "selected"
                                                        : ""
                                                }
                                            >
                                                ${g.name}
                                            </option>
                                        `
                                    )
                                    .join("")
                                : `
                                    <option value="">
                                        No groups available
                                    </option>
                                `
                        }
                    </select>
                </label>

                <label>
                    Description

                    <input
                        id="desc"
                        type="text"
                        placeholder="Dinner"
                        required
                    >
                </label>

                <label>
                    Amount

                    <input
                        id="amount"
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="0.00"
                        required
                    >
                </label>

                <label>
                    Paid By

                    <select
                        id="paidBy"
                        required
                    ></select>
                </label>

                <label>
                    Category

                    <select id="category">

                        <option value="Food">
                            Food
                        </option>

                        <option value="Travel">
                            Travel
                        </option>

                        <option value="Shopping">
                            Shopping
                        </option>

                        <option value="Entertainment">
                            Entertainment
                        </option>

                        <option value="Rent">
                            Rent
                        </option>

                        <option value="Utilities">
                            Utilities
                        </option>

                        <option value="Other">
                            Other
                        </option>

                    </select>
                </label>

                <label>
                    Date

                    <input
                        id="date"
                        type="date"
                        required
                    >
                </label>

                <label>
                    Split Type

                    <select id="splitType">

                        <option value="equal">
                            Equal Split
                        </option>

                    </select>
                </label>

                <div class="member-select">

                    <label>
                        Split Between
                    </label>

                    <div
                        id="participantList"
                        class="participant-list"
                    ></div>

                </div>

                <div
                    id="splitPreview"
                    class="split-preview"
                ></div>

                <button
                    type="submit"
                    class="btn btn-primary"
                >
                    Save Expense
                </button>

            </form>

        </div>


        <div class="section">

            <div class="section-head">

                <h2>
                    All Your Group Expenses
                </h2>

            </div>

            <div class="table-wrap">

                <table class="table">

                    <thead>

                        <tr>
                            <th>Description</th>
                            <th>Group</th>
                            <th>Amount</th>
                            <th>Paid By</th>
                            <th>Split Between</th>
                            <th>Date</th>
                        </tr>

                    </thead>

                    <tbody id="expenseRows"></tbody>

                </table>

            </div>

        </div>
        `
    );


    const gid =
        document.getElementById("groupId");

    const paid =
        document.getElementById("paidBy");

    const participants =
        document.getElementById("participantList");

    const amountInput =
        document.getElementById("amount");

    const splitPreview =
        document.getElementById("splitPreview");


    function getGroupMembers() {

        const g = groups.find(
            x => x.id === gid.value
        );

        return g?.members || [];
    }


    function getMember(id) {

        return getUsers().find(
            x => x.id === id
        );
    }


    function fillPaidBy() {

        const members =
            getGroupMembers();

        paid.innerHTML =
            members
                .map(id => {

                    const member =
                        getMember(id);

                    return `
                        <option value="${id}">
                            ${member?.name || id}
                        </option>
                    `;

                })
                .join("");

    }


    function fillParticipants() {

        const members =
            getGroupMembers();

        participants.innerHTML =
            members
                .map((id, index) => {

                    const member =
                        getMember(id);

                    const checked =
                        id === u.id || index === 0
                            ? "checked"
                            : "";

                    return `
                        <label class="participant-item">

                            <input
                                type="checkbox"
                                value="${id}"
                                ${checked}
                            >

                            <span>
                                ${member?.name || id}
                            </span>

                        </label>
                    `;

                })
                .join("");

        participants
            .querySelectorAll(
                'input[type="checkbox"]'
            )
            .forEach(input => {

                input.addEventListener(
                    "change",
                    updateSplitPreview
                );

            });

        updateSplitPreview();
    }


    function getSelectedParticipants() {

        return [
            ...participants.querySelectorAll(
                'input[type="checkbox"]:checked'
            )
        ].map(
            input => input.value
        );

    }


    function updateSplitPreview() {

        const selected =
            getSelectedParticipants();

        const amount =
            Number(amountInput.value);

        if (!selected.length) {

            splitPreview.innerHTML = `
                <span class="negative">
                    Select at least one member.
                </span>
            `;

            return;
        }

        if (!amount || amount <= 0) {

            splitPreview.innerHTML = `
                <span class="muted">
                    Enter an amount to see each person's share.
                </span>
            `;

            return;
        }

        const share =
            amount / selected.length;

        const users =
            selected
                .map(id => getMember(id))
                .filter(Boolean);

        splitPreview.innerHTML = `
            <div class="split-preview-title">
                Each person pays
            </div>

            <div class="split-preview-amount">
                ${money(share)}
            </div>

            <div class="split-preview-members">
                ${
                    users
                        .map(
                            member => `
                                <span class="pill">
                                    ${member.name}
                                </span>
                            `
                        )
                        .join("")
                }
            </div>
        `;
    }


    function render() {

        const es =
            getExpenses()
                .filter(
                    e =>
                        groups.some(
                            g =>
                                g.id === e.groupId
                        )
                )
                .sort(
                    (a, b) =>
                        new Date(b.date) -
                        new Date(a.date)
                );

        document.getElementById(
            "expenseRows"
        ).innerHTML =
            es
                .map(e => {

                    const group =
                        groups.find(
                            g =>
                                g.id === e.groupId
                        );

                    const payer =
                        getMember(e.paidBy);

                    const names =
                        (e.participants || [])
                            .map(
                                id =>
                                    getMember(id)?.name ||
                                    id
                            );

                    return `
                        <tr>

                            <td>
                                ${e.description}
                            </td>

                            <td>
                                ${group?.name || "-"}
                            </td>

                            <td>
                                ${money(e.amount)}
                            </td>

                            <td>
                                ${payer?.name || "-"}
                            </td>

                            <td>
                                ${
                                    names.length
                                        ? names.join(", ")
                                        : "-"
                                }
                            </td>

                            <td>
                                ${e.date}
                            </td>

                        </tr>
                    `;

                })
                .join("")
            ||
            `
                <tr>

                    <td
                        colspan="6"
                        class="empty"
                    >
                        No expenses yet.
                    </td>

                </tr>
            `;
    }


    gid.onchange = () => {

        fillPaidBy();
        fillParticipants();

    };


    amountInput.addEventListener(
        "input",
        updateSplitPreview
    );


    fillPaidBy();
    fillParticipants();

    document.getElementById(
        "date"
    ).value =
        new Date()
            .toISOString()
            .slice(0, 10);


    document.getElementById(
        "expenseForm"
    ).onsubmit = e => {

        e.preventDefault();

        const g =
            groups.find(
                x => x.id === gid.value
            );

        if (!g) {

            toast("Please select a group.");

            return;
        }

        const selectedParticipants =
            getSelectedParticipants();

        if (!selectedParticipants.length) {

            toast(
                "Select at least one member."
            );

            return;
        }

        const expenseAmount =
            Number(amountInput.value);

        if (
            !expenseAmount ||
            expenseAmount <= 0
        ) {

            toast(
                "Enter a valid amount."
            );

            return;
        }

        const description =
            document.getElementById(
                "desc"
            ).value.trim();

        if (!description) {

            toast(
                "Enter an expense description."
            );

            return;
        }

        const es =
            getExpenses();

        es.push({

            id: uid(),

            groupId: g.id,

            description: description,

            amount: expenseAmount,

            paidBy:
                document.getElementById(
                    "paidBy"
                ).value,

            participants:
                selectedParticipants,

            category:
                document.getElementById(
                    "category"
                ).value,

            splitType:
                document.getElementById(
                    "splitType"
                ).value,

            date:
                document.getElementById(
                    "date"
                ).value

        });

        saveExpenses(es);

        logActivity(
            "Added expense " +
            description
        );

        toast(
            "Expense added successfully"
        );

        render();

        e.target.reset();

        fillPaidBy();
        fillParticipants();

        document.getElementById(
            "date"
        ).value =
            new Date()
                .toISOString()
                .slice(0, 10);

    };


    render();
}   