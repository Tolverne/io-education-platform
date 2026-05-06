import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { env } from "$amplify/env/activate-student";
import type { Schema } from "../../data/resource";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export const handler: Schema["activateStudent"]["functionHandler"] = async (
    event
) => {
    const classCode = event.arguments.classCode.trim().toUpperCase();
    const studentCode = event.arguments.studentCode.trim().toUpperCase();

    const classResult = await client.models.Class.list({
        filter: {
            classCode: {
                eq: classCode,
            },
        },
    });

    const foundClass = classResult.data[0];

    if (!foundClass) {
        return {
            success: false,
            message: "Invalid class code.",
            classId: null,
            studentSlotId: null,
            classCode: null,
            studentCode: null,
        };
    }

    const slotResult = await client.models.StudentSlot.list({
        filter: {
            classId: {
                eq: foundClass.id,
            },
        },
    });

    const foundSlot = slotResult.data.find(
        (slot) => slot.studentCode === studentCode && slot.revoked !== true
    );

    if (!foundSlot) {
        return {
            success: false,
            message: "Invalid student code.",
            classId: null,
            studentSlotId: null,
            classCode: null,
            studentCode: null,
        };
    }

    return {
        success: true,
        message: "Student activated.",
        classId: foundClass.id,
        studentSlotId: foundSlot.id,
        classCode,
        studentCode,
    };
};