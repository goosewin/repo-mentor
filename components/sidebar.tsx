import { FileExplainer } from "@/components/FileExplainer"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export function Sidebar({ fileName, fileContent }: { fileName: string, fileContent: string }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Sidebar</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>File Explainer</SheetTitle>
          <SheetDescription>
            Get explanations for code in specific files.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <FileExplainer fileName={fileName} fileContent={fileContent} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
