"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Id } from "../../../../../convex/_generated/dataModel"

interface TodoModalProps {
  trigger?: React.ReactNode
  todo?: {
    _id: Id<"todos">
    title: string
    description: string
  }
  onSave?: (title: string, description: string) => void
}

export function TodoModal({ trigger, todo, onSave }: TodoModalProps) {
  const [title, setTitle] = useState(todo?.title || "")
  const [description, setDescription] = useState(todo?.description || "")
  const [open, setOpen] = useState(false)

  const handleSave = () => {
    if (title.trim()) {
      onSave?.(title, description)
      if (!todo) {
        // Reset form for new todos
        setTitle("")
        setDescription("")
      }
      setOpen(false)
    }
  }

  const handleCancel = () => {
    // Reset to original values or empty if new
    setTitle(todo?.title || "")
    setDescription(todo?.description || "")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <div className="w-[40px] h-[40px] border border-primary hover:bg-slate-100 hover:cursor-pointer flex justify-center items-center bg-white">
            <Image src="/assets/icons/plus-large.svg" alt="add" width={24} height={24} />
          </div>
        )}
      </DialogTrigger>
      <DialogContent className="bg-white border-primary rounded-none shadow-none max-w-[600px] p-0">
        {/* Custom Header */}
        <div className="border-primary bg-white px-[20px] pt-[20px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-regular text-left">
              EDIT TODO
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Form Content */}
        <div className="pb-[10px] px-[20px] space-y-[20px]">
          <div>
            <div className="flex opacity-50"><label htmlFor="title" className=" px-[5px] border-x border-t text-base font-regular block ">
              TITLE
            </label></div>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="border-primary rounded-none bg-white text-2xl font-regular p-[10px] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary"
            />
          </div>

          <div>
            <div className="flex opacity-50 "><label htmlFor="description" className=" px-[5px] border-x border-t text-base font-regular block ">
              DESCRIPTION
            </label></div>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              className="border-primary rounded-none bg-white text-2xl font-regular p-[10px] min-h-[100px] resize-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary"
            />
          </div>
        </div>

        {/* Custom Footer */}
        <div className="border-primary bg-white px-[20px] pb-[20px] flex justify-between items-center">
          <DialogClose asChild>
            <button
              onClick={handleCancel}
              className="border cursor-pointer border-primary bg-white px-[10px] py-[10px] text-2xl font-regular hover:bg-slate-100 transition-colors"
            >
              CANCEL
            </button>
          </DialogClose>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="border cursor-pointer border-primary bg-white px-[10px] py-[10px] text-2xl font-regular hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            UPDATE
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 