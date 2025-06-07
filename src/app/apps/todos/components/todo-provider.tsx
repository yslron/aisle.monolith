"use client"

import React, { createContext, useContext } from "react"
import { useQuery } from "convex/react"
import { api } from "../../../../../convex/_generated/api"

interface TodoContextType {
  todayTodos: any[] | undefined
  backlogTodos: any[] | undefined
  isLoading: boolean
}

const TodoContext = createContext<TodoContextType | null>(null)

export function TodoProvider({ children }: { children: React.ReactNode }) {
  const todayTodos = useQuery(api.backlog.getTodayTodos)
  const backlogTodos = useQuery(api.backlog.getBacklogTodos)
  
  const isLoading = todayTodos === undefined || backlogTodos === undefined

  return (
    <TodoContext.Provider value={{ todayTodos, backlogTodos, isLoading }}>
      {children}
    </TodoContext.Provider>
  )
}

export function useTodos() {
  const context = useContext(TodoContext)
  if (!context) {
    throw new Error("useTodos must be used within a TodoProvider")
  }
  return context
} 