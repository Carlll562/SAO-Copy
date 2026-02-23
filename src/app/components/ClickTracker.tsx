import { useEffect } from "react";
import { useLocation } from "react-router";
import { useAuth, addAuditLog } from "../context/AuthContext";

export function ClickTracker() {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      try {
        const target = e.target as HTMLElement;
        // Identify clickable elements: buttons, links, inputs of type submit/button, or elements with role="button"
        const clickable = target.closest("button, a, [role='button'], input[type='submit'], input[type='button']");

        if (clickable) {
          const element = clickable as HTMLElement;
          const tagName = element.tagName.toLowerCase();
          
          // Attempt to resolve a meaningful name for the element
          let label = 
            element.getAttribute("aria-label") || 
            element.getAttribute("title") || 
            element.innerText || 
            element.getAttribute("name") ||
            element.id;

          // If label is still empty (e.g. icon-only button without aria-label), try to find an SVG or icon class
          if (!label || label.trim() === "") {
            const icon = element.querySelector("svg, i, span[class*='icon']");
            if (icon) {
               // Try to guess from class names or just call it "Icon Button"
               label = "Icon Button";
               // If it has a lucide icon (often has a class like "lucide-something")
               const classString = icon.getAttribute("class") || "";
               const lucideMatch = classString.match(/lucide-([a-z0-9-]+)/);
               if (lucideMatch) {
                  label = `${lucideMatch[1]} icon`;
               }
            } else {
               label = `<${tagName}>`;
            }
          }

          // Clean up label
          label = label.replace(/\s+/g, ' ').trim().substring(0, 60);

          // Get context
          const path = location.pathname;
          const userEmail = user ? user.email : "Guest";

          addAuditLog({
            category: "Click",
            action: "UI Click",
            status: "Success",
            user: userEmail,
            details: `Clicked "${label}" on ${path}`,
          });
        }
      } catch (error) {
        console.error("ClickTracker error:", error);
      }
    };

    // Use capture phase to ensure we catch events before they might be stopped
    window.addEventListener("click", handleClick, true);
    
    return () => {
      window.removeEventListener("click", handleClick, true);
    };
  }, [location.pathname, user]);

  return null;
}
