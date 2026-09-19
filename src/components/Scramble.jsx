import { useScramble } from '../hooks/useScramble'
import { useInView } from '../hooks/useInView'

export default function Scramble({ text, as: Tag = 'span', className, speed = 1, delay = 0, ...rest }) {
  const [ref, inView] = useInView({ threshold: 0.4, once: true })
  const out = useScramble(text, inView, { speed, delay })
  return <Tag ref={ref} className={className} {...rest}>{inView ? out : <span style={{ opacity: 0 }}>{text}</span>}</Tag>
}
