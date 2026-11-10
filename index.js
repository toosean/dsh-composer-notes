import z from '@deepseek-ai/schemastery'

/**
 * Durable storage for the composer note list. The Client half owns the list
 * semantics; this field is the profile-backed persistence channel.
 */
export const Config = z.object({
  notes: z
    .string()
    .description('Saved composer notes (a JSON array of { id, text, createdAt }).')
    .default('[]')
    .volatile(),
})

/**
 * Host half: expose the notes field as a live settings form and keep the
 * generated Settings page out of the way.
 * @param ctx - Host plugin context.
 */
export function apply(ctx) {
  ctx.inject(['settings'], (child) => {
    child.effect(
      () => child.settings.configure({ auto: false }, ctx.fiber),
      'composer-notes: settings presentation',
    )
  })
}
