const u = requireAuth();

if (u) {

    const params = new URLSearchParams(location.search);
    const gid = params.get("id");

    if (
        location.pathname.endsWith("group-details.html") &&
        gid
    ) {

        const allGroups = getGroups();

        const g = allGroups.find(
            x => x.id === gid
        );

        if (
            !g ||
            !g.members.includes(u.id)
        ) {

            location.href = "groups.html";

        } else {

            const es = getExpenses().filter(
                e => e.groupId === gid
            );

            const users = getUsers();

            layout(
                "groups",
                g.name,
                `
                <div class="section">

                    <div class="grid">

                        <div class="card">

                            <span class="stat-label">
                                Description
                            </span>

                            <h3>
                                ${g.description || "No description"}
                            </h3>

                            <p class="muted">
                                ${g.members.length} members · ${g.currency}
                            </p>

                        </div>

                        <div class="card">

                            <span class="stat-label">
                                Total Expenses
                            </span>

                            <div class="stat-value">
                                ${
                                    money(
                                        es.reduce(
                                            (a, e) =>
                                                a + Number(e.amount || 0),
                                            0
                                        )
                                    )
                                }
                            </div>

                        </div>

                    </div>

                </div>

                <div class="section">

                    <div class="section-head">

                        <h2>
                            Members
                        </h2>

                        <button
                            class="btn btn-primary btn-sm"
                            onclick="addMember()"
                        >
                            Add Member
                        </button>

                    </div>

                    <div class="table-wrap">

                        <table class="table">

                            <thead>

                                <tr>
                                    <th>Name</th>
                                    <th>Username</th>
                                </tr>

                            </thead>

                            <tbody>

                                ${
                                    g.members
                                        .map(id => {

                                            const x =
                                                users.find(
                                                    a =>
                                                        a.id === id
                                                );

                                            return `
                                                <tr>

                                                    <td>
                                                        ${
                                                            x?.name ||
                                                            "Unknown"
                                                        }
                                                    </td>

                                                    <td>
                                                        ${
                                                            x?.username ||
                                                            "-"
                                                        }
                                                    </td>

                                                </tr>
                                            `;

                                        })
                                        .join("")
                                }

                            </tbody>

                        </table>

                    </div>

                </div>

                <div class="section">

                    <div class="section-head">

                        <h2>
                            Expenses
                        </h2>

                        <a
                            class="btn btn-primary btn-sm"
                            href="expenses.html?group=${gid}"
                        >
                            Add Expense
                        </a>

                    </div>

                    <div class="table-wrap">

                        <table class="table">

                            <thead>

                                <tr>
                                    <th>Description</th>
                                    <th>Amount</th>
                                    <th>Paid By</th>
                                    <th>Category</th>
                                </tr>

                            </thead>

                            <tbody>

                                ${
                                    es
                                        .map(e => {

                                            return `
                                                <tr>

                                                    <td>
                                                        ${e.description}
                                                    </td>

                                                    <td>
                                                        ${money(e.amount)}
                                                    </td>

                                                    <td>
                                                        ${
                                                            users.find(
                                                                x =>
                                                                    x.id ===
                                                                    e.paidBy
                                                            )?.name || "-"
                                                        }
                                                    </td>

                                                    <td>

                                                        <span class="pill">
                                                            ${e.category}
                                                        </span>

                                                    </td>

                                                </tr>
                                            `;

                                        })
                                        .join("")
                                    ||
                                    `
                                        <tr>

                                            <td
                                                colspan="4"
                                                class="empty"
                                            >
                                                No expenses.
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

            window.addMember = () => {

                const name =
                    prompt("Enter member name:");

                if (
                    !name ||
                    !name.trim()
                ) {
                    return;
                }

                const memberName =
                    name.trim();

                const allUsers =
                    getUsers();

                const groups =
                    getGroups();

                const group =
                    groups.find(
                        x => x.id === gid
                    );

                if (!group) {
                    return toast("Group not found.");
                }

                const existingMember =
                    allUsers.find(
                        x =>
                            x.name &&
                            x.name.toLowerCase() ===
                                memberName.toLowerCase()
                    );

                if (existingMember) {

                    if (
                        group.members.includes(
                            existingMember.id
                        )
                    ) {

                        return toast(
                            "Member already in group."
                        );

                    }

                    group.members.push(
                        existingMember.id
                    );

                } else {

                    const newMember = {

                        id: uid(),

                        name: memberName,

                        username:
                            "guest_" + uid(),

                        email: "",

                        password: "",

                        role: "member",

                        createdAt:
                            new Date().toISOString()

                    };

                    allUsers.push(
                        newMember
                    );

                    saveUsers(
                        allUsers
                    );

                    group.members.push(
                        newMember.id
                    );

                }

                saveGroups(
                    groups
                );

                logActivity(
                    "Added member " +
                    memberName +
                    " to " +
                    group.name
                );

                toast(
                    memberName +
                    " added to group"
                );

                location.reload();

            };

        }

    } else {

        layout(
            "groups",
            "Groups",
            `
            <div class="grid">

                <div class="form-card">

                    <h2>
                        Create Group
                    </h2>

                    <form id="groupForm">

                        <label>

                            Group Name

                            <input
                                id="gname"
                                required
                            >

                        </label>

                        <label>

                            Description

                            <textarea
                                id="gdesc"
                            ></textarea>

                        </label>

                        <label>

                            Currency

                            <select id="currency">

                                <option>
                                    INR
                                </option>

                                <option>
                                    USD
                                </option>

                                <option>
                                    EUR
                                </option>

                            </select>

                        </label>

                        <button
                            class="btn btn-primary"
                        >
                            Create Group
                        </button>

                    </form>

                </div>

                <div>

                    <h2>
                        Your Groups
                    </h2>

                    <div
                        id="groupList"
                    ></div>

                </div>

            </div>
            `
        );

        function render() {

            const gs =
                getGroups().filter(
                    g =>
                        g.members.includes(
                            u.id
                        )
                );

            document.getElementById(
                "groupList"
            ).innerHTML =

                gs
                    .map(g => {

                        return `
                            <a
                                class="card"
                                style="
                                    display:block;
                                    margin-bottom:12px
                                "
                                href="
                                    group-details.html?id=${g.id}
                                "
                            >

                                <span class="pill">
                                    ${g.members.length}
                                    members
                                </span>

                                <h3>
                                    ${g.name}
                                </h3>

                                <p class="muted">
                                    ${
                                        g.description ||
                                        "No description"
                                    }
                                </p>

                            </a>
                        `;

                    })
                    .join("")

                ||

                `
                    <div class="empty card">
                        No groups yet.
                    </div>
                `;
        }

        render();

        document.getElementById(
            "groupForm"
        ).onsubmit = e => {

            e.preventDefault();

            const g = {

                id: uid(),

                name:
                    document.getElementById(
                        "gname"
                    ).value.trim(),

                description:
                    document.getElementById(
                        "gdesc"
                    ).value.trim(),

                currency:
                    document.getElementById(
                        "currency"
                    ).value,

                createdBy:
                    u.id,

                members: [
                    u.id
                ],

                createdAt:
                    new Date().toISOString()

            };

            const gs =
                getGroups();

            gs.push(g);

            saveGroups(
                gs
            );

            logActivity(
                "Created group " +
                g.name
            );

            toast(
                "Group created"
            );

            render();

            e.target.reset();

        };

    }

}