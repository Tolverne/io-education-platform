import { useMemo } from "react";
import GridspaceCanvas from "./GridspaceCanvas";
import chapterTex from "../content/module1-sample.tex?raw";
import {
    parseLatexChapter,
    type ParsedWorkbookBlock,
} from "../lib/latexWorkbookParser";
import LatexBlockRenderer from "./LatexBlockRenderer";

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