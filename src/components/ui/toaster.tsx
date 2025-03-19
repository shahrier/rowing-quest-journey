import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider data-oid="6vb5aft">
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} data-oid="vr_pg74">
            <div className="grid gap-1" data-oid="x:7hu6g">
              {title && <ToastTitle data-oid="a9-504t">{title}</ToastTitle>}
              {description && (
                <ToastDescription data-oid="tmpd:lp">
                  {description}
                </ToastDescription>
              )}
            </div>
            {action}
            <ToastClose data-oid="x6ootup" />
          </Toast>
        );
      })}
      <ToastViewport data-oid="-tnn8yf" />
    </ToastProvider>
  );
}
