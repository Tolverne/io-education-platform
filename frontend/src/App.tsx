import { useEffect, useMemo, useState } from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import type { AuthUser } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/data";
import "./App.css";
import StudentWorkbook from "./components/StudentWorkbook";

type Mode = "landing" | "teacher" | "student";

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
    revoked?: boolean | null;
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
        delete: (input: { id: string }) => Promise<ModelResult<ClassRecord>>;
    };
    StudentSlot: {
        list: (input?: object) => Promise<ListResult<StudentSlotRecord>>;
        create: (input: object) => Promise<ModelResult<StudentSlotRecord>>;
        delete: (input: { id: string }) => Promise<ModelResult<StudentSlotRecord>>;
    };
};

const STORAGE_KEY = "io_student_session";

function makeClassCode() {
    return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function makeStudentCode() {
    return Math.random().toString(36).slice(2, 10).toUpperCase();
}

function Landing({ setMode }: { setMode: (mode: Mode) => void }) {
    return (
        <main className="app-shell">
            <section className="hero">
                <h1>IO Education</h1>
                <p>Stylus-first digital workbooks for teachers and students.</p>

                <div className="actions">
                    <button onClick={() => setMode("teacher")}>I am a teacher</button>
                    <button className="secondary" onClick={() => setMode("student")}>
                        I am a student
                    </button>
                </div>
            </section>
        </main>
    );
}




function StudentAccess({
    onSuccess,
    goBack,
}: {
    onSuccess: () => void;
    goBack: () => void;
}) {
    const client = useMemo(
        () =>
            generateClient({
                authMode: "identityPool",
            }),
        []
    );

    const models = useMemo(
        () => client.models as unknown as ClientModels,
        [client]
    );

    const [classCode, setClassCode] = useState("");
    const [studentCode, setStudentCode] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    async function handleStudentEntry() {
        setErrorMessage(null);

        const normalisedClassCode = classCode.trim().toUpperCase();
        const normalisedStudentCode = studentCode.trim().toUpperCase();

        if (!normalisedClassCode || !normalisedStudentCode) {
            setErrorMessage("Please enter both the class code and student code.");
            return;
        }

        setIsSubmitting(true);

        try {
            const classResult = await models.Class.list({
                authMode: "identityPool",
                filter: {
                    classCode: {
                        eq: normalisedClassCode,
                    },
                },
            });

            const foundClass = (classResult.data ?? [])[0];

            if (!foundClass) {
                setErrorMessage("Invalid class code.");
                return;
            }

            const slotResult = await models.StudentSlot.list({
                authMode: "identityPool",
                filter: {
                    classId: {
                        eq: foundClass.id,
                    },
                },
            });

            const foundSlot = (slotResult.data ?? []).find(
                (slot) =>
                    slot.studentCode === normalisedStudentCode &&
                    (slot as { revoked?: boolean | null }).revoked !== true
            );

            if (!foundSlot) {
                setErrorMessage("Invalid student code.");
                return;
            }

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    classId: foundClass.id,
                    studentSlotId: foundSlot.id,
                    classCode: normalisedClassCode,
                    studentCode: normalisedStudentCode,
                })
            );

            onSuccess();
        } catch (error) {
            console.error("Student entry failed:", error);
            setErrorMessage("Could not access student workspace.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="app-shell">
            <section className="hero">
                <div className="card wide-card">
                    <h1>Student access</h1>
                    <p>Enter the class code and student code given by your teacher.</p>

                    <div className="form-grid">
                        <input
                            value={classCode}
                            onChange={(event) => setClassCode(event.target.value)}
                            placeholder="Class code"
                            autoCapitalize="characters"
                        />

                        <input
                            value={studentCode}
                            onChange={(event) => setStudentCode(event.target.value)}
                            placeholder="Student code"
                            autoCapitalize="characters"
                        />

                        <button onClick={handleStudentEntry} disabled={isSubmitting}>
                            {isSubmitting ? "Checking..." : "Enter"}
                        </button>

                        <button className="secondary" onClick={goBack}>
                            Back
                        </button>
                    </div>

                    {errorMessage && <p className="error-text">{errorMessage}</p>}
                </div>
            </section>
        </main>
    );
}

function StudentDashboard({ logout }: { logout: () => void }) {
    const [openWorkbook, setOpenWorkbook] = useState(false);

    const session = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "{}"
    ) as {
        classId?: string;
        studentSlotId?: string;
        classCode?: string;
        studentCode?: string;
    };

    if (openWorkbook) {
        return (
            <StudentWorkbook
                classId={session.classId ?? ""}
                studentSlotId={session.studentSlotId ?? ""}
                classCode={session.classCode ?? ""}
                studentCode={session.studentCode ?? ""}
            />
        );
    }

    return (
        <main className="app-shell">
            <section className="hero">
                <div className="card wide-card">
                    <h1>Student workspace</h1>

                    <p>Class code: {session.classCode}</p>
                    <p>Student code: {session.studentCode}</p>

                    <div className="actions">
                        <button onClick={() => setOpenWorkbook(true)}>
                            Open workbook
                        </button>

                        <button onClick={logout}>
                            Leave student workspace
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
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
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const email = useMemo(
        () => user?.signInDetails?.loginId ?? user?.username ?? "",
        [user]
    );

    async function loadClasses() {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const result = await models.Class.list({});
            setClasses(result.data ?? []);
        } catch (error) {
            console.error("Failed to load classes:", error);
            setErrorMessage("Could not load classes.");
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

        const newClass = await models.Class.create({
            name: className.trim(),
            subject,
            yearLevel,
            studentLimit: 30,
            classCode: makeClassCode(),
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
                            onChange={(event) => setClassName(event.target.value)}
                            placeholder="Class name, e.g. AA SL Period 3"
                        />

                        <input
                            value={subject}
                            onChange={(event) => setSubject(event.target.value)}
                            placeholder="Subject"
                        />

                        <input
                            value={yearLevel}
                            onChange={(event) => setYearLevel(event.target.value)}
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
    const [mode, setMode] = useState<Mode>("landing");
    const [studentActive, setStudentActive] = useState(false);

    useEffect(() => {
        if (localStorage.getItem(STORAGE_KEY)) {
            setMode("student");
            setStudentActive(true);
        }
    }, []);

    if (mode === "landing") {
        return <Landing setMode={setMode} />;
    }

    if (mode === "teacher") {
        return (
            <Authenticator>
                {({ signOut, user }) => (
                    <TeacherDashboard signOut={signOut} user={user} />
                )}
            </Authenticator>
        );
    }

    if (mode === "student") {
        if (!studentActive) {
            return (
                <StudentAccess
                    onSuccess={() => setStudentActive(true)}
                    goBack={() => setMode("landing")}
                />
            );
        }

        return (
            <StudentDashboard
                logout={() => {
                    localStorage.removeItem(STORAGE_KEY);
                    setStudentActive(false);
                    setMode("landing");
                }}
            />
        );
    }

    return null;
}