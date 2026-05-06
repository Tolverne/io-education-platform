import { useEffect, useMemo, useState } from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import type { AuthUser } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/data";
import "./App.css";

type TeacherDashboardProps = {
    signOut?: () => void;
    user?: AuthUser;
};

type ClassRecord = {
    id: string;
    name?: string | null;
    subject?: string | null;
    yearLevel?: string | null;
    classCode?: string | null;
};

type StudentSlotRecord = {
    id: string;
    classId?: string | null;
    studentCode?: string | null;
    label?: string | null;
};

type ModelResult<T> = {
    data?: T | null;
};

type ListResult<T> = {
    data?: T[];
};

type ClientModels = {
    Class: {
        list: (input?: object) => Promise<ListResult<ClassRecord>>;
        create: (input: object) => Promise<ModelResult<ClassRecord>>;
    };
    StudentSlot: {
        list: (input?: object) => Promise<ListResult<StudentSlotRecord>>;
        create: (input: object) => Promise<ModelResult<StudentSlotRecord>>;
    };
};



function makeClassCode() {
    return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function makeStudentCode() {
    return Math.random().toString(36).slice(2, 10).toUpperCase();
}

function TeacherDashboard({ signOut, user }: TeacherDashboardProps) {
    const client = useMemo(() => generateClient(), []);
    const models = useMemo(
        () => client.models as unknown as ClientModels,
        [client]
    );

    const [classes, setClasses] = useState<ClassRecord[]>([]);
    const [studentSlots, setStudentSlots] = useState<StudentSlotRecord[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

    const [className, setClassName] = useState("");
    const [subject, setSubject] = useState("IB Mathematics AA");
    const [yearLevel, setYearLevel] = useState("Year 11");
    const [isLoading, setIsLoading] = useState(false);

    const email = useMemo(
        () => user?.signInDetails?.loginId ?? user?.username ?? "",
        [user]
    );

    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    async function loadClasses() {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const result = await models.Class.list({});
            setClasses(result.data ?? []);
        } catch (error) {
            console.error("Failed to load classes:", error);
            setErrorMessage("Could not load classes. Check browser console.");
        } finally {
            setIsLoading(false);
        }
    }

    async function loadStudentSlots(classId: string) {
        setSelectedClassId(classId);

        const result = await models.StudentSlot.list({
            filter: {
                classId: {
                    eq: classId,
                },
            },
        });

        setStudentSlots(result.data ?? []);
    }

    async function createClass() {
        if (!className.trim()) return;

        const classCode = makeClassCode();

        const newClass = await models.Class.create({
            name: className.trim(),
            subject,
            yearLevel,
            studentLimit: 30,
            classCode,
            createdAtIso: new Date().toISOString(),
        });

        const classId = newClass.data?.id;

        if (classId) {
            for (let i = 0; i < 30; i++) {
                await models.StudentSlot.create({
                    classId,
                    studentCode: makeStudentCode(),
                    label: `Student ${i + 1}`,
                    revoked: false,
                    createdAtIso: new Date().toISOString(),
                });
            }
        }

        setClassName("");
        await loadClasses();
    }

    useEffect(() => {
        void loadClasses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                    {errorMessage && <p className="error-text">{errorMessage}</p>}
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

                                    <div className="row-actions">
                                        <code>{klass.classCode}</code>
                                        <button onClick={() => loadStudentSlots(klass.id)}>
                                            View students
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {selectedClassId && (
                    <div className="card wide-card">
                        <h2>Anonymous student slots</h2>
                        <p>
                            These are anonymous IDs. Do not store student names or emails
                            online.
                        </p>

                        <div className="student-grid">
                            {studentSlots.map((slot) => (
                                <div className="student-card" key={slot.id}>
                                    <strong>{slot.label}</strong>
                                    <p>Student code</p>
                                    <code>{slot.studentCode}</code>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
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