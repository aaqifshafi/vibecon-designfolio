import { cn } from "@/lib/utils";

interface FolderProps {
  isDragging?: boolean;
  className?: string;
}

export function Folder({ isDragging = false, className }: FolderProps) {
  return (
    <div
      className={cn("relative shrink-0 select-none z-50", className)}
      style={{ width: 40, height: 36, perspective: "120px" }}
    >
      {/* work-5: folder back body + left tab */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-[28px] rounded-[4px] rounded-tl-none origin-top transition-all ease duration-300 group-hover/dropzone:shadow-[0_4px_10px_rgba(0,0,0,0.22)]",
          isDragging ? "bg-[#FF553E]" : "bg-amber-600"
        )}
      >
        {/* left tab */}
        <div
          className={cn(
            "absolute bottom-full left-0 h-[7px] w-[14px] rounded-t-[3px]",
            isDragging ? "bg-[#FF553E]" : "bg-amber-600"
          )}
        />
        {/* left corner connector */}
        <div
          className={cn("absolute h-[4px] w-[4px]", isDragging ? "bg-[#FF553E]" : "bg-amber-600")}
          style={{ bottom: "100%", left: 13, clipPath: "polygon(0 35%, 0% 100%, 50% 100%)" }}
        />
      </div>

      {/* work-4: paper back — rises most */}
      <div
        className={cn(
          "absolute left-[3px] right-[3px] h-[20px] rounded-[3px] transition-all ease duration-300 origin-bottom",
          "bg-zinc-400",
          "bottom-[4px] group-hover/dropzone:[transform:translateY(-10px)_rotateX(-18deg)]"
        )}
      />
      {/* work-3: paper middle */}
      <div
        className={cn(
          "absolute left-[3px] right-[3px] h-[20px] rounded-[3px] transition-all ease duration-300 origin-bottom",
          "bg-zinc-300",
          "bottom-[4px] group-hover/dropzone:[transform:translateY(-6px)_rotateX(-12deg)]"
        )}
      />
      {/* work-2: paper front — rises least */}
      <div
        className={cn(
          "absolute left-[3px] right-[3px] h-[20px] rounded-[3px] transition-all ease duration-300 origin-bottom",
          "bg-zinc-200",
          "bottom-[4px] group-hover/dropzone:[transform:translateY(-3px)_rotateX(-6deg)]"
        )}
      />

      {/* work-1: folder front body + right tab */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-[22px] rounded-[4px] rounded-tr-none transition-all ease duration-300",
          isDragging ? "bg-[#FF553E]" : "bg-gradient-to-t from-amber-500 to-amber-400"
        )}
      >
        {/* right tab */}
        <div
          className={cn(
            "absolute bottom-full right-0 h-[7px] w-[24px] rounded-t-[3px]",
            isDragging ? "bg-[#FF553E]" : "bg-amber-400"
          )}
        />
        {/* right corner connector */}
        <div
          className={cn("absolute h-[4px] w-[4px]", isDragging ? "bg-[#FF553E]" : "bg-amber-400")}
          style={{ bottom: "100%", right: 23, clipPath: "polygon(100% 14%, 50% 100%, 100% 100%)" }}
        />
      </div>
    </div>
  );
}
