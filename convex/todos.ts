import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// TODO CRUD Operations

export const getTodos = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("todos"),
    _creationTime: v.number(),
    title: v.string(),
    description: v.string(),
    completed: v.boolean(),
    status: v.union(v.literal("today"), v.literal("backlog")),
  })),
  handler: async (ctx) => {
    const todos = await ctx.db.query("todos").order("desc").collect();
    return todos.map(todo => ({
      _id: todo._id,
      _creationTime: todo._creationTime,
      title: todo.title,
      description: todo.description,
      completed: todo.completed ?? false,
      status: (todo.status ?? "today") as "today" | "backlog",
    }));
  },
});

export const getTodayTodos = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("todos"),
    _creationTime: v.number(),
    title: v.string(),
    description: v.string(),
    completed: v.boolean(),
    status: v.union(v.literal("today"), v.literal("backlog")),
  })),
  handler: async (ctx) => {
    const todos = await ctx.db
      .query("todos")
      .withIndex("by_status", (q) => q.eq("status", "today"))
      .collect();
    return todos.map(todo => ({
      ...todo,
      completed: todo.completed ?? false,
      status: todo.status ?? "today",
    }));
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
  })),
  handler: async (ctx) => {
    const todos = await ctx.db
      .query("todos")
      .withIndex("by_status", (q) => q.eq("status", "backlog"))
      .collect();
    return todos.map(todo => ({
      ...todo,
      completed: todo.completed ?? false,
      status: todo.status ?? "backlog",
    }));
  },
});

export const createTodo = mutation({
  args: {
    title: v.string(),
    description: v.string(),
  },
  returns: v.id("todos"),
  handler: async (ctx, args) => {
    const todoId = await ctx.db.insert("todos", {
      title: args.title,
      description: args.description,
      completed: false,
      status: "today",
    });

    // Calculate milliseconds until next midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // Set to midnight
    const millisecondsUntilMidnight = tomorrow.getTime() - now.getTime();

    // Schedule function to move to backlog at next midnight
    const scheduledFunctionId = await ctx.scheduler.runAfter(
      millisecondsUntilMidnight,
      internal.backlog.moveToBacklog,
      { todoId }
    );

    // Update the todo with the scheduled function ID
    await ctx.db.patch(todoId, {
      scheduledFunctionId,
    });

    return todoId;
  },
});

export const updateTodo = mutation({
  args: {
    id: v.id("todos"),
    title: v.string(),
    description: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      title: args.title,
      description: args.description,
    });
    return null;
  },
});

export const deleteTodo = mutation({
  args: {
    id: v.id("todos"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // First delete any notes associated with this todo
    const notes = await ctx.db
      .query("notes")
      .withIndex("by_todo", (q) => q.eq("todoId", args.id))
      .collect();
    
    for (const note of notes) {
      await ctx.db.delete(note._id);
    }
    
    // Then delete the todo
    await ctx.db.delete(args.id);
    return null;
  },
});

export const toggleTodoCompleted = mutation({
  args: {
    id: v.id("todos"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const todo = await ctx.db.get(args.id);
    if (!todo) {
      throw new Error("Todo not found");
    }
    
    const newCompletedStatus = !(todo.completed ?? false);
    
    // If marking as completed and there's a scheduled function, cancel it
    if (newCompletedStatus && todo.scheduledFunctionId) {
      await ctx.scheduler.cancel(todo.scheduledFunctionId);
      await ctx.db.patch(args.id, {
        completed: newCompletedStatus,
        scheduledFunctionId: undefined,
      });
    } else if (!newCompletedStatus && todo.status === "today" && !todo.scheduledFunctionId) {
      // If marking as uncompleted and it's in today's list, reschedule backlog move
      // Calculate milliseconds until next midnight
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0); // Set to midnight
      const millisecondsUntilMidnight = tomorrow.getTime() - now.getTime();
      
      const scheduledFunctionId = await ctx.scheduler.runAfter(
        millisecondsUntilMidnight,
        internal.backlog.moveToBacklog,
        { todoId: args.id }
      );
      
      await ctx.db.patch(args.id, {
        completed: newCompletedStatus,
        scheduledFunctionId,
      });
    } else {
      await ctx.db.patch(args.id, {
        completed: newCompletedStatus,
      });
    }
    
    return null;
  },
});

// NOTE CRUD Operations

export const getNoteByTodoId = query({
  args: {
    todoId: v.id("todos"),
  },
  returns: v.union(
    v.object({
      _id: v.id("notes"),
      _creationTime: v.number(),
      todoId: v.id("todos"),
      content: v.string(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const note = await ctx.db
      .query("notes")
      .withIndex("by_todo", (q) => q.eq("todoId", args.todoId))
      .unique();
    return note || null;
  },
});

export const saveNote = mutation({
  args: {
    todoId: v.id("todos"),
    content: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Check if note already exists for this todo
    const existingNote = await ctx.db
      .query("notes")
      .withIndex("by_todo", (q) => q.eq("todoId", args.todoId))
      .unique();
    
    if (existingNote) {
      // Update existing note
      await ctx.db.patch(existingNote._id, {
        content: args.content,
      });
    } else {
      // Create new note
      await ctx.db.insert("notes", {
        todoId: args.todoId,
        content: args.content,
      });
    }
    return null;
  },
});

export const deleteNote = mutation({
  args: {
    todoId: v.id("todos"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const note = await ctx.db
      .query("notes")
      .withIndex("by_todo", (q) => q.eq("todoId", args.todoId))
      .unique();
    
    if (note) {
      await ctx.db.delete(note._id);
    }
    return null;
  },
});

// Combined query to get todos with their notes
export const getTodosWithNotes = query({
  args: {
    status: v.optional(v.union(v.literal("today"), v.literal("backlog"))),
  },
  returns: v.array(v.object({
    _id: v.id("todos"),
    _creationTime: v.number(),
    title: v.string(),
    description: v.string(),
    completed: v.boolean(),
    status: v.union(v.literal("today"), v.literal("backlog")),
    note: v.union(v.string(), v.null()),
  })),
  handler: async (ctx, args) => {
    let todos;
    if (args.status) {
      todos = await ctx.db
        .query("todos")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    } else {
      todos = await ctx.db.query("todos").collect();
    }
    
    const todosWithNotes = await Promise.all(
      todos.map(async (todo) => {
        const note = await ctx.db
          .query("notes")
          .withIndex("by_todo", (q) => q.eq("todoId", todo._id))
          .unique();
        
        return {
          ...todo,
          completed: todo.completed ?? false,
          status: todo.status ?? "today",
          note: note?.content || null,
        };
      })
    );
    
    return todosWithNotes;
  },
});

// Internal function to move todo to backlog
export const moveToBacklog = internalMutation({
  args: {
    todoId: v.id("todos"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const todo = await ctx.db.get(args.todoId);
    if (!todo) {
      // Todo was deleted, nothing to do
      return null;
    }

    // Only move to backlog if not completed and still in "today" status
    if (!todo.completed && todo.status === "today") {
      await ctx.db.patch(args.todoId, {
        status: "backlog",
        scheduledFunctionId: undefined, // Clear the scheduled function ID
      });
    }

    return null;
  },
}); 