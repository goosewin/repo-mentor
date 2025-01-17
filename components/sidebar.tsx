import { FileExplainer } from "@/components/FileExplainer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export function Sidebar() {
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
          <FileExplainer />
        </div>
      </SheetContent>
    </Sheet>
  )
}

