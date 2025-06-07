import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  todos: defineTable({
    title: v.string(),
    description: v.string(),
    completed: v.optional(v.boolean()),
    status: v.optional(v.union(v.literal("today"), v.literal("backlog"))),
    scheduledFunctionId: v.optional(v.id("_scheduled_functions")),
  }).index("by_status", ["status"]),

  notes: defineTable({
    todoId: v.id("todos"),
    content: v.string(),
  }).index("by_todo", ["todoId"]),
}); 