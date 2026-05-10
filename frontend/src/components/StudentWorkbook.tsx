import GridspaceCanvas from "./GridspaceCanvas";
import { sampleChapter } from "../data/sampleChapter";
import type { WorkbookBlock } from "../data/sampleChapter";

type StudentWorkbookProps = {
    classId: string;
    studentSlotId: string;
    classCode: string;
    studentCode: string;
};

function heightFromCm(heightCm: number): string {
    return `${heightCm * 38}px`;
}

function makeGridspaceStorageKey(params: {
    studentSlotId: string;
    workbookVersionId: string;
    chapterId: string;
    gridspaceId: string;
}) {
    return [
        params.studentSlotId,
        params.workbookVersionId,
        params.chapterId,
        params.gridspaceId,
    ].join("|");
}

function LatexBlockView({ content }: { content: string }) {
    return (
        <div className="latex-block">
            <pre>{content.trim()}</pre>
        </div>
    );
}

function WorkbookBlockView({
    block,
    studentSlotId,
}: {
    block: WorkbookBlock;
    studentSlotId: string;
}) {
    if (block.type === "latex") {
        return <LatexBlockView content={block.content} />;
    }

    const storageKey = makeGridspaceStorageKey({
        studentSlotId,
        workbookVersionId: sampleChapter.workbookVersionId,
        chapterId: sampleChapter.chapterId,
        gridspaceId: block.gridspaceId,
    });

    return (
        <div className="workbook-gridspace">
            <div className="gridspace-header">
                <strong>Working space</strong>
                <code>{block.gridspaceId}</code>
            </div>

            <GridspaceCanvas
                storageKey={storageKey}
                height={heightFromCm(block.heightCm)}
            />
        </div>
    );
}

export default function StudentWorkbook({
    classId,
    studentSlotId,
    classCode,
    studentCode,
}: StudentWorkbookProps) {
    return (
        <main className="app-shell">
            <section className="hero">
                <div className="card wide-card">
                    <button
                        className="secondary"
                        onClick={() => {
                            window.location.reload();
                        }}
                    >
                        Back to student workspace
                    </button>

                    <h1>{sampleChapter.title}</h1>

                    <div className="student-session-summary">
                        <p>
                            Class code: <code>{classCode}</code>
                        </p>
                        <p>
                            Student code: <code>{studentCode}</code>
                        </p>
                        <p>
                            Class ID: <code>{classId}</code>
                        </p>
                        <p>
                            Student slot ID: <code>{studentSlotId}</code>
                        </p>
                    </div>

                    <div className="workbook-content">
                        {sampleChapter.blocks.map((block) => (
                            <WorkbookBlockView
                                key={block.id}
                                block={block}
                                studentSlotId={studentSlotId}
                            />
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}