import { defineFunction } from "@aws-amplify/backend";

export const activateStudent = defineFunction({
    name: "activate-student",
    entry: "./handler.ts",
});