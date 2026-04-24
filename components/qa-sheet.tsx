"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { QaChat } from "@/components/ai-reading-panel"

export function QaSheet({
  chartId,
  open,
  onOpenChange,
}: {
  chartId: string
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-[480px]"
      >
        <SheetHeader className="border-b border-border bg-secondary/60 px-5 py-3">
          <SheetTitle className="font-serif">玄机 · AI 命理师</SheetTitle>
          <SheetDescription className="text-xs">
            已加载您的命盘，随时追问
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-hidden">
          <QaChat chartId={chartId} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
