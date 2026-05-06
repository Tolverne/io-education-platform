import { useEffect, useMemo, useState } from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import "./App.css";

const client = generateClient<any>();

function makeClassCode() {
    return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function TeacherDashboard({ signOut, user }: any) {
    const [classes, setClasses] = useState<any[]>([]);
    const [className, setClassName] = useState("");
    const [subject, setSubject] = useState("IB Mathematics AA");
    const [yearLevel, setYearLevel] = useState("Year 11");
    const [isLoading, setIsLoading] = useState(false);

    const email = useMemo(
        () => user?.signInDetails?.loginId ?? user?.username ?? "",
        [user]
    );

    async function loadClasses() {
        setIsLoading(true);
        const result = await client.models.Class.list({});
        setClasses(result.data);
        setIsLoading(false);
    }

    async function createClass() {
        if (!className.trim()) return;

        await client.models.Class.create({
            name: className.trim(),
            subject,
            yearLevel,
            studentLimit: 30,
            classCode: makeClassCode(),
            createdAtIso: new Date().toISOString(),
        });

        setClassName("");
        await loadClasses();
    }

    useEffect(() => {
        loadClasses();
    }, []);

    return (
        <main className="app-shell">
            <section className="hero">
                <h1>IO Education</h1>
                <p>Teacher dashboard</p>

                <div className="card">
                    <h2>Signed in</h2>
                    <p>{email}</p>
                    <button onClick={signOut}>Sign out</button>
                </div>

                <div className="card wide-card">
                    <h2>Create a class</h2>

                    <div className="form-grid">
                        <input
                            value={className}
                            onChange={(e) => setClassName(e.target.value)}
                            placeholder="Class name, e.g. AA SL Period 3"
                        />

                        <input
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Subject"
                        />

                        <input
                            value={yearLevel}
                            onChange={(e) => setYearLevel(e.target.value)}
                            placeholder="Year level"
                        />

                        <button onClick={createClass}>Create class</button>
                    </div>
                </div>

                <div className="card wide-card">
                    <h2>Your classes</h2>

                    {isLoading ? (
                        <p>Loading...</p>
                    ) : classes.length === 0 ? (
                        <p>No classes yet.</p>
                    ) : (
                        <div className="class-list">
                            {classes.map((klass) => (
                                <div className="class-row" key={klass.id}>
                                    <div>
                                        <strong>{klass.name}</strong>
                                        <p>
                                            {klass.subject} · {klass.yearLevel}
                                        </p>
                                    </div>
                                    <code>{klass.classCode}</code>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}

export default function App() {
    return (
        <Authenticator>
            {({ signOut, user }) => (
                <TeacherDashboard signOut={signOut} user={user} />
            )}
        </Authenticator>
    );
}