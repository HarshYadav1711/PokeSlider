interface AsyncFeedbackProps {
  title: string;
  description?: string;
  /** Use status for non-critical messages; default alert for errors. */
  readonly role?: 'alert' | 'status';
}

export function AsyncFeedback({ title, description, role = 'alert' }: AsyncFeedbackProps) {
  return (
    <div
      role={role}
      className="rounded-2xl border border-white/15 bg-white/10 px-6 py-8 text-center backdrop-blur-md"
    >
      <p className="font-display text-lg font-semibold tracking-wide text-white">{title}</p>
      {description ? <p className="mt-2 text-sm text-white/82">{description}</p> : null}
    </div>
  );
}
