import {z} from "zod";
import {UserSchema} from "@/feature/user/schema/UserSchema.ts";

export const selfUserListSchema = z.object({
    user: UserSchema,
});