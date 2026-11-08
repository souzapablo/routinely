// Renders only structural elements, which the design system rule allows anywhere.
export function StructuralElements() {
  return (
    <main>
      <header />
      <nav />
      <section>
        <div />
      </section>
      <aside />
    </main>
  );
}
