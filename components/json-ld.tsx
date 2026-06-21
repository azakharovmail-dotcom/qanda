/** Renders a JSON-LD <script> for rich results. Server component. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe to inline; no user HTML.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
