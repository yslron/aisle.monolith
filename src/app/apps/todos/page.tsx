"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { TodoModal } from "@/app/apps/todos/components/edit-todo-modal"
import { NoteModal } from "@/app/apps/todos/components/note-modal"
import { TodoProvider } from "@/app/apps/todos/components/todo-provider"
import { Id } from "../../../../convex/_generated/dataModel"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

function TodosContent() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<"today" | "backlog">("today")

    const todayTodos = useQuery(api.backlog.getTodayTodos)
    const backlogTodos = useQuery(api.backlog.getBacklogTodos)

    // Show loading state while data is being fetched
    const isLoading = todayTodos === undefined || backlogTodos === undefined

    // Handle data loading errors gracefully
    const hasError = false // Convex handles errors internally, but you can add custom error handling here

    const todos = activeTab === "today" ? (todayTodos ?? []) : (backlogTodos ?? [])
    const sortedTodos = todos.sort((a: any, b: any) => a._creationTime - b._creationTime)

    const createTodoMutation = useMutation(api.todos.createTodo)
    const updateTodoMutation = useMutation(api.todos.updateTodo)
    const deleteTodoMutation = useMutation(api.todos.deleteTodo)
    const toggleTodoCompletedMutation = useMutation(api.todos.toggleTodoCompleted)
    const saveNoteMutation = useMutation(api.todos.saveNote)
    const deleteNoteMutation = useMutation(api.todos.deleteNote)

    const [newTitle, setNewTitle] = useState("")
    const [newDescription, setNewDescription] = useState("")
    const handleAddTodo = async () => {
        if (newTitle.trim()) {
            try {
                await createTodoMutation({
                    title: newTitle,
                    description: newDescription,
                })
                toast.success("TODO created successfully!")
                setNewTitle("")
                setNewDescription("")
            } catch (error) {
                toast.error("Failed to create TODO")
            }
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            handleAddTodo()
        }
    }

    const handleEditTodo = async (id: Id<"todos">, title: string, description: string) => {
        try {
            await updateTodoMutation({
                id,
                title,
                description,
            })
            toast.success("TODO updated successfully!")
        } catch (error) {
            toast.error("Failed to update TODO")
        }
    }

    const handleDeleteTodo = async (id: Id<"todos">) => {
        try {
            await deleteTodoMutation({ id })
            toast.success("TODO deleted successfully!")
        } catch (error) {
            toast.error("Failed to delete TODO")
        }
    }

    const handleSaveNote = async (todoId: Id<"todos">, noteContent: string) => {
        try {
            await saveNoteMutation({
                todoId,
                content: noteContent,
            })
            toast.success("Note saved successfully!")
        } catch (error) {
            toast.error("Failed to save note")
        }
    }

    const handleDeleteNote = async (todoId: Id<"todos">) => {
        try {
            await deleteNoteMutation({ todoId })
            toast.success("Note deleted successfully!")
        } catch (error) {
            toast.error("Failed to delete note")
        }
    }

    const handleToggleCompleted = async (todoId: Id<"todos">) => {
        try {
            await toggleTodoCompletedMutation({ id: todoId })
            // We could add a toast here but it might be too much for a simple toggle
            // toast.success("TODO status updated!")
        } catch (error) {
            toast.error("Failed to update TODO status")
        }
    }

    return (
        <div className="w-full py-[20px] px-[20px]">
            <div className="max-w-[1024px] mx-auto">
                <header className="flex w-full justify-between items-center">
                    <h1 className="text-3xl font-regular">    <span className="pr-1     cursor-pointer text-2xl font-bold" onClick={() => router.back()}>←</span>TODO/S</h1>
                    <h1 className="text-3xl font-regular">
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                        }).toUpperCase()} - {new Date().toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                        }).toUpperCase()}
                    </h1>
                </header>
                <section className="flex flex-col mt-[20px]">
                    <div className="flex">
                        <div
                            className={`border-t border-x border-primary px-[5px] py-[5px]  flex gap-2 cursor-pointer ${activeTab === "today" ? "bg-white" : "bg-white opacity-50 hover:opacity-100"}`}
                            onClick={() => setActiveTab("today")}
                        >
                            <h1 className="text-base font-regular">TODAY'S TODO/s</h1>
                            <div className="flex items-center justify-center bg-primary text-white px-2">
                                {todayTodos?.length ?? 0}
                            </div>
                        </div>
                        <div
                            className={`border-t border-r border-primary px-[5px] py-[5px]  flex gap-2 cursor-pointer ${activeTab === "backlog" ? "bg-white" : "bg-white opacity-50 hover:opacity-100"}`}
                            onClick={() => setActiveTab("backlog")}
                        >
                            <h1 className="text-base font-regular">BACKLOG/S</h1>
                            <div className="flex items-center justify-center bg-primary text-white px-2">
                                {backlogTodos?.length ?? 0}
                            </div>
                        </div>
                    </div>
                    <div className="border flex p-[20px] bg-white">
                        {isLoading ? (
                            <div className="flex flex-col gap-[10px] w-full items-center justify-center py-[40px]">
                                <h1 className="text-base font-regular opacity-50">Loading todos...</h1>
                            </div>
                        ) : sortedTodos.length === 0 ? (
                            <div className="flex flex-col gap-[10px]">
                                <h1 className="text-base font-regular">No {activeTab === "today" ? "today's todos" : "backlog"}</h1>
                            </div>
                        ) : (
                            <div className="flex justify-between w-full">
                                <div className="flex flex-col gap-[10px]">
                                    {sortedTodos.map((todo: {
                                        _id: Id<"todos">;
                                        _creationTime: number;
                                        title: string;
                                        description: string;
                                        completed: boolean;
                                        note: string | null;
                                    }) => (
                                        <div key={todo._id} className="flex items-start justify-start gap-[10px]">
                                            <div className="flex">
                                                <div
                                                    className={`min-w-[40px] min-h-[40px] border cursor-pointer hover:bg-slate-100 flex items-center justify-center ${todo.completed ? '' : 'bg-white'}`}
                                                    onClick={() => handleToggleCompleted(todo._id)}
                                                >
                                                    {todo.completed && (
                                                        <Image src="/assets/icons/checkmark-2.svg" alt="completed" width={24} height={24} />
                                                    )}
                                                </div>
                                            </div>
                                            <h1 className={`text-lg font-regular mt-1 line-clamp-1 ${todo.completed ? 'line-through opacity-50' : ''}`}>
                                                {todo.title}
                                            </h1>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex flex-col gap-[10px]">
                                    {sortedTodos.map((todo: {
                                        _id: Id<"todos">;
                                        _creationTime: number;
                                        title: string;
                                        description: string;
                                        completed: boolean;
                                        note: string | null;
                                    }) => (
                                        <div key={todo._id} className="flex flex-row gap-[10px]">
                                            <NoteModal
                                                todo={todo}
                                                note={todo.note}
                                                onSave={(noteContent) => handleSaveNote(todo._id, noteContent)}
                                                onDelete={() => handleDeleteNote(todo._id)}
                                                trigger={
                                                    <div className={`w-[40px] h-[40px] hover:bg-slate-100 hover:cursor-pointer border flex justify-center items-center ${todo.note ? 'bg-slate-100' : 'bg-white'}`}>
                                                        <Image src="/assets/icons/note-1.svg" alt="note" width={24} height={24} />
                                                    </div>
                                                }
                                            />
                                            <TodoModal
                                                todo={todo}
                                                onSave={(title, description) => handleEditTodo(todo._id, title, description)}
                                                trigger={
                                                    <div className="w-[40px] h-[40px] hover:bg-slate-100 hover:cursor-pointer border flex justify-center items-center">
                                                        <Image src="/assets/icons/pencil-wave.svg" alt="edit" width={24} height={24} />
                                                    </div>
                                                }
                                            />
                                            <div
                                                className="w-[40px] h-[40px] hover:bg-slate-100 hover:cursor-pointer border flex justify-center items-center"
                                                onClick={() => handleDeleteTodo(todo._id)}
                                            >
                                                <Image src="/assets/icons/trash-can.svg" alt="delete" width={24} height={24} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
                <section className="fixed bottom-0 w-full max-w-[1024px] mx-auto pb-[20px]">
                    <div className="flex">
                        <div className="border border-primary bg-white px-2 border-b-0"><h1 className="text-base font-regular">Add TODO/S</h1></div>

                    </div>
                    <div className="w-full border border-primary bg-white p-[20px]">
                        <div className="flex w-full justify-between gap-[10px]">

                            <div className="flex flex-col gap-[10px] w-full">
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="TITLE"
                                    className=" bg-white text-base font-regular focus:outline-none focus:border-primary"
                                />
                                <textarea
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="DESCRIPTION"
                                    className=" w-full bg-white text-base font-regular h-[60px] resize-none focus:outline-none focus:border-primary"
                                />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={handleAddTodo}
                                    disabled={!newTitle.trim()}
                                    className="border border-primary bg-white w-[40px] h-[40px] flex justify-center items-center text-base font-regular hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed gap-[10px]"
                                >
                                    <Image src="/assets/icons/plus-large.svg" alt="add" width={20} height={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default function Todos() {
    return (
        <TodoProvider>
            <TodosContent />
        </TodoProvider>
    )
}