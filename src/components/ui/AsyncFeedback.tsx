interface AsyncFeedbackProps {
  title: string;
  description?: string;
}

export function AsyncFeedback({ title, description }: AsyncFeedbackProps) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 px-6 py-8 text-center backdrop-blur-md">
      <p className="font-display text-lg font-semibold tracking-wide text-white">{title}</p>
      {description ? <p className="mt-2 text-sm text-white/80">{description}</p> : null}
    </div>
  );
}
