import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"

export default function ChatInterfaceView() {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 bg-[#c3e6d8]/50 border-t border-[#9f9579]/20 rounded-2xl">
        <form className="flex gap-2">
          <Input
            placeholder="大学について質問してください..."
            className="flex-1 bg-white/80 border-[#9f9579]/30 focus-visible:ring-[#b3cfad]"
          />
          <Button type="submit" className="bg-[#b3cfad] hover:bg-[#9f9579] text-white">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}

