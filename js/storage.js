const KEYS = {
    users: "splitease_users",
    groups: "splitease_groups",
    expenses: "splitease_expenses",
    settlements: "splitease_settlements",
    currentUser: "splitease_currentUser",
    logs: "splitease_activityLogs"
};

const read = (k, d = []) => {
    try {
        return JSON.parse(localStorage.getItem(k)) ?? d;
    } catch {
        return d;
    }
};

const write = (k, v) => {
    localStorage.setItem(k, JSON.stringify(v));
};

const uid = () =>
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8);

function getUsers() {
    return read(KEYS.users);
}

function saveUsers(v) {
    write(KEYS.users, v);
}

function getGroups() {
    return read(KEYS.groups);
}

function saveGroups(v) {
    write(KEYS.groups, v);
}

function getExpenses() {
    return read(KEYS.expenses);
}

function saveExpenses(v) {
    write(KEYS.expenses, v);
}

function getSettlements() {
    return read(KEYS.settlements);
}

function saveSettlements(v) {
    write(KEYS.settlements, v);
}

function currentUser() {
    const id = localStorage.getItem(KEYS.currentUser);
    return getUsers().find(u => u.id === id);
}

function setCurrentUser(id) {
    localStorage.setItem(KEYS.currentUser, id);
}

function logout() {
    localStorage.removeItem(KEYS.currentUser);
    location.href = "login.html";
}

function logActivity(action) {
    const logs = read(KEYS.logs);

    logs.unshift({
        id: uid(),
        action,
        time: new Date().toISOString(),
        user: currentUser()?.username || "system"
    });

    write(KEYS.logs, logs.slice(0, 100));
}

function seed() {
    let users = getUsers();

    if (!users.some(u => u.username === "admin")) {
        users.push({
            id: "admin",
            name: "Administrator",
            username: "admin",
            email: "admin@splitease.local",
            password: "admin123",
            role: "admin",
            createdAt: new Date().toISOString()
        });
    }

    if (!users.some(u => u.username === "rahul")) {
        users.push({
            id: "demo1",
            name: "Rahul Sharma",
            username: "rahul",
            email: "rahul@example.com",
            password: "rahul123",
            role: "user",
            createdAt: new Date().toISOString()
        });
    }

    saveUsers(users);

    if (!getGroups().length) {
        const now = new Date().toISOString();

        saveGroups([
            {
                id: "g1",
                name: "Weekend Trip",
                description: "Friends weekend trip",
                currency: "INR",
                createdBy: "demo1",
                members: ["demo1", "admin"],
                createdAt: now
            },
            {
                id: "g2",
                name: "College Dinner",
                description: "Friday dinner",
                currency: "INR",
                createdBy: "demo1",
                members: ["demo1", "admin"],
                createdAt: now
            }
        ]);

        saveExpenses([
            {
                id: "e1",
                groupId: "g1",
                description: "Dinner",
                amount: 2000,
                paidBy: "demo1",
                participants: ["demo1", "admin"],
                category: "Food",
                splitType: "equal",
                date: now
            },
            {
                id: "e2",
                groupId: "g2",
                description: "Cab",
                amount: 600,
                paidBy: "admin",
                participants: ["demo1", "admin"],
                category: "Travel",
                splitType: "equal",
                date: now
            }
        ]);

        saveSettlements([]);
    }
}

seed();

function requireAuth(admin = false) {
    const u = currentUser();

    if (!u) {
        location.href = "login.html";
        return null;
    }

    if (admin && u.role !== "admin") {
        location.href = "dashboard.html";
        return null;
    }

    return u;
}

function layout(active, title, content) {
    const u = currentUser();

    document.getElementById("app").innerHTML = `
        <div class="layout">
            <aside class="sidebar">
                <a class="brand" href="dashboard.html">
                    SPLIT<span>EASE</span>
                </a>

                <nav class="nav">
                    <a
                        class="${active === "dashboard" ? "active" : ""}"
                        href="dashboard.html"
                    >
                        Dashboard
                    </a>

                    <a
                        class="${active === "groups" ? "active" : ""}"
                        href="groups.html"
                    >
                        Groups
                    </a>

                    <a
                        class="${active === "expenses" ? "active" : ""}"
                        href="expenses.html"
                    >
                        Expenses
                    </a>

                    <a
                        class="${active === "settlements" ? "active" : ""}"
                        href="settlements.html"
                    >
                        Settlements
                    </a>

                    <a
                        class="${active === "profile" ? "active" : ""}"
                        href="profile.html"
                    >
                        Profile
                    </a>

                    ${
                        u?.role === "admin"
                            ? `
                                <a
                                    class="${
                                        active === "admin"
                                            ? "active"
                                            : ""
                                    }"
                                    href="admin.html"
                                >
                                    Admin Panel
                                </a>
                            `
                            : ""
                    }

                    <a
                        href="#"
                        onclick="logout(); return false"
                    >
                        Logout
                    </a>
                </nav>
            </aside>

            <main class="main">
                <div class="topbar">
                    <h1>${title}</h1>

                    <div class="user-chip">
                        <div class="avatar">
                            ${(u?.name || "U")[0]}
                        </div>

                        ${u?.name || ""}
                    </div>
                </div>

                ${content}
            </main>
        </div>
    `;
}

function toast(msg) {
    const e = document.createElement("div");

    e.className = "toast";
    e.textContent = msg;

    document.body.appendChild(e);

    setTimeout(() => e.remove(), 2500);
}

function money(n) {
    return (
        "₹" +
        Number(n || 0).toLocaleString("en-IN", {
            maximumFractionDigits: 2
        })
    );
}