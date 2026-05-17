import { generateClient } from "aws-amplify/data";
import { listGridspaceSnapshots } from "./gridspaceStorage";

type AmplifyError = {
    message?: string;
    errorType?: string;
    path?: unknown;
    locations?: unknown;
};

type SnapshotRecord = {
    id: string;
    snapshotKey?: string | null;
};

type SnapshotListResult = {
    data?: SnapshotRecord[];
    errors?: AmplifyError[] | null;
};

type SnapshotMutationResult = {
    data?: unknown;
    errors?: AmplifyError[] | null;
};

type SnapshotModelClient = {
    models: {
        StudentGridspaceSnapshot?: {
            list: (
                input?: object,
                options?: { authMode?: "apiKey" }
            ) => Promise<SnapshotListResult>;

            create: (
                input: object,
                options?: { authMode?: "apiKey" }
            ) => Promise<SnapshotMutationResult>;

            update: (
                input: object,
                options?: { authMode?: "apiKey" }
            ) => Promise<SnapshotMutationResult>;
        };
    };
};

export type SyncStudentSnapshotsParams = {
    classId: string;
    studentSlotId: string;
};

export type SyncStudentSnapshotsResult = {
    attempted: number;
    uploaded: number;
    skipped: number;
    failed: number;
};

function formatAmplifyErrors(errors: AmplifyError[] | null | undefined): string {
    if (!errors || errors.length === 0) return "Unknown Amplify error.";

    return errors
        .map((error) => {
            return [
                error.message ? `message=${error.message}` : null,
                error.errorType ? `errorType=${error.errorType}` : null,
                error.path ? `path=${JSON.stringify(error.path)}` : null,
            ]
                .filter(Boolean)
                .join(" | ");
        })
        .join("\n");
}

function logAmplifyErrors(label: string, errors: AmplifyError[] | null | undefined) {
    console.error(label, formatAmplifyErrors(errors));
    console.error(`${label} raw`, JSON.stringify(errors, null, 2));
}

function parseStorageKey(storageKey: string): {
    studentSlotId: string;
    workbookVersionId: string;
    chapterId: string;
    gridspaceId: string;
} | null {
    const parts = storageKey.split("|");

    if (parts.length !== 4) {
        return null;
    }

    const [studentSlotId, workbookVersionId, chapterId, gridspaceId] = parts;

    if (!studentSlotId || !workbookVersionId || !chapterId || !gridspaceId) {
        return null;
    }

    return {
        studentSlotId,
        workbookVersionId,
        chapterId,
        gridspaceId,
    };
}

export async function syncStudentSnapshots({
    classId,
    studentSlotId,
}: SyncStudentSnapshotsParams): Promise<SyncStudentSnapshotsResult> {
    const client = generateClient({
        authMode: "apiKey",
    }) as unknown as SnapshotModelClient;

    const snapshotModel = client.models.StudentGridspaceSnapshot;

    if (!snapshotModel) {
        throw new Error(
            "StudentGridspaceSnapshot model is missing from the generated Amplify client. The backend schema or amplify_outputs.json is not up to date."
        );
    }

    const localSnapshots = await listGridspaceSnapshots();

    let uploaded = 0;
    let skipped = 0;
    let failed = 0;

    for (const snapshot of localSnapshots) {
        const parsed = parseStorageKey(snapshot.storageKey);

        if (!parsed) {
            console.warn("Skipping snapshot with invalid storage key:", snapshot.storageKey);
            skipped += 1;
            continue;
        }

        // Only sync snapshots for the current student slot.
        if (parsed.studentSlotId !== studentSlotId) {
            skipped += 1;
            continue;
        }

        const snapshotKey = [
            classId,
            studentSlotId,
            parsed.workbookVersionId,
            parsed.chapterId,
            parsed.gridspaceId,
        ].join("|");

        const payload = {
            snapshotKey,

            classId,
            studentSlotId,

            workbookVersionId: parsed.workbookVersionId,
            chapterId: parsed.chapterId,
            gridspaceId: parsed.gridspaceId,

            pathsJson: JSON.stringify(snapshot.paths),

            localUpdatedAtIso: snapshot.updatedAtIso,
            syncedAtIso: new Date().toISOString(),
        };

        try {
            const existingResult = await snapshotModel.list(
                {
                    filter: {
                        snapshotKey: {
                            eq: snapshotKey,
                        },
                    },
                },
                {
                    authMode: "apiKey",
                }
            );

            if (existingResult.errors && existingResult.errors.length > 0) {
                logAmplifyErrors("Snapshot lookup failed:", existingResult.errors);
                failed += 1;
                continue;
            }

            const existing = existingResult.data?.[0];

            const result = existing
                ? await snapshotModel.update(
                    {
                        id: existing.id,
                        ...payload,
                    },
                    {
                        authMode: "apiKey",
                    }
                )
                : await snapshotModel.create(
                    {
                        ...payload,
                    },
                    {
                        authMode: "apiKey",
                    }
                );

            if (result.errors && result.errors.length > 0) {
                logAmplifyErrors("Snapshot sync failed:", result.errors);
                failed += 1;
                continue;
            }

            uploaded += 1;
        } catch (error) {
            console.error("Snapshot sync threw an exception:", error);
            failed += 1;
        }
    }

    return {
        attempted: localSnapshots.length,
        uploaded,
        skipped,
        failed,
    };
}