import { Component } from 'react'

// Without this, any throw inside an act unmounts the whole tree and the page just goes black,
// which is indistinguishable from a rendering bug. Show what actually broke instead.
export default class Guard extends Component {
  constructor(props) { super(props); this.state = { err: null } }
  static getDerivedStateFromError(err) { return { err } }
  componentDidCatch(err, info) { console.error('[portfolio] act crashed:', err, info) }

  render() {
    if (!this.state.err) return this.props.children
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9000, background: '#0a0708', color: '#ff6a5a',
        font: '13px/1.6 ui-monospace, monospace', padding: '12vh 8vw', overflow: 'auto',
      }}>
        <div style={{ letterSpacing: '0.3em', marginBottom: 18 }}>[CRASH] the act failed to render</div>
        <pre style={{ whiteSpace: 'pre-wrap', color: '#efe7e2' }}>{String(this.state.err?.stack || this.state.err)}</pre>
        <button
          onClick={() => location.reload()}
          style={{ marginTop: 24, padding: '10px 18px', background: 'transparent', color: '#ff6a5a', border: '1px solid #b4342b', font: 'inherit', cursor: 'pointer' }}
        >reload</button>
      </div>
    )
  }
}
