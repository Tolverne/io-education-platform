import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
    TeacherProfile: a
        .model({
            email: a.email().required(),
            displayName: a.string(),
            createdAtIso: a.string(),
        })
        .authorization((allow) => [allow.owner()]),

    Class: a
        .model({
            name: a.string().required(),
            subject: a.string(),
            yearLevel: a.string(),
            studentLimit: a.integer().default(30),
            classCode: a.string().required(),
            createdAtIso: a.string(),
        })
        .authorization((allow) => [
            allow.owner(),

            // Prototype access only.
            // This keeps student login working while the secure student
            // activation service is rebuilt properly.
            allow.guest().to(["read"]),
        ]),

    StudentSlot: a
        .model({
            classId: a.id().required(),
            studentCode: a.string().required(),
            label: a.string().required(),
            deviceSecretHash: a.string(),
            revoked: a.boolean().default(false),
            createdAtIso: a.string(),
        })
        .authorization((allow) => [
            allow.owner(),

            // Prototype access only.
            // Student slots remain anonymous: no names/emails online.
            allow.guest().to(["read"]),
        ]),

    StudentGridspaceSnapshot: a
        .model({
            snapshotKey: a.string().required(),

            classId: a.id().required(),
            studentSlotId: a.id().required(),

            workbookVersionId: a.string().required(),
            chapterId: a.string().required(),
            gridspaceId: a.string().required(),

            pathsJson: a.string().required(),

            localUpdatedAtIso: a.string().required(),
            syncedAtIso: a.string().required(),
        })
        .authorization((allow) => [
            allow.owner(),

            // Prototype access only.
            // This lets anonymous student devices push synced work.
            // Later this should be replaced by a secure sync function.
            allow.guest().to(["create", "read", "update"]),
        ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
    schema,
    authorizationModes: {
        defaultAuthorizationMode: "userPool",
    },
});