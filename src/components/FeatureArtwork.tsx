import './featureArtwork.css'

type ArtworkKind = 'scan' | 'audit' | 'spending'

export function FeatureArtwork({ kind }: { kind: ArtworkKind }) {
  return <div className={`feature-art feature-art--${kind}`} aria-hidden="true">
    {kind === 'scan' && <div className="feature-art__scan-frame">
      <div className="feature-art__sheet"><i /><i /><i /></div>
      <div className="feature-art__scan-beam" />
    </div>}
    {kind === 'audit' && <div className="feature-art__checklist">
      {[0, 1, 2].map(index => <div key={index}><i /><span /></div>)}
    </div>}
    {kind === 'spending' && <div className="feature-art__chart">
      {['28%', '48%', '38%', '68%', '57%', '88%'].map(height => <i key={height} style={{ height }} />)}
    </div>}
  </div>
}
