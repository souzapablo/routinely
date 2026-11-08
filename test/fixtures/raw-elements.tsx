// Renders every raw element the design system rule forbids outside src/web/ui.
export function RawElements() {
  return (
    <div>
      <button type="button">button</button>
      <input />
      <select />
      <textarea />
      <a href="/">a</a>
      <label>label</label>
      <h1>h1</h1>
      <h2>h2</h2>
      <h3>h3</h3>
      <h4>h4</h4>
      <h5>h5</h5>
      <h6>h6</h6>
      <p>p</p>
      <span>span</span>
    </div>
  );
}
