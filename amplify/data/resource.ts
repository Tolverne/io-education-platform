import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { activateStudent } from "../functions/activate-student/resource";

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

            // Temporary: allows student activation to work while we stabilise the app.
            // Later we should replace this with a dedicated secure activation function.
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

            // Temporary: allows student activation to work while we stabilise the app.
            // Later we should replace this with a dedicated secure activation function.
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
        ]),

    ActivateStudentResponse: a.customType({
        success: a.boolean(),
        message: a.string(),
        classId: a.string(),
        studentSlotId: a.string(),
        classCode: a.string(),
        studentCode: a.string(),
    }),

    activateStudent: a
        .query()
        .arguments({
            classCode: a.string().required(),
            studentCode: a.string().required(),
        })
        .returns(a.ref("ActivateStudentResponse"))
        .authorization((allow) => [allow.guest()])
        .handler(a.handler.function(activateStudent)),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
    schema,
    authorizationModes: {
        defaultAuthorizationMode: "userPool",
    },
});