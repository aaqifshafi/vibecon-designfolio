import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ChartSpline, Eye, PaintRoller, Check, Menu } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import profileImg from "@/assets/images/profile.png";
import { cn } from "@/lib/utils";

import { useIsMobile } from "@/hooks/use-mobile";

import SwitchToggleThemeDemo from "@/components/ui/toggle-theme";
import { PublishDropdown } from "@/components/ui/publish-dropdown";
import { AvatarDropdown } from "@/components/ui/avatar-dropdown";

export default function Navbar() {
  const [isThemePanelOpen, setIsThemePanelOpen] = useState(false);
  const [isOverlay, setIsOverlay] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const [activeTemplate, setActiveTemplate] = useState("Minimal");

  useEffect(() => {
    const checkOverlay = () => setIsOverlay(window.innerWidth < 1024);
    checkOverlay();
    window.addEventListener('resize', checkOverlay);
    return () => window.removeEventListener('resize', checkOverlay);
  }, []);

  useEffect(() => {
    const root = document.getElementById('root');
    if (root) {
      if (isThemePanelOpen) {
        root.classList.add('theme-panel-open');
      } else {
        root.classList.remove('theme-panel-open');
      }
    }
    return () => {
      if (root) root.classList.remove('theme-panel-open');
    };
  }, [isThemePanelOpen]);

  useEffect(() => {
    if (isThemePanelOpen) {
      window.dispatchEvent(new CustomEvent('panelOpened', { detail: 'theme' }));
    }
  }, [isThemePanelOpen]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      window.dispatchEvent(new CustomEvent('panelOpened', { detail: 'mobile-menu' }));
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handlePanelOpened = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail !== 'theme') {
        setIsThemePanelOpen(false);
      }
      if (customEvent.detail !== 'mobile-menu') {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('panelOpened', handlePanelOpened);
    return () => window.removeEventListener('panelOpened', handlePanelOpened);
  }, []);

  return (
    <TooltipProvider>
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none pt-4 px-4">
        <nav className="bg-white dark:bg-[#2A2520] border border-black/8 dark:border-white/10 rounded-full shadow-sm pointer-events-auto max-w-[640px] w-full">
          <div className="px-2 md:px-2 py-2 flex items-center justify-between gap-4 md:gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
          </div>

          {/* Mobile Menu */}
          <div className="flex md:hidden items-center gap-2">
            <AvatarDropdown />
            
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="secondary" 
                  size="icon"
                  className="bg-[#F5F5F5] hover:bg-[#E8E8E8] dark:bg-[#3A3531] dark:hover:bg-[#4A4540] border border-black/10 dark:border-white/10 text-[#1A1A1A] dark:text-[#F0EDE7] h-10 w-10 rounded-full hover:cursor-pointer"
                >
                  <Menu size={18} />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-3xl bg-white dark:bg-[#2A2520] border-t border-black/10 dark:border-white/10 p-6 flex flex-col gap-6">
                <VisuallyHidden>
                  <SheetTitle>Menu</SheetTitle>
                </VisuallyHidden>
                <div className="flex flex-col gap-4">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-[#7A736C] dark:text-[#9E9893] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7] hover:bg-[#F5F5F5] dark:hover:bg-[#3A3531] h-10 px-4"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsThemePanelOpen(true);
                    }}
                  >
                    <PaintRoller className="mr-2 h-4 w-4" />
                    Themes settings
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-[#7A736C] dark:text-[#9E9893] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7] hover:bg-[#F5F5F5] dark:hover:bg-[#3A3531] h-10 px-4"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <ChartSpline className="mr-2 h-4 w-4" />
                    Insights
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-[#7A736C] dark:text-[#9E9893] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7] hover:bg-[#F5F5F5] dark:hover:bg-[#3A3531] h-10 px-4"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  <div className="flex w-full items-center justify-between gap-3 p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10 mt-2">
                    <div className="flex flex-col gap-0.5 overflow-hidden">
                      <span className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] truncate">
                        shai.designfolio.me
                      </span>
                      <span className="text-[11px] text-[#7A736C] dark:text-[#9E9893]">
                        Updated 29 days ago
                      </span>
                    </div>
                    <Button 
                      className="bg-black hover:bg-[#2A2A2A] dark:bg-white dark:hover:bg-[#E8E8E8] text-white dark:text-black font-medium px-4 h-8 text-xs rounded-lg whitespace-nowrap flex-shrink-0"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Update
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="secondary" 
                  size="icon"
                  className="group bg-[#F5F5F5] hover:bg-[#E8E8E8] dark:bg-[#3A3531] dark:hover:bg-[#4A4540] border border-black/10 dark:border-white/10 text-[#7A736C] dark:text-[#9E9893] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7] h-9 w-9 rounded-full hover:cursor-pointer"
                  data-testid="button-insights"
                >
                  <ChartSpline size={18} className="transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-[#1A1A1A] dark:bg-[#F0EDE7] text-[#F0EDE7] dark:text-[#1A1A1A] text-xs px-2 py-1 rounded">Insights</TooltipContent>
            </Tooltip>
            <Sheet modal={false} open={isThemePanelOpen} onOpenChange={setIsThemePanelOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SheetTrigger asChild>
                    <Button 
                      variant="secondary" 
                      size="icon"
                      className="group bg-[#F5F5F5] hover:bg-[#E8E8E8] dark:bg-[#3A3531] dark:hover:bg-[#4A4540] border border-black/10 dark:border-white/10 text-[#7A736C] dark:text-[#9E9893] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7] h-9 w-9 rounded-full hover:cursor-pointer"
                      data-testid="button-themes"
                    >
                      <PaintRoller size={18} className="transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                    </Button>
                  </SheetTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-[#1A1A1A] dark:bg-[#F0EDE7] text-[#F0EDE7] dark:text-[#1A1A1A] text-xs px-2 py-1 rounded">Themes</TooltipContent>
              </Tooltip>
              <SheetContent 
                className="border-l border-black/10 dark:border-white/10 bg-white dark:bg-[#2A2520] p-0 flex flex-col" 
                hasOverlay={isOverlay}
                onInteractOutside={(e) => {
                  if (!isOverlay) {
                    e.preventDefault();
                  }
                }}
              >
                <SheetHeader className="px-5 py-4 border-b border-black/10 dark:border-white/10 flex-shrink-0 flex flex-row items-center m-0 space-y-0 h-[65px]">
                  <SheetTitle className="text-[#1A1A1A] dark:text-[#F0EDE7] text-[15px] font-medium m-0">Themes settings</SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto p-5 space-y-8">
                  <SwitchToggleThemeDemo />
                  
                  <div className="space-y-4 pt-2">
                    <div className="text-[13px] font-medium text-[#7A736C] dark:text-[#9E9893] px-1">Templates</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-6 pb-4">
                      {["Minimal", "Professional", "Creative", "Chatfolio", "Designer"].map((template) => {
                        const isSelected = activeTemplate === template;
                        return (
                          <div key={template} className="flex flex-col gap-3 items-center">
                            <div className="relative w-full">
                              <button 
                                onClick={() => setActiveTemplate(template)}
                                className={cn(
                                  "w-full aspect-square rounded-[24px] transition-all focus:outline-none cursor-pointer group",
                                  isSelected 
                                    ? "border-[2.5px] border-[#FF5A36] p-1.5" 
                                    : "border-[2.5px] border-transparent p-1.5 hover:bg-black/5 dark:hover:bg-white/5"
                                )}
                              >
                                <div className={cn(
                                  "w-full h-full rounded-[14px] overflow-hidden transition-all shadow-sm border border-black/5 dark:border-white/5 relative",
                                  isSelected 
                                    ? "bg-[#F0EDE7] dark:bg-[#3A3531]" 
                                    : "bg-[#F5F5F5] dark:bg-[#2A2520] group-hover:shadow-md"
                                )}>
                                   {/* Subtle wireframe placeholder */}
                                   <div className="absolute inset-0 p-3 flex flex-col gap-2 opacity-40">
                                     <div className="flex items-center gap-2">
                                       <div className="w-5 h-5 rounded-full bg-black/20 dark:bg-white/20" />
                                       <div className="w-12 h-1.5 rounded-full bg-black/20 dark:bg-white/20" />
                                     </div>
                                     <div className="w-full h-12 mt-1 rounded-md bg-black/10 dark:bg-white/10" />
                                     <div className="flex gap-2 mt-auto">
                                       <div className="w-full h-8 rounded-md bg-black/10 dark:bg-white/10" />
                                       <div className="w-full h-8 rounded-md bg-black/10 dark:bg-white/10" />
                                     </div>
                                   </div>
                                </div>
                              </button>
                              
                              {isSelected && (
                                <div className="absolute -bottom-1 -left-1 bg-[#FF5A36] text-white rounded-full p-1.5 shadow-sm flex items-center justify-center border-[2px] border-white dark:border-[#2A2520] z-10">
                                  <Check size={14} strokeWidth={3.5} />
                                </div>
                              )}
                            </div>
                            <span className={cn(
                              "text-[14px] text-center transition-colors font-medium",
                              isSelected 
                                ? "text-[#FF5A36]" 
                                : "text-[#7A736C] dark:text-[#9E9893]"
                            )}>
                              {template}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="secondary" 
                  size="icon"
                  className="group bg-[#F5F5F5] hover:bg-[#E8E8E8] dark:bg-[#3A3531] dark:hover:bg-[#4A4540] border border-black/10 dark:border-white/10 text-[#7A736C] dark:text-[#9E9893] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7] h-9 w-9 rounded-full hover:cursor-pointer"
                  data-testid="button-preview"
                >
                  <Eye size={18} className="transition-transform duration-300 group-hover:scale-125" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-[#1A1A1A] dark:bg-[#F0EDE7] text-[#F0EDE7] dark:text-[#1A1A1A] text-xs px-2 py-1 rounded">Preview</TooltipContent>
            </Tooltip>
            <PublishDropdown />
            <AvatarDropdown />
          </div>
        </div>
      </nav>
    </div>
    </TooltipProvider>
  );
}
