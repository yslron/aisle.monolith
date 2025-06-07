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
import { Textarea } from "@/components/ui/textarea"
import { Id } from "../../../../../convex/_generated/dataModel"

interface NoteModalProps {
  trigger?: React.ReactNode
  todo: {
    _id: Id<"todos">
    title: string
    description: string
  }
  note?: string | null
  onSave?: (noteContent: string) => void
  onDelete?: () => void
}

export function NoteModal({ trigger, todo, note, onSave, onDelete }: NoteModalProps) {
  const [noteContent, setNoteContent] = useState(note || "")
  const [open, setOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

    const handleSave = () => {
    onSave?.(noteContent)
    setIsEditing(false)
    setOpen(false)
  }

  const handleDelete = () => {
    onDelete?.()
    setNoteContent("")
    setIsEditing(false)
    setOpen(false)
  }

  const handleEdit = () => {
    setIsEditing(true)
    setNoteContent(note || "")
  }

  const handleCancel = () => {
    setNoteContent(note || "")
    setIsEditing(false)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <div className="w-[40px] h-[40px] border border-primary hover:bg-slate-100 hover:cursor-pointer flex justify-center items-center bg-white">
            <Image src="/assets/icons/note-1.svg" alt="note" width={24} height={24} />
          </div>
        )}
      </DialogTrigger>
      <DialogContent className="bg-white border-primary rounded-none shadow-none max-w-[800px] p-0">
        {/* Custom Header */}
        <div className="border-primary bg-white px-[20px] pt-[20px] flex justify-between items-start">
          <DialogHeader className="flex-1">
            <DialogTitle className="text-xl font-regular text-left">
              NOTE
            </DialogTitle>
          </DialogHeader>

        </div>

        {/* Form Content */}

        {/* Action Bar */}
                 <div className="flex flex-col w-full gap-0 justify-between items-center">{note && !isEditing && (
           <div className="px-[20px] w-full">
             <div className="flex w-full">
               <button 
                 onClick={handleEdit}
                 className="text-base font-regular hover:bg-slate-100 opacity-50 hover:opacity-100 cursor-pointer px-[5px] border-t border-l border-primary bg-white"
               >
                 EDIT
               </button>
               <button 
                 onClick={handleDelete}
                 className="text-base font-regular hover:bg-slate-100 opacity-50 hover:opacity-100 cursor-pointer px-[5px] border-t border-r border-l border-primary bg-white"
               >
                 DELETE
               </button>
             </div>
           </div>
         )}

                     <div className="pb-[10px] px-[20px] space-y-[20px] w-full">
             {note && !isEditing ? (
               // Display mode
               <div className="border border-primary p-[20px] bg-white">
                 <h2 className="opacity-50 font-regular mb-[10px]">
                   TODO NOTE - "{todo.title.toUpperCase()}"
                 </h2>
                 <div className="whitespace-pre-wrap text-lg font-regular">
                   {note}
                 </div>
               </div>
             ) : (
               // Edit mode (both for new notes and editing existing notes)
               <div>
                 <div className="flex opacity-50">
                   <label htmlFor="note" className="px-[5px] border-x border-t text-base font-regular block">
                     TODO NOTE - "{todo.title.toUpperCase()}"
                   </label>
                 </div>
                 <Textarea
                   id="note"
                   value={noteContent}
                   onChange={(e) => setNoteContent(e.target.value)}
                   placeholder="Add detailed notes about this todo..."
                   className="border-primary rounded-none bg-white text-lg font-regular p-[10px] min-h-[200px] resize-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary"
                 />
               </div>
             )}
          </div></div>

        {/* Custom Footer */}
        <div className="border-primary bg-white px-[20px] pb-[20px] flex justify-end items-center">
          <div className="flex gap-[10px] items-center"><DialogClose asChild>
            <button
              onClick={handleCancel}
              className="border cursor-pointer border-primary bg-white px-[10px] py-[5px] text-2xl font-regular hover:bg-slate-100 transition-colors"
            >
              CANCEL
            </button>
          </DialogClose>
                         <div className="flex gap-[10px] items-center">
               <button
                 onClick={handleSave}
                 disabled={!noteContent.trim()}
                 className="border border-primary bg-white px-[10px] py-[5px] text-2xl font-regular hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-[5px]"
               >
                 <Image src="/assets/icons/plus-large.svg" alt="add" width={16} height={16} />
                 {isEditing ? "UPDATE NOTE" : "ADD NOTE"}
               </button>
             </div></div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 