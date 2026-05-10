export type ParsedLatexBlock = {
    type: "latex";
    id: string;
    content: string;
};

export type ParsedGridspaceBlock = {
    type: "gridspace";
    id: string;
    gridspaceId: string;
    heightCm: number;
};

export type ParsedWorkbookBlock = ParsedLatexBlock | ParsedGridspaceBlock;

export type ParsedWorkbookChapter = {
    workbookVersionId: string;
    chapterId: string;
    title: string;
    blocks: ParsedWorkbookBlock[];
};

type ParseLatexChapterOptions = {
    workbookVersionId: string;
    chapterId: string;
    fallbackTitle: string;
};

function slugify(value: string): string {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function extractChapterTitle(tex: string, fallbackTitle: string): string {
    const match = tex.match(/\\chapter\{([^}]*)\}/);

    if (!match?.[1]) {
        return fallbackTitle;
    }

    return match[1].trim();
}

function parseHeightCm(value: string | undefined): number {
    if (!value) return 7;

    const match = value.match(/([\d.]+)\s*cm/i);

    if (!match?.[1]) return 7;

    const parsed = Number(match[1]);

    return Number.isFinite(parsed) && parsed > 0 ? parsed : 7;
}

/**
 * Parses custom \gridspace commands out of a LaTeX file.
 *
 * Supported:
 *   \gridspace
 *   \gridspace[7cm]
 *   \gridspace[7cm]{my-gridspace-id}
 *
 * Everything between gridspaces remains as a LaTeX block.
 */
export function parseLatexChapter(
    tex: string,
    options: ParseLatexChapterOptions
): ParsedWorkbookChapter {
    const blocks: ParsedWorkbookBlock[] = [];

    const gridspaceRegex =
        /\\gridspace(?:\[([^\]]+)\])?(?:\{([^}]*)\})?/g;

    let cursor = 0;
    let latexBlockCount = 1;
    let gridspaceCount = 1;

    for (const match of tex.matchAll(gridspaceRegex)) {
        const matchIndex = match.index ?? 0;

        const latexBefore = tex.slice(cursor, matchIndex).trim();

        if (latexBefore.length > 0) {
            blocks.push({
                type: "latex",
                id: `latex-${String(latexBlockCount).padStart(3, "0")}`,
                content: latexBefore,
            });

            latexBlockCount += 1;
        }

        const heightCm = parseHeightCm(match[1]);
        const explicitGridspaceId = match[2]?.trim();

        const gridspaceId =
            explicitGridspaceId && explicitGridspaceId.length > 0
                ? explicitGridspaceId
                : `${options.chapterId}-gridspace-${String(gridspaceCount).padStart(
                    3,
                    "0"
                )}`;

        blocks.push({
            type: "gridspace",
            id: `gridspace-${String(gridspaceCount).padStart(3, "0")}`,
            gridspaceId: slugify(gridspaceId),
            heightCm,
        });

        gridspaceCount += 1;
        cursor = matchIndex + match[0].length;
    }

    const latexAfter = tex.slice(cursor).trim();

    if (latexAfter.length > 0) {
        blocks.push({
            type: "latex",
            id: `latex-${String(latexBlockCount).padStart(3, "0")}`,
            content: latexAfter,
        });
    }

    return {
        workbookVersionId: options.workbookVersionId,
        chapterId: options.chapterId,
        title: extractChapterTitle(tex, options.fallbackTitle),
        blocks,
    };
}