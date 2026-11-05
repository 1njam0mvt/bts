/* Tailwind colours and fonts come from the CSS tokens in src/input.css, so there is one source of truth. */
module.exports = {
  content: ['./views/**/*.js', './public/js/**/*.js'],
  theme: {
    extend: {
      colors: { ink: 'var(--ink)', panel: 'var(--panel)', panel2: 'var(--panel-2)', line: 'var(--line)', fg: 'var(--fg)', muted: 'var(--muted)', violet: 'var(--violet)', violethi: 'var(--violet-hi)', neon: 'var(--neon)' },
      fontFamily: { display: 'var(--font-display)', body: 'var(--font-body)', mono: 'var(--font-mono)' }
    }
  }
};
