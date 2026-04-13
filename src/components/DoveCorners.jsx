export default function DoveCorners({ position = 'both' }) {
  return (
    <>
      {(position === 'both' || position === 'top-left') && (
        <div className="dove-corner dove-corner-top-left">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <g opacity="0.08">
              <ellipse cx="50" cy="50" rx="40" ry="35" fill="none" stroke="currentColor" strokeWidth="1"/>
              <path d="M 50 20 Q 35 35, 30 50 Q 35 45, 50 50 Q 65 45, 70 50 Q 65 35, 50 20" fill="currentColor"/>
              <ellipse cx="25" cy="65" rx="8" ry="12" fill="currentColor"/>
              <ellipse cx="75" cy="65" rx="8" ry="12" fill="currentColor"/>
              <path d="M 45 75 L 50 85 L 55 75" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </g>
          </svg>
        </div>
      )}
      {(position === 'both' || position === 'bottom-right') && (
        <div className="dove-corner dove-corner-bottom-right">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <g opacity="0.08">
              <ellipse cx="50" cy="50" rx="40" ry="35" fill="none" stroke="currentColor" strokeWidth="1"/>
              <path d="M 50 20 Q 35 35, 30 50 Q 35 45, 50 50 Q 65 45, 70 50 Q 65 35, 50 20" fill="currentColor"/>
              <ellipse cx="25" cy="65" rx="8" ry="12" fill="currentColor"/>
              <ellipse cx="75" cy="65" rx="8" ry="12" fill="currentColor"/>
              <path d="M 45 75 L 50 85 L 55 75" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </g>
          </svg>
        </div>
      )}
    </>
  )
}
