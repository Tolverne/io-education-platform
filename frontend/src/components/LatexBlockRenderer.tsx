import katex from "katex";

type LatexBlockRendererProps = {
    content: string;
};

type BoxKind =
    | "syllabusbox"
    | "skillbox"
    | "examtipbox"
    | "notebox"
    | "practicebox"
    | "examquestion"
    | "workedexam";

function escapeHtml(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}

function renderMathToHtml(math: string, displayMode: boolean): string {
    try {
        return katex.renderToString(math, {
            throwOnError: false,
            displayMode,
            strict: false,
        });
    } catch {
        return `<code>${escapeHtml(math)}</code>`;
    }
}

function renderInlineLatex(value: string): string {
    let output = escapeHtml(value);

    output = output.replace(
        /\\keyword\{([^}]*)\}/g,
        "<strong>$1</strong>"
    );

    output = output.replace(/\$([^$]+)\$/g, (_match, math: string) => {
        return renderMathToHtml(math, false);
    });

    output = output.replace(/``([^`]*)''/g, "&ldquo;$1&rdquo;");

    return output;
}

function extractOptionalTitle(line: string): string | null {
    const titleMatch = line.match(/\[title=([^\]]+)\]/);
    if (titleMatch?.[1]) return titleMatch[1].trim();

    const simpleMatch = line.match(/\[([^\]]+)\]/);
    if (simpleMatch?.[1]) return simpleMatch[1].trim();

    return null;
}

function boxLabel(kind: BoxKind, explicitTitle: string | null): string {
    if (explicitTitle) return explicitTitle;

    switch (kind) {
        case "syllabusbox":
            return "Syllabus";
        case "skillbox":
            return "Skill";
        case "examtipbox":
            return "Exam tip";
        case "notebox":
            return "Note";
        case "practicebox":
            return "Practice";
        case "examquestion":
            return "Exam question";
        case "workedexam":
            return "Worked example";
        default:
            return "";
    }
}

function isBoxKind(value: string): value is BoxKind {
    return [
        "syllabusbox",
        "skillbox",
        "examtipbox",
        "notebox",
        "practicebox",
        "examquestion",
        "workedexam",
    ].includes(value);
}

function renderParagraph(lines: string[], key: string) {
    const text = lines.join(" ").trim();

    if (!text) return null;

    return (
        <p
            key={key}
            className="latex-renderer-paragraph"
            dangerouslySetInnerHTML={{ __html: renderInlineLatex(text) }}
        />
    );
}

function renderDisplayMath(lines: string[], key: string) {
    const math = lines.join("\n").trim();

    return (
        <div
            key={key}
            className="latex-renderer-display-math"
            dangerouslySetInnerHTML={{ __html: renderMathToHtml(math, true) }}
        />
    );
}

function renderEnumerate(lines: string[], key: string) {
    const items: string[] = [];
    let currentItem: string[] = [];

    for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith("\\item")) {
            if (currentItem.length > 0) {
                items.push(currentItem.join(" ").trim());
            }

            currentItem = [trimmed.replace(/^\\item\s*/, "")];
        } else if (trimmed.length > 0) {
            currentItem.push(trimmed);
        }
    }

    if (currentItem.length > 0) {
        items.push(currentItem.join(" ").trim());
    }

    return (
        <ol key={key} className="latex-renderer-list">
            {items.map((item, index) => (
                <li
                    key={`${key}-item-${index}`}
                    dangerouslySetInnerHTML={{ __html: renderInlineLatex(item) }}
                />
            ))}
        </ol>
    );
}

function renderSolution(lines: string[], key: string) {
    return (
        <div key={key} className="latex-renderer-solution">
            <div className="latex-renderer-box-title">Solution</div>
            <LatexBlockRenderer content={lines.join("\n")} />
        </div>
    );
}

function renderBox(
    kind: BoxKind,
    openingLine: string,
    innerLines: string[],
    key: string
) {
    const title = boxLabel(kind, extractOptionalTitle(openingLine));

    return (
        <div key={key} className={`latex-renderer-box ${kind}`}>
            <div className="latex-renderer-box-title">{title}</div>
            <LatexBlockRenderer content={innerLines.join("\n")} />
        </div>
    );
}

function findMatchingEnd(
    lines: string[],
    startIndex: number,
    environmentName: string
): number {
    let depth = 0;

    for (let i = startIndex; i < lines.length; i++) {
        const trimmed = lines[i].trim();

        if (trimmed.startsWith(`\\begin{${environmentName}}`)) {
            depth += 1;
        }

        if (trimmed.startsWith(`\\end{${environmentName}}`)) {
            depth -= 1;

            if (depth === 0) {
                return i;
            }
        }
    }

    return -1;
}

function findSolutionEnd(lines: string[], startIndex: number): number {
    let depth = 0;

    for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i];

        for (const character of line) {
            if (character === "{") depth += 1;
            if (character === "}") {
                depth -= 1;

                if (depth === 0) {
                    return i;
                }
            }
        }
    }

    return -1;
}

export default function LatexBlockRenderer({ content }: LatexBlockRendererProps) {
    const lines = content.replaceAll("\r\n", "\n").split("\n");
    const elements: React.ReactNode[] = [];

    let paragraphBuffer: string[] = [];

    function flushParagraph() {
        if (paragraphBuffer.length === 0) return;

        const element = renderParagraph(
            paragraphBuffer,
            `paragraph-${elements.length}`
        );

        if (element) elements.push(element);

        paragraphBuffer = [];
    }

    let i = 0;

    while (i < lines.length) {
        const line = lines[i];
        const trimmed = line.trim();

        if (!trimmed) {
            flushParagraph();
            i += 1;
            continue;
        }

        const chapterMatch = trimmed.match(/^\\chapter\{([^}]*)\}/);
        if (chapterMatch?.[1]) {
            flushParagraph();
            elements.push(
                <h1 key={`chapter-${elements.length}`} className="latex-renderer-chapter">
                    {chapterMatch[1]}
                </h1>
            );
            i += 1;
            continue;
        }

        const sectionMatch = trimmed.match(/^\\section\{([^}]*)\}/);
        if (sectionMatch?.[1]) {
            flushParagraph();
            elements.push(
                <h2 key={`section-${elements.length}`} className="latex-renderer-section">
                    {sectionMatch[1]}
                </h2>
            );
            i += 1;
            continue;
        }

        const subsectionMatch = trimmed.match(/^\\subsection\{([^}]*)\}/);
        if (subsectionMatch?.[1]) {
            flushParagraph();
            elements.push(
                <h3
                    key={`subsection-${elements.length}`}
                    className="latex-renderer-subsection"
                >
                    {subsectionMatch[1]}
                </h3>
            );
            i += 1;
            continue;
        }

        if (trimmed === "\\[") {
            flushParagraph();

            const mathLines: string[] = [];
            i += 1;

            while (i < lines.length && lines[i].trim() !== "\\]") {
                mathLines.push(lines[i]);
                i += 1;
            }

            elements.push(
                renderDisplayMath(mathLines, `display-math-${elements.length}`)
            );

            i += 1;
            continue;
        }

        if (trimmed.startsWith("\\begin{enumerate}")) {
            flushParagraph();

            const endIndex = findMatchingEnd(lines, i, "enumerate");

            if (endIndex === -1) {
                paragraphBuffer.push(line);
                i += 1;
                continue;
            }

            const innerLines = lines.slice(i + 1, endIndex);
            elements.push(renderEnumerate(innerLines, `enumerate-${elements.length}`));

            i = endIndex + 1;
            continue;
        }

        const beginMatch = trimmed.match(/^\\begin\{([^}]*)\}/);
        if (beginMatch?.[1] && isBoxKind(beginMatch[1])) {
            flushParagraph();

            const kind = beginMatch[1];
            const endIndex = findMatchingEnd(lines, i, kind);

            if (endIndex === -1) {
                paragraphBuffer.push(line);
                i += 1;
                continue;
            }

            const innerLines = lines.slice(i + 1, endIndex);
            elements.push(
                renderBox(kind, trimmed, innerLines, `box-${kind}-${elements.length}`)
            );

            i = endIndex + 1;
            continue;
        }

        if (trimmed.startsWith("\\Solution{")) {
            flushParagraph();

            const endIndex = findSolutionEnd(lines, i);

            if (endIndex === -1) {
                paragraphBuffer.push(line);
                i += 1;
                continue;
            }

            const solutionLines = lines.slice(i, endIndex + 1);
            solutionLines[0] = solutionLines[0].replace(/^\\Solution\{/, "");

            const lastIndex = solutionLines.length - 1;
            solutionLines[lastIndex] = solutionLines[lastIndex].replace(/\}\s*$/, "");

            elements.push(
                renderSolution(solutionLines, `solution-${elements.length}`)
            );

            i = endIndex + 1;
            continue;
        }

        paragraphBuffer.push(line);
        i += 1;
    }

    flushParagraph();

    return <div className="latex-renderer">{elements}</div>;
}