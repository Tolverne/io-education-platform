import GridspaceCanvas from "./GridspaceCanvas";

type StudentWorkbookProps = {
    classCode: string;
    studentCode: string;
};

export default function StudentWorkbook({
    classCode,
    studentCode,
}: StudentWorkbookProps) {
    const canvasKey = `gridspace-${classCode}-${studentCode}-chapter1-q1`;

    return (
        <main className="app-shell">
            <section className="hero">
                <div className="card wide-card">
                    <h1>Chapter 1 — Functions</h1>

                    <p>
                        Sketch the graph of:
                    </p>

                    <p>
                        <strong>f(x) = x² − 4x + 3</strong>
                    </p>

                    <p>
                        Show all working and annotate key features.
                    </p>

                    <GridspaceCanvas
                        storageKey={canvasKey}
                        height="500px"
                    />
                </div>
            </section>
        </main>
    );
}