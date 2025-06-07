import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Simple queries for today and backlog todos
export const getTodayTodos = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("todos"),
    _creationTime: v.number(),
    title: v.string(),
    description: v.string(),
    completed: v.boolean(),
    status: v.union(v.literal("today"), v.literal("backlog")),
    note: v.union(v.string(), v.null()),
  })),
  handler: async (ctx) => {
    const todos = await ctx.db
      .query("todos")
      .filter((q) => 
        q.or(
          q.eq(q.field("status"), "today"),
          q.eq(q.field("status"), undefined) // Handle existing todos without status
        )
      )
      .collect();
    
    const todosWithNotes = await Promise.all(
      todos.map(async (todo) => {
        const note = await ctx.db
          .query("notes")
          .withIndex("by_todo", (q) => q.eq("todoId", todo._id))
          .unique();
        
        return {
          _id: todo._id,
          _creationTime: todo._creationTime,
          title: todo.title,
          description: todo.description,
          completed: todo.completed ?? false,
          status: (todo.status ?? "today") as "today" | "backlog",
          note: note?.content || null,
        };
      })
    );
    
    return todosWithNotes;
  },
});

export const getBacklogTodos = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("todos"),
    _creationTime: v.number(),
    title: v.string(),
    description: v.string(),
    completed: v.boolean(),
    status: v.union(v.literal("today"), v.literal("backlog")),
    note: v.union(v.string(), v.null()),
  })),
  handler: async (ctx) => {
    const todos = await ctx.db
      .query("todos")
      .filter((q) => q.eq(q.field("status"), "backlog"))
      .collect();
    
    const todosWithNotes = await Promise.all(
      todos.map(async (todo) => {
        const note = await ctx.db
          .query("notes")
          .withIndex("by_todo", (q) => q.eq("todoId", todo._id))
          .unique();
        
        return {
          _id: todo._id,
          _creationTime: todo._creationTime,
          title: todo.title,
          description: todo.description,
          completed: todo.completed ?? false,
          status: todo.status as "today" | "backlog",
          note: note?.content || null,
        };
      })
    );
    
    return todosWithNotes;
  },
});

// Internal function to move uncompleted todos to backlog
export const moveToBacklog = internalMutation({
  args: {
    todoId: v.id("todos"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const todo = await ctx.db.get(args.todoId);
    if (!todo) {
      return null;
    }

    // Only move to backlog if not completed and still in "today" status (or no status)
    if (!todo.completed && (todo.status === "today" || !todo.status)) {
      await ctx.db.patch(args.todoId, {
        status: "backlog",
        scheduledFunctionId: undefined,
      });
    }

    return null;
  },
}); 