import { ARSENAL } from '../data/projects'
import Scramble from './Scramble'
import { useInView } from '../hooks/useInView'
import './Arsenal.css'

export default function Arsenal() {
  const [ref, inView] = useInView({ threshold: 0.2, once: true })
  let n = 0
  return (
    <section className="section arsenal" id="arsenal" ref={ref}>
      <div className="arsenal__head">
        <span className="kicker">// the arsenal</span>
        <Scramble as="h2" className="arsenal__title" text="What I break things with" />
      </div>
      <div className="arsenal__cols">
        {Object.entries(ARSENAL).map(([cat, tools]) => (
          <div className="arsenal__col" key={cat}>
            <h4 className="arsenal__cat mono">{cat}</h4>
            <ul>
              {tools.map(t => (
                <li key={t} className={`arsenal__tool ${inView ? 'on' : ''}`} style={{ transitionDelay: (n++ * 30) + 'ms' }}>
                  <span className="arsenal__tick mono">▹</span>{t}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
