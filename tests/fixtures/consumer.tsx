import { createRoot, type Root } from "react-dom/client";
import { ProsProvider } from "../../src/library";
import * as Blocks from "../../src/library/consumer";
import type { ComponentType } from "react";

let root: Root | undefined;
let resolvePayment: (() => void) | undefined;
let rejectPayment: (() => void) | undefined;
let requests: Blocks.CheckoutRequest[] = [];

export function mount(
  name: string,
  props: Record<string, unknown> = {},
  integrated = false,
  motion = false,
) {
  if (!root) root = createRoot(document.getElementById("root")!);
  requests = [];
  const Component = (
    Blocks as unknown as Record<string, ComponentType<Record<string, unknown>>>
  )[name];
  root.render(
    <ProsProvider motion={motion}>
      <Component
        {...props}
        {...(integrated
          ? {
              methods: [
                {
                  id: "payment-method-123",
                  label: "Personal card",
                  detail: "Visa ending in 1024",
                },
              ],
              onConfirm: (request: Blocks.CheckoutRequest) => {
                requests.push(request);
                return new Promise<void>((resolve, reject) => {
                  resolvePayment = resolve;
                  rejectPayment = () => reject(new Error("Declined"));
                });
              },
            }
          : {})}
      />
    </ProsProvider>,
  );
}
export function settlePayment(success: boolean) {
  if (success) resolvePayment?.();
  else rejectPayment?.();
}
export function getRequests() {
  return requests;
}
