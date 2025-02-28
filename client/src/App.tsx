import { createSignal, JSX, Show } from "solid-js";
import "./App.css";
import { cn } from "./lib/cn";
import { Dynamic } from "solid-js/web";

function App() {
  return (
    <main>
      <p class="fixed font-bold text-2xl top-4 left-6 hidden md:block">Lorem</p>
      <div class="flex flex-col w-[320px] mx-auto mt-[90px] md:mt-[120px]">
        <div class="flex justify-center mb-12 md:hidden">
          <p class=" font-bold text-2xl">Lorem</p>
        </div>
        <div class="flex justify-center mb-8">
          <p class="font-bold text-3xl">Create an account</p>
        </div>
        <div class="flex flex-col gap-4">
          <LabeledAuthInput label="Email address*" />
          <AuthMainButton label="Continue" />
        </div>
        <div class="pt-8 text-sm text-center">
          <p>
            Already have an account?{" "}
            <a class="text-[var(--primary)] underline" href="#">
              Login
            </a>
          </p>
        </div>
        <OrLine />
        <div class="flex flex-col gap-2">
          <AuthProviderButton
            icon={() => <img width={20} src="/google-logo.svg" />}
            label="Continue with Google"
          />
          <AuthProviderButton
            icon={() => <img width={20} src="/apple-logo.svg" />}
            label="Continue with Apple"
          />
          <AuthProviderButton
            icon={() => <img width={20} src="/microsoft-logo.svg" />}
            label="Continue with Microsoft"
          />
        </div>
      </div>
    </main>
  );
}

function LabeledAuthInput({ label, type }: { label: string; type?: string }) {
  const [focused, setFocused] = createSignal(false);
  const [value, setValue] = createSignal("");

  return (
    <div class="relative group flex">
      <input
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        type={type || "text"}
        class="p-4 border flex-1 rounded-md border-neutral-400 px-6 outline-none text-black focus:border-[var(--primary)] transition-all"
        onInput={(e) => setValue(e.currentTarget.value)}
        value={value()}
      />
      <p
        class={cn(
          "absolute pointer-events-none transition-all bg-white top-1/2 -translate-y-1/2 left-6 text-black/[50%] group-focus-within:text-[var(--primary)]",
          {
            "top-0 left-4 text-xs": value() || focused(),
          }
        )}
      >
        {label}
      </p>
    </div>
  );
}

function AuthMainButton({ label }: { label: string }) {
  return (
    <button class="bg-[var(--primary)] text-white rounded-md p-4 px-6 hover:brightness-90 cursor-pointer">
      {label}
    </button>
  );
}

function AuthProviderButton({
  label,
  icon,
}: {
  label: string;
  icon?: () => JSX.Element;
}) {
  return (
    <button class="border items-center gap-4 border-neutral-400 flex text-black/[70%] rounded-md p-4 px-6 hover:brightness-90 bg-white cursor-pointer">
      <Show when={icon}>
        <Dynamic component={icon} />
      </Show>
      <p>{label}</p>
    </button>
  );
}

function OrLine() {
  return (
    <div class="relative my-8 flex flex-col">
      <div class="h-[1px] bg-neutral-300"></div>
      <p class="px-6 text-black/[70%] bg-white absolute top-1/2 left-1/2 text-sm -translate-x-1/2 -translate-y-1/2">
        OR
      </p>
    </div>
  );
}

export default App;
