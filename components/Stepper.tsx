type Step = { title: string; body: string }

const pad = (n: number) => String(n).padStart(2, '0')

// All steps readable without JS; the SceneDirector dims inactive steps to 20%.
export function Stepper({ steps }: { steps: readonly Step[] }) {
  return (
    <ol data-stepper className="relative">
      {steps.map((s, i) => (
        <li key={s.title} data-step={i} className="hair grid-12 border-t py-8 md:py-10">
          <p className="label col-span-12 text-accent md:col-span-2">
            {pad(i + 1)}/{pad(steps.length)}
          </p>
          <h3 className="display h-md col-span-12 mt-3 md:col-span-4 md:mt-0">{s.title}</h3>
          <p className="prose-w col-span-12 mt-3 text-muted md:col-span-6 md:mt-0">{s.body}</p>
        </li>
      ))}
    </ol>
  )
}
