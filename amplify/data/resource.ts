import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { activateStudent } from "../functions/activate-student/resource";

const schema = a
    .schema({
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

                // The activate-student Lambda may read classes when checking a code.
                // Students/guests should NOT be able to list classes directly.
                allow.resource(activateStudent).to(["read"]),
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

                // The activate-student Lambda may read slots when checking a code.
                // Students/guests should NOT be able to list student slots directly.
                allow.resource(activateStudent).to(["read"]),
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
    })
    .authorization((allow) => [
        allow.resource(activateStudent).to(["query"]),
    ]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
    schema,
    authorizationModes: {
        defaultAuthorizationMode: "userPool",
    },
});