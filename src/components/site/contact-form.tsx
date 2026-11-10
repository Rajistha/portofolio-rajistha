"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { submitContactMessage } from "@/lib/actions/contact";

const fieldClass =
  "w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted/60 focus:border-accent/60";

export function ContactForm() {
  const { t } = useLanguage();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [errorText, setErrorText] = useState<string | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await submitContactMessage(formData);
      if (result.error) {
        setStatus("error");
        setErrorText(result.error);
        return;
      }
      setStatus("sent");
      setErrorText(null);
      formRef.current?.reset();
    });
  }

  if (status === "sent") {
    return (
      <div
        role="status"
        className="flex flex-col items-start gap-3 rounded-xl border border-border bg-surface p-6 sm:p-8"
      >
        <CheckCircle2 className="h-6 w-6 text-accent" />
        <p className="text-sm leading-relaxed text-foreground">{t.contact.form.success}</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="text-xs text-muted underline-offset-4 transition-colors hover:text-accent hover:underline"
        >
          {t.contact.form.send}
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-surface/60 p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="mb-1.5 block text-xs text-muted">
            {t.contact.form.name}
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="mb-1.5 block text-xs text-muted">
            {t.contact.form.email}
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            maxLength={120}
            autoComplete="email"
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-subject" className="mb-1.5 block text-xs text-muted">
          {t.contact.form.subject} <span className="text-muted/60">({t.contact.form.subjectOptional})</span>
        </label>
        <input id="contact-subject" name="subject" type="text" maxLength={120} className={fieldClass} />
      </div>

      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-xs text-muted">
          {t.contact.form.message}
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          minLength={10}
          maxLength={3000}
          rows={5}
          placeholder={t.contact.form.messagePlaceholder}
          className={`${fieldClass} resize-y`}
        />
      </div>

      {/* Honeypot — hidden from people and assistive tech; bots tend to fill it.
          The name is deliberately generic so browser autofill doesn't touch it. */}
      <div aria-hidden className="absolute -left-2500 h-0 w-0 overflow-hidden">
        <input type="text" name="hp_token" tabIndex={-1} autoComplete="off" data-lpignore="true" data-1p-ignore />
      </div>

      {status === "error" && (
        <p role="alert" className="text-xs text-red-400">
          {errorText ?? t.contact.form.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {pending ? t.contact.form.sending : t.contact.form.send}
      </button>
    </form>
  );
}
