import { useMemo, useState } from "react";
import GridspaceCanvas from "./GridspaceCanvas";
import chapterTex from "../content/module1-sample.tex?raw";
import {
    parseLatexChapter,
    type ParsedWorkbookBlock,
} from "../lib/latexWorkbookParser";
import LatexBlockRenderer from "./LatexBlockRenderer";
import { syncStudentSnapshots } from "../lib/syncStudentSnapshots";

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
            <LatexBlockRenderer content={content} />
        </div>
    );
}

function WorkbookBlockView({
    block,
    studentSlotId,
    workbookVersionId,
    chapterId,
}: {
    block: ParsedWorkbookBlock;
    studentSlotId: string;
    workbookVersionId: string;
    chapterId: string;
}) {
    if (block.type === "latex") {
        return <LatexBlockView content={block.content} />;
    }

    const storageKey = makeGridspaceStorageKey({
        studentSlotId,
        workbookVersionId,
        chapterId,
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
    const [syncStatus, setSyncStatus] = useState<
        "idle" | "syncing" | "success" | "error"
    >("idle");

    const [syncMessage, setSyncMessage] = useState<string | null>(null);

    const chapter = useMemo(
        () =>
            parseLatexChapter(chapterTex, {
                workbookVersionId: "ib-aa-sl-number-algebra-module-1-v1",
                chapterId: "number-algebra-module-1-sequences-logs",
                fallbackTitle:
                    "Number and Algebra Module 1: Sequences, Logarithms and Algebraic Reasoning",
            }),
        []
    );

    async function handleSyncWork() {
        setSyncStatus("syncing");
        setSyncMessage("Syncing local work...");

        try {
            const result = await syncStudentSnapshots({
                classId,
                studentSlotId,
            });

            if (result.failed > 0) {
                setSyncStatus("error");
                setSyncMessage(
                    `Sync finished with errors. Uploaded ${result.uploaded}, failed ${result.failed}, skipped ${result.skipped}.`
                );
                return;
            }

            setSyncStatus("success");
            setSyncMessage(
                `Synced ${result.uploaded} gridspace snapshot${result.uploaded === 1 ? "" : "s"
                }. Skipped ${result.skipped}.`
            );
        } catch (error) {
            console.error("Sync failed:", error);
            setSyncStatus("error");
            setSyncMessage("Sync failed. Check the console for details.");
        }
    }

    return (
        <main className="app-shell">
            <section className="hero">
                <div className="card wide-card">
                    <div className="student-workbook-actions">
                        <button
                            className="secondary"
                            onClick={() => {
                                window.location.reload();
                            }}
                        >
                            Back to student workspace
                        </button>

                        <button
                            onClick={() => {
                                void handleSyncWork();
                            }}
                            disabled={syncStatus === "syncing"}
                        >
                            {syncStatus === "syncing" ? "Syncing..." : "Sync local work"}
                        </button>
                    </div>

                    {syncMessage && (
                        <p
                            className={
                                syncStatus === "error"
                                    ? "sync-message sync-message-error"
                                    : "sync-message"
                            }
                        >
                            {syncMessage}
                        </p>
                    )}

                    <h1>{chapter.title}</h1>

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
                        {chapter.blocks.map((block) => (
                            <WorkbookBlockView
                                key={block.id}
                                block={block}
                                studentSlotId={studentSlotId}
                                workbookVersionId={chapter.workbookVersionId}
                                chapterId={chapter.chapterId}
                            />
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}