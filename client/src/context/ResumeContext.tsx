import { createContext, useContext, useState } from "react";
import type { ParsedResume } from "@/lib/types";

interface ResumeContextType {
  resume: ParsedResume | null;
  setResume: (r: ParsedResume) => void;
}

const ResumeContext = createContext<ResumeContextType>({
  resume: null,
  setResume: () => {},
});

export function ResumeProvider({ children }: { children: React.ReactNode }) {
  const [resume, setResume] = useState<ParsedResume | null>(null);
  return (
    <ResumeContext.Provider value={{ resume, setResume }}>
      {children}
    </ResumeContext.Provider>
  );
}

export const useResume = () => useContext(ResumeContext);
