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
        .authorization((allow) => [allow.owner()]),

    StudentSlot: a
        .model({
            classId: a.id().required(),
            studentCode: a.string().required(),
            label: a.string().required(),
            deviceSecretHash: a.string(),
            revoked: a.boolean().default(false),
            createdAtIso: a.string(),
        })
        .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
    schema,
    authorizationModes: {
        defaultAuthorizationMode: "userPool",
    },
});